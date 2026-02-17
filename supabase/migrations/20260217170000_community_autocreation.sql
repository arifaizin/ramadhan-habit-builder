
-- Update handle_new_user to ensure community exists before profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  community_code_val text;
BEGIN
  community_code_val := COALESCE(NEW.raw_user_meta_data->>'community_code', '');
  
  -- Ensure community exists
  IF community_code_val <> '' THEN
    INSERT INTO public.communities (code, name)
    VALUES (community_code_val, community_code_val)
    ON CONFLICT (code) DO NOTHING;
  END IF;

  INSERT INTO public.profiles (id, name, email, community_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    community_code_val
  );
  RETURN NEW;
END;
$$;

-- RLS Policy to allow authenticated users to read communities (already exists in first migration)
-- But we might want to allow them to search/insert if we ever move logic to frontend
-- For now, the SECURITY DEFINER function handles the insertion.
