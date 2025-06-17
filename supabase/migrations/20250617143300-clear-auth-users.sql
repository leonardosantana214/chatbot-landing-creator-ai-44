
-- Excluir todos os usuários do auth (isso vai cascatear e limpar dados relacionados)
DELETE FROM auth.users;

-- Verificar se limpou tudo
SELECT COUNT(*) as total_users FROM auth.users;
