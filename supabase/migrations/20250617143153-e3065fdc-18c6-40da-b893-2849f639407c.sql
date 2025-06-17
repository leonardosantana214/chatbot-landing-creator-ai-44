
-- Excluir todos os dados da tabela clientes
DELETE FROM public.clientes;

-- Resetar a sequência do ID para começar do 1 novamente
ALTER SEQUENCE clientes_id_seq RESTART WITH 1;
