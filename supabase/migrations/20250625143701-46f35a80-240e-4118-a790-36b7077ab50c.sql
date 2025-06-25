
-- Limpar todas as tabelas na ordem correta para evitar conflitos de foreign key

-- 1. Limpar tabelas de mensagens e chats primeiro
DELETE FROM public.messages;
DELETE FROM public.chats;
DELETE FROM public.mensagens;

-- 2. Limpar tabelas de consultas e clientes
DELETE FROM public.consulta;
DELETE FROM public.clientes;

-- 3. Limpar tabelas de contatos e configurações
DELETE FROM public.contacts;
DELETE FROM public.chatbot_configs;

-- 4. Limpar perfis de usuário
DELETE FROM public.user_profiles;

-- 5. Limpar todos os usuários do auth (isso vai cascatear e limpar dados relacionados)
DELETE FROM auth.users;

-- 6. Resetar sequências para começar do 1 novamente
ALTER SEQUENCE IF EXISTS clientes_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS consulta_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS mensagens_id_seq RESTART WITH 1;

-- 7. Verificar se tudo foi limpo
SELECT 
  'auth.users' as tabela, COUNT(*) as total FROM auth.users
UNION ALL
SELECT 
  'user_profiles' as tabela, COUNT(*) as total FROM public.user_profiles
UNION ALL
SELECT 
  'chatbot_configs' as tabela, COUNT(*) as total FROM public.chatbot_configs
UNION ALL
SELECT 
  'contacts' as tabela, COUNT(*) as total FROM public.contacts
UNION ALL
SELECT 
  'mensagens' as tabela, COUNT(*) as total FROM public.mensagens
UNION ALL
SELECT 
  'messages' as tabela, COUNT(*) as total FROM public.messages
UNION ALL
SELECT 
  'chats' as tabela, COUNT(*) as total FROM public.chats
UNION ALL
SELECT 
  'clientes' as tabela, COUNT(*) as total FROM public.clientes
UNION ALL
SELECT 
  'consulta' as tabela, COUNT(*) as total FROM public.consulta;
