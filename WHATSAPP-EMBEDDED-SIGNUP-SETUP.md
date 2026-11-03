# WhatsApp Embedded Signup Integration Setup

This project now has organization-level WhatsApp Cloud API connection handling. Run the SQL and configure Meta before trying to connect an organization.

## 1. Supabase SQL

Run `backend/sql/organization-whatsapp-connections.sql` in the SQL Editor of the CRM's new Supabase project. This creates a separate row per organization and stores the access token encrypted by the backend. Browser RLS access is not granted for this credential table.

## 2. Backend environment

Copy `backend/.env.example` to `backend/.env` and fill:
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for this CRM's own Supabase project.
- `META_APP_ID` and `META_APP_SECRET` from Meta Developers.
- `META_EMBEDDED_SIGNUP_CONFIG_ID` with the Embedded Signup configuration ID.
- `META_VERIFY_TOKEN` for webhook verification.
- `WHATSAPP_ENCRYPTION_KEY`: generate a cryptographically random 32-byte key and encode as 64 hex characters. Keep it stable; changing it without re-encrypting rows makes saved tokens unreadable.
- `FRONTEND_URL` with the frontend origin.

Never put the Supabase service role key, Meta App Secret, or encryption key in the frontend environment.

## 3. Frontend environment

Copy `frontend/.env.example` to `frontend/.env` and set public Supabase client variables, API URL, Meta App ID, and Embedded Signup Config ID. Meta App ID and config ID are public identifiers; the App Secret is backend-only.

## 4. Meta Developer setup

In Meta Developers configure WhatsApp Business Platform and Facebook Login for Business / Embedded Signup. Configure allowed domains and the Embedded Signup flow to return the WhatsApp Business Account and selected phone number IDs. Add webhook callback URL:

`https://YOUR_BACKEND_DOMAIN/api/webhooks/whatsapp`

Set webhook verify token to exactly `META_VERIFY_TOKEN`, subscribe the app to the WhatsApp `messages` webhook field, and ensure the Meta app has the required WhatsApp Business permissions approved for production.

## 5. Test

1. Start backend and frontend.
2. Sign in as an organization owner/admin.
3. Open Settings and click Connect WhatsApp.
4. Complete Meta signup and select a WABA and phone.
5. Confirm Settings shows Connected and the display number.
6. Load templates and send a campaign from that organization.
7. Connect another organization with another WABA/phone and verify sends and webhook events remain tenant-scoped.

## Implementation notes

- Campaign sending and template management now look up the current organization's encrypted token and phone/WABA IDs.
- Incoming webhook events resolve tenant by the registered `phone_number_id` in the connections table.
- Webhook HMAC validation is enabled when `META_APP_SECRET` is configured.
- The existing CRM pages and styling were retained; Settings gains the WhatsApp connection panel.
- Verify your Meta Embedded Signup configuration's postMessage event payload in your app environment. The frontend expects `WA_EMBEDDED_SIGNUP` with `event: FINISH` and `data.waba_id` plus `data.phone_number_id`.
