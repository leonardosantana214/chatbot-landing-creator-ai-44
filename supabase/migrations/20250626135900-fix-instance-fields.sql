
-- Limpar dados de teste e garantir estrutura correta
DELETE FROM auth.users;
DELETE FROM public.user_profiles;
DELETE FROM public.chatbot_configs;
DELETE FROM public.contacts;
DELETE FROM public.messages;
DELETE FROM public.chats;

-- Garantir que as colunas instance_id e instance_name existem na tabela user_profiles
ALTER TABLE public.user_profiles 
DROP COLUMN IF EXISTS instance_id,
DROP COLUMN IF EXISTS instance_name;

ALTER TABLE public.user_profiles 
ADD COLUMN instance_id text,
ADD COLUMN instance_name text;

-- Garantir que as colunas existem na tabela chatbot_configs
ALTER TABLE public.chatbot_configs 
DROP COLUMN IF EXISTS real_instance_id;

ALTER TABLE public.chatbot_configs 
ADD COLUMN real_instance_id text;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_instance_id ON public.user_profiles(instance_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_instance_name ON public.user_profiles(instance_name);
CREATE INDEX IF NOT EXISTS idx_chatbot_configs_real_instance_id ON public.chatbot_configs(real_instance_id);

-- Comentários para documentar os campos
COMMENT ON COLUMN public.user_profiles.instance_id IS 'ID único da instância gerado pelo sistema';
COMMENT ON COLUMN public.user_profiles.instance_name IS 'Nome da instância usado na Evolution API';
COMMENT ON COLUMN public.chatbot_configs.real_instance_id IS 'ID real da instância para referência cruzada';
