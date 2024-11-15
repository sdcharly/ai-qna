-- Enable email authentication
CREATE OR REPLACE FUNCTION auth.email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL AND NEW.email != OLD.email THEN
    NEW.email_change_token = encode(crypto.gen_random_bytes(32), 'base64');
    NEW.email_change = NEW.email;
    NEW.email = OLD.email;
    NEW.email_change_sent_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for email changes
DROP TRIGGER IF EXISTS handle_email_change ON auth.users;
CREATE TRIGGER handle_email_change
  BEFORE UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION auth.email();

-- Enable built-in auth functions
CREATE OR REPLACE FUNCTION auth.authenticate(
  email text,
  password text
) RETURNS auth.users AS $$
DECLARE
  user_data auth.users;
BEGIN
  SELECT * INTO user_data
  FROM auth.users
  WHERE
    auth.users.email = authenticate.email
    AND auth.users.encrypted_password = crypt(password, auth.users.encrypted_password)
    AND auth.users.deleted_at IS NULL;

  IF user_data.id IS NOT NULL THEN
    UPDATE auth.users
    SET last_sign_in_at = now()
    WHERE id = user_data.id;
  END IF;

  RETURN user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
