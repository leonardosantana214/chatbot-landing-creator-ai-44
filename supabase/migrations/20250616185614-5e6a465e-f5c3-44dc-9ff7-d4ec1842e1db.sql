
-- Limpar todos os usuários do auth (isso vai cascatear e limpar dados relacionados)
DELETE FROM auth.users;

-- Resetar a sequência de IDs se necessário
-- (Supabase gerencia automaticamente os UUIDs, então não precisamos resetar)

-- Verificar se limpou tudo
SELECT COUNT(*) as total_users FROM auth.users;
