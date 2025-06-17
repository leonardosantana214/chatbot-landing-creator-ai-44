
-- Adicionar coluna instance_id na tabela de perfis/usuários
-- Como não temos uma tabela profiles, vou criar uma para armazenar dados dos usuários
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  company TEXT,
  area TEXT,
  whatsapp TEXT,
  instance_id TEXT,
  instance_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_profiles
CREATE POLICY "Users can view their own profile" 
  ON public.user_profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.user_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Política para service role (N8N) acessar todos os dados
CREATE POLICY "Service role can access all profiles" 
  ON public.user_profiles 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Função para criar perfil automaticamente quando usuário for criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, 
    name, 
    email, 
    company, 
    area, 
    whatsapp, 
    instance_id, 
    instance_name
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email,
    new.raw_user_meta_data->>'company',
    new.raw_user_meta_data->>'area',
    new.raw_user_meta_data->>'whatsapp',
    new.raw_user_meta_data->>'instance_id',
    new.raw_user_meta_data->>'instance_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função quando usuário for criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Índice para consultas rápidas por instance_id (muito útil para N8N!)
CREATE INDEX IF NOT EXISTS idx_user_profiles_instance_id ON public.user_profiles(instance_id);
