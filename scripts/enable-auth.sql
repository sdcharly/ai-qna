-- Enable auth schema functions
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION auth.role() RETURNS text AS $$
  SELECT nullif(current_setting('request.jwt.claim.role', true), '')::text;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION auth.email() RETURNS text AS $$
  SELECT nullif(current_setting('request.jwt.claim.email', true), '')::text;
$$ LANGUAGE SQL STABLE;

-- Create auth functions
CREATE OR REPLACE FUNCTION auth.check_role_exists() RETURNS void
  LANGUAGE plpgsql
  AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT;
  END IF;
END
$$;

-- Create auth schema functions
CREATE OR REPLACE FUNCTION auth.set_claim(
  uid uuid,
  claim text,
  value jsonb
) RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = uid
  ) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  UPDATE auth.users
  SET raw_app_meta_data =
    COALESCE(raw_app_meta_data, '{}'::jsonb) ||
    json_build_object(claim, value)::jsonb
  WHERE id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO anon, authenticated, service_role;

-- Create auth policies
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Can view own user data" ON auth.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Can update own user data" ON auth.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Enable auth extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgjwt";

-- Call check_role_exists
SELECT auth.check_role_exists();
