# Independent WhatsApp CRM — secure setup notes

## Database isolation boundary
Create a **new Supabase project** (do not reuse your deployed project). Apply `sql/schema.sql` in its SQL Editor. The SQL removes seeded Codeshape organizations and includes organization code/status, control-plane tables, branches/departments, indexes and RLS policies. Meta access tokens are currently represented as organization columns; for production, prefer encrypting tokens at rest using a server-managed encryption key or an external secrets vault.

## Create the first Super Admin safely
1. In the new project's Supabase Authentication dashboard, create the intended admin user using a unique email/password.
2. Copy that user's UUID from Authentication > Users.
3. Execute this SQL in the new project's SQL Editor, replacing the UUID:
   ```sql
   INSERT INTO public.super_admins(user_id)
   VALUES ('REPLACE-WITH-AUTH-USER-UUID');
   ```
4. Do not grant super-admin privileges by email, browser-side metadata, or client-supplied role. Never expose service-role key in frontend env.

## Environment
Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env`; fill credentials only from the new Supabase project. Backend service-role key stays backend-side. Install dependencies in each package (`npm ci`), then run backend `npm run dev` and frontend `npm run dev`.

## Current implementation status and caveats
This SQL is an initial tenant-aware database foundation, not a guarantee of a fully implemented SaaS control plane. Existing app login still uses the bundled organization selector/demo auth path; organization-code verification and backend-managed Super Admin organization/admin CRUD are not yet implemented. Existing Meta service still references global backend Meta configuration in some operations; per-organization secret resolution and webhook signature verification need implementation. Current webhook resolution uses phone-number ID from organization settings, and must be adapted to the newly introduced columns. Run isolated tenant/security tests before deployment. Do not deploy this archive as production-ready until these gaps are resolved.
