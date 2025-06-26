
-- Limpar todos os usuários do auth (isso vai cascatear e limpar dados relacionados)
DELETE FROM auth.users;

-- Limpar também os perfis de usuário para garantir consistência
DELETE FROM public.user_profiles;

-- Limpar configurações de chatbot relacionadas
DELETE FROM public.chatbot_configs;

-- Verificar se limpou tudo
SELECT COUNT(*) as total_users FROM auth.users;
SELECT COUNT(*) as total_profiles FROM public.user_profiles;
SELECT COUNT(*) as total_chatbots FROM public.chatbot_configs;
