
-- Criar tabela interesse
CREATE TABLE public.interesse (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir os registros de interesse
INSERT INTO public.interesse (key) VALUES
  ('metal'),
  ('rubber'),
  ('textile'),
  ('plastic'),
  ('used-oil'),
  ('forestry-and-land-use'),
  ('renewable-energy'),
  ('energy-efficiency-and-fuel-substitution'),
  ('waste-and-biomass'),
  ('industry-and-processes');

-- Adicionar novos campos à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS company_role TEXT,
ADD COLUMN IF NOT EXISTS company_website TEXT,
ADD COLUMN IF NOT EXISTS nif_cnpj TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS onde_ouviu TEXT,
ADD COLUMN IF NOT EXISTS interesses_ids UUID[];

-- Atualizar a função handle_new_user para incluir os novos campos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    name, 
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
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
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
