
-- Limpar COMPLETAMENTE todos os dados do banco incluindo auth.users
DELETE FROM public.messages;
DELETE FROM public.chats;
DELETE FROM public.contacts;
DELETE FROM public.chatbot_configs;
DELETE FROM public.mensagens;
DELETE FROM public.consulta;
DELETE FROM public.clientes;
DELETE FROM public.user_profiles;
DELETE FROM auth.users;

-- Resetar sequences
ALTER SEQUENCE IF EXISTS clientes_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS consulta_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS mensagens_id_seq RESTART WITH 1;

-- Garantir que as colunas para INSTANCE_ID estão corretas
ALTER TABLE public.user_profiles 
DROP COLUMN IF EXISTS real_instance_id,
ADD COLUMN IF NOT EXISTS instance_id TEXT,
ADD COLUMN IF NOT EXISTS instance_name TEXT;

-- Melhorar a tabela chatbot_configs para capturar INSTANCE_ID corretamente
ALTER TABLE public.chatbot_configs 
ADD COLUMN IF NOT EXISTS real_instance_id TEXT,
ADD COLUMN IF NOT EXISTS instance_id_captured TEXT;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_instance_id ON public.user_profiles(instance_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_configs_real_instance_id ON public.chatbot_configs(real_instance_id);

-- Função melhorada para capturar INSTANCE_ID no cadastro
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
    instance_name,
    connection_status
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email,
    new.raw_user_meta_data->>'company',
    new.raw_user_meta_data->>'area',
    new.raw_user_meta_data->>'whatsapp',
    new.raw_user_meta_data->>'instance_id',
    new.raw_user_meta_data->>'instance_name',
    'pending'
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Verificar limpeza
SELECT 'Tabela' as tipo, 'auth.users' as nome, COUNT(*) as total FROM auth.users
UNION ALL
SELECT 'Tabela' as tipo, 'user_profiles' as nome, COUNT(*) as total FROM public.user_profiles
UNION ALL
SELECT 'Tabela' as tipo, 'chatbot_configs' as nome, COUNT(*) as total FROM public.chatbot_configs;
