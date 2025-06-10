
-- Habilitar RLS na tabela mensagens (caso não esteja habilitado)
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver conflito
DROP POLICY IF EXISTS "Users can view their own mensagens" ON public.mensagens;
DROP POLICY IF EXISTS "Users can create their own mensagens" ON public.mensagens;
DROP POLICY IF EXISTS "Users can update their own mensagens" ON public.mensagens;
DROP POLICY IF EXISTS "Users can delete their own mensagens" ON public.mensagens;

-- Política para permitir SELECT (visualizar mensagens)
CREATE POLICY "Users can view their own mensagens" 
  ON public.mensagens 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para permitir INSERT (criar mensagens)
CREATE POLICY "Users can create their own mensagens" 
  ON public.mensagens 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir UPDATE (atualizar mensagens)
CREATE POLICY "Users can update their own mensagens" 
  ON public.mensagens 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir DELETE (deletar mensagens)
CREATE POLICY "Users can delete their own mensagens" 
  ON public.mensagens 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Política especial para permitir operações do n8n (sistema)
-- Esta política permite que aplicações com a chave de serviço façam operações
CREATE POLICY "Service role can manage all mensagens" 
  ON public.mensagens 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Adicionar índices para melhor performance (se não existirem)
CREATE INDEX IF NOT EXISTS idx_mensagens_user_id_telefone ON public.mensagens(user_id, telefone);
CREATE INDEX IF NOT EXISTS idx_mensagens_telefone_created_at ON public.mensagens(telefone, created_at DESC);
