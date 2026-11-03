create extension if not exists pgcrypto;
create table if not exists public.organizations (
 id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null,
 type text not null check(type in ('Hospital','School','Hotel','Business')), location text not null default '',
 settings jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.organization_members (
 organization_id uuid not null references public.organizations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null default 'admin' check(role in ('owner','admin','staff','viewer')),
 created_at timestamptz not null default now(), primary key(organization_id,user_id)
);
create table if not exists public.contacts (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 name text not null, phone text not null, email text, group_name text, opted_in boolean not null default false,
 consent_source text, consent_updated_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(organization_id,phone)
);
create index if not exists contacts_org_group_idx on public.contacts(organization_id,group_name);
create index if not exists contacts_org_phone_idx on public.contacts(organization_id,phone);
create table if not exists public.templates (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 meta_name text not null, language text not null default 'en_US', category text, status text not null default 'pending', body text,
 created_at timestamptz not null default now(), unique(organization_id,meta_name,language)
);
create table if not exists public.campaigns (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 name text not null, template_name text not null, language text not null default 'en_US', group_name text,
 status text not null default 'draft', scheduled_at timestamptz, recipient_count integer not null default 0,
 sent_count integer not null default 0, failed_count integer not null default 0, created_by uuid references auth.users(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.messages (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 campaign_id uuid not null references public.campaigns(id) on delete cascade, contact_id uuid not null references public.contacts(id) on delete cascade,
 status text not null default 'queued', meta_message_id text unique, sent_at timestamptz, delivered_at timestamptz, read_at timestamptz,
 last_error text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(campaign_id,contact_id)
);
create index if not exists messages_org_created_idx on public.messages(organization_id,created_at desc);
create index if not exists messages_status_idx on public.messages(organization_id,status);
-- Enable RLS for direct browser access. The server uses the service role only after checking Auth and organization membership.
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.contacts enable row level security;
alter table public.templates enable row level security;
alter table public.campaigns enable row level security;
alter table public.messages enable row level security;
-- No anonymous/public policies are created intentionally. Access through authenticated backend routes.
ALTER TABLE public.messages
  ALTER COLUMN campaign_id DROP NOT NULL;

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS direction text
    NOT NULL DEFAULT 'outgoing',
  ADD COLUMN IF NOT EXISTS message_type text,
  ADD COLUMN IF NOT EXISTS message_body text,
  ADD COLUMN IF NOT EXISTS message_timestamp timestamptz,
  ADD COLUMN IF NOT EXISTS sender_phone text,
  ADD COLUMN IF NOT EXISTS recipient_phone text,
  ADD COLUMN IF NOT EXISTS raw_payload jsonb;

CREATE INDEX IF NOT EXISTS messages_contact_history_idx
  ON public.messages (
    organization_id,
    contact_id,
    message_timestamp DESC
  );

CREATE INDEX IF NOT EXISTS messages_meta_id_idx
  ON public.messages (meta_message_id);

ALTER TABLE public.messages
  ADD CONSTRAINT messages_direction_check
  CHECK (direction IN ('incoming', 'outgoing'));

-- Independent multi-organization control-plane additions.
-- Run only in a newly-created Supabase project/database.
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS organization_code text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','inactive')),
  ADD COLUMN IF NOT EXISTS whatsapp_business_account_id text,
  ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id text,
  ADD COLUMN IF NOT EXISTS whatsapp_access_token text;

CREATE UNIQUE INDEX IF NOT EXISTS organizations_code_unique
  ON public.organizations (lower(organization_code))
  WHERE organization_code IS NOT NULL;

-- Super-admin authorization is explicit and is never inferred from email.
CREATE TABLE IF NOT EXISTS public.super_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);
CREATE INDEX IF NOT EXISTS branches_org_idx ON public.branches(organization_id);

CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);
CREATE INDEX IF NOT EXISTS departments_org_branch_idx
  ON public.departments(organization_id, branch_id);

-- Organization tenant authorization helper functions.
CREATE OR REPLACE FUNCTION public.is_org_member(target_org uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members m
    JOIN public.organizations o ON o.id = m.organization_id
    WHERE m.organization_id = target_org
      AND m.user_id = auth.uid()
      AND o.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(target_org uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members m
    JOIN public.organizations o ON o.id = m.organization_id
    WHERE m.organization_id = target_org
      AND m.user_id = auth.uid()
      AND m.role IN ('owner','admin')
      AND o.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins s WHERE s.user_id = auth.uid()
  );
$$;

ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- RLS is enabled for all CRM tenant tables; policies constrain authenticated
-- browser access. Backend service-role use must still apply tenant predicates.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['organizations','organization_members','contacts',
    'templates','campaigns','messages','branches','departments']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS org_members_read_own ON public.organization_members;
CREATE POLICY org_members_read_own ON public.organization_members
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS organizations_member_read ON public.organizations;
CREATE POLICY organizations_member_read ON public.organizations
  FOR SELECT TO authenticated USING (public.is_org_member(id) OR public.is_super_admin());

DROP POLICY IF EXISTS contacts_tenant_all ON public.contacts;
CREATE POLICY contacts_tenant_all ON public.contacts
  FOR ALL TO authenticated USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS templates_tenant_all ON public.templates;
CREATE POLICY templates_tenant_all ON public.templates
  FOR ALL TO authenticated USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS campaigns_tenant_all ON public.campaigns;
CREATE POLICY campaigns_tenant_all ON public.campaigns
  FOR ALL TO authenticated USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS messages_tenant_all ON public.messages;
CREATE POLICY messages_tenant_all ON public.messages
  FOR ALL TO authenticated USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS branches_tenant_all ON public.branches;
CREATE POLICY branches_tenant_all ON public.branches
  FOR ALL TO authenticated USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS departments_tenant_all ON public.departments;
CREATE POLICY departments_tenant_all ON public.departments
  FOR ALL TO authenticated USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS super_admin_self_read ON public.super_admins;
CREATE POLICY super_admin_self_read ON public.super_admins
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- No anon policies are intentionally created.
