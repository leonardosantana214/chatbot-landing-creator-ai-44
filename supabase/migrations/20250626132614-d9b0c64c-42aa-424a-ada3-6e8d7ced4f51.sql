
-- Limpar COMPLETAMENTE todos os dados do banco
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

-- Remover o trigger problemático que estava causando conflitos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Garantir que a tabela user_profiles está com a estrutura correta
ALTER TABLE public.user_profiles 
DROP COLUMN IF EXISTS connection_status,
DROP COLUMN IF EXISTS qr_code_required,
DROP COLUMN IF EXISTS evolution_phone,
DROP COLUMN IF EXISTS real_instance_id;

-- Adicionar todas as colunas necessárias de uma vez
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS instance_id TEXT,
ADD COLUMN IF NOT EXISTS instance_name TEXT,
ADD COLUMN IF NOT EXISTS connection_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS qr_code_required BOOLEAN DEFAULT false;

-- Garantir que a tabela chatbot_configs tem todas as colunas necessárias
ALTER TABLE public.chatbot_configs 
ADD COLUMN IF NOT EXISTS instance_name TEXT,
ADD COLUMN IF NOT EXISTS real_instance_id TEXT,
ADD COLUMN IF NOT EXISTS connection_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS phone_connected TEXT,
ADD COLUMN IF NOT EXISTS qr_completed BOOLEAN DEFAULT false;

-- Verificar limpeza
SELECT 'Usuários auth:' as tabela, COUNT(*) as total FROM auth.users
UNION ALL
SELECT 'Perfis usuários:' as tabela, COUNT(*) as total FROM public.user_profiles
UNION ALL
SELECT 'Configs chatbot:' as tabela, COUNT(*) as total FROM public.chatbot_configs;
