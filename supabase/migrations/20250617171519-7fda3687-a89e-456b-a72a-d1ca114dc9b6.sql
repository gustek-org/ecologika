
-- Remover a coluna documents que não é mais utilizada
ALTER TABLE public.profiles DROP COLUMN IF EXISTS documents;

-- Remover a coluna name (será substituída por first_name e last_name que já existem)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS name;

-- Atualizar a função handle_new_user para corrigir a persistência dos dados
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    company, 
    location, 
    is_approved,
    first_name,
    last_name,
    company_role,
    company_website,
    nif_cnpj,
    address,
    country,
    city,
    phone,
    onde_ouviu,
    interesses_ids
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'companyWebsite', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', '') || ', ' || COALESCE(NEW.raw_user_meta_data->>'country', ''),
    TRUE,
    COALESCE(NEW.raw_user_meta_data->>'firstName', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
    COALESCE(NEW.raw_user_meta_data->>'companyRole', ''),
    COALESCE(NEW.raw_user_meta_data->>'companyWebsite', ''),
    COALESCE(NEW.raw_user_meta_data->>'nifCnpj', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'aboutCompany', ''),
    CASE 
      WHEN NEW.raw_user_meta_data->>'interessesIds' IS NOT NULL 
      THEN string_to_array(NEW.raw_user_meta_data->>'interessesIds', ',')::UUID[]
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$;
