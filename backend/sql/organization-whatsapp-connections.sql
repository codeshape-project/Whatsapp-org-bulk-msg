-- Run this in the NEW CRM Supabase project's SQL Editor.
create table if not exists public.organization_whatsapp_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  waba_id text not null,
  phone_number_id text not null,
  access_token_encrypted text not null,
  business_name text,
  display_phone_number text,
  status text not null default 'connected' check (status in ('connected','disconnected','error')),
  last_error text,
  connected_at timestamptz not null default now(),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_whatsapp_phone_number_id_unique unique(phone_number_id)
);
create index if not exists organization_whatsapp_connections_org_idx
  on public.organization_whatsapp_connections(organization_id);
create index if not exists organization_whatsapp_connections_phone_idx
  on public.organization_whatsapp_connections(phone_number_id);
alter table public.organization_whatsapp_connections enable row level security;
-- Access to this table is intentionally backend service-role only. Never expose tokens to browser clients.
