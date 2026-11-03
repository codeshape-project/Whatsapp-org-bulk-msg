-- Run in the NEW Supabase project's SQL editor after creating the identity in
-- Supabase Authentication > Users. Replace the placeholder with the auth user UUID.
-- Keep this script out of public/client code.
INSERT INTO public.super_admins (user_id)
VALUES ('REPLACE_WITH_AUTH_USER_UUID'::uuid)
ON CONFLICT (user_id) DO NOTHING;
