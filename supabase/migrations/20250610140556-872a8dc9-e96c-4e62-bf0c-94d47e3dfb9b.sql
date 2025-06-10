
-- Adicionar constraint única na tabela mensagens para permitir ON CONFLICT
-- Isso permitirá que o n8n faça INSERT com ON CONFLICT DO UPDATE/NOTHING

-- Primeiro, vamos adicionar uma constraint única no telefone para permitir upserts
ALTER TABLE public.mensagens 
ADD CONSTRAINT unique_mensagens_telefone UNIQUE (telefone);

-- Se você quiser permitir múltiplas mensagens por telefone mas evitar duplicatas exatas,
-- você pode comentar a linha acima e usar esta alternativa:
-- ALTER TABLE public.mensagens 
-- ADD CONSTRAINT unique_mensagens_telefone_user_message 
-- UNIQUE (telefone, user_message, created_at);
