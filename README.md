# WhatsApp CRM — independent multi-organization foundation

This archive starts from the supplied React + Vite + Tailwind frontend and Express backend and retains the existing CRM screens/modules. It includes a new-project Supabase SQL foundation with organization codes/status, super-admin identity registry, branches/departments, tenant RLS policies, and no seeded Codeshape organizations.

## Setup
1. Create a brand-new Supabase project (not the previous/deployed one).
2. Apply `backend/sql/schema.sql` using that new project's SQL editor.
3. Follow `backend/README-SECURE-SETUP.md` for creating the first Super Admin UUID record.
4. Copy `.env.example` files in backend and frontend to `.env` and configure the new project.
5. `cd backend && npm ci && npm run dev`; in another terminal `cd frontend && npm ci && npm run dev`.

## Security warning / implementation status
The supplied codebase currently has a demo organization-data dependency and its login path does not validate an organization code server-side. Super-admin CRUD, complete organization-code authentication, per-tenant Meta credential resolution, and end-to-end security testing remain unfinished in this prepared archive. Do not treat it as production-ready or use live WhatsApp tokens until those items are completed and tested. SQL schema changes do not provision a cloud database automatically.

## Super Admin and organization-code login

1. Provision a **new** Supabase project. Do not reuse the previous CRM database.
2. Apply `backend/sql/schema.sql` in the new project's SQL editor (it contains the organizations organization_code/status fields and `super_admins` table).
3. Copy `backend/.env.example` to `backend/.env`; set the new project's Supabase URL and service-role key. The service-role key must remain backend-only.
4. Copy `frontend/.env.example` to `frontend/.env`; configure the same new project's URL and publishable/anon key and set `VITE_USE_BACKEND=true`.
5. Create the initial Super Admin identity in Supabase Authentication (email/password) using a secure administrator process. Then insert that auth user's UUID into `public.super_admins` from the SQL editor:
   `insert into public.super_admins(user_id) values ('AUTH_USER_UUID');`
   Do not expose or commit the service-role key.
6. Start backend (`cd backend && npm install && npm run dev`) and frontend (`cd frontend && npm install && npm run dev`).
7. Use the shared `/login` page. Choose Super Admin for email/password only, or Organization for email/password plus organization code.
8. Super Admin can manually enter an organization code, create organization admin accounts, and activate/deactivate organizations.

The backend's `/api/auth/verify-login` endpoint validates Supabase Auth credentials via the authenticated access token, then checks super-admin status or organization code, membership and active status. `/api/super-admin/*` endpoints require super-admin membership on each request. Organization admin passwords are created via Supabase Auth Admin API and should be delivered securely and rotated by the recipient.

**Testing note:** These new control-plane flows need to be exercised against a separately provisioned Supabase project. Creating cloud resources, verifying Meta live credentials, and live end-to-end tenant tests require project credentials and have not been run in this source-editing environment.
