-- Security hardening for public.users.
-- The application uses the server-side database role for auth; Supabase API
-- roles must not be able to read or write this table directly.

ALTER TABLE IF EXISTS public.users
  RENAME COLUMN password TO password_hash;

ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.postback_credentials ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE public.users FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE public.users FROM authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE public.postback_credentials FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE public.postback_credentials FROM authenticated;
  END IF;
END
$$;

-- Intentionally no RLS policies are created. With RLS enabled and no policy,
-- PostgREST/API access is denied for both sensitive tables. The backend's
-- database owner/service role continues to serve application requests.
