
-- 1. Primeiro, vamos verificar se existem duplicatas na tabela mensagens
SELECT telefone, user_id, COUNT(*) as total
FROM public.mensagens 
GROUP BY telefone, user_id 
HAVING COUNT(*) > 1;

-- 2. Verificar se o mesmo telefone tem user_ids diferentes
SELECT telefone, COUNT(DISTINCT user_id) as diferentes_user_ids, 
       array_agg(DISTINCT user_id) as user_ids
FROM public.mensagens 
GROUP BY telefone 
HAVING COUNT(DISTINCT user_id) > 1;

-- 3. Criar constraint para garantir que um telefone só pode ter UM user_id
-- Primeiro, vamos limpar dados inconsistentes (manter apenas o user_id mais recente por telefone)
WITH telefone_user_correto AS (
  SELECT DISTINCT ON (telefone) telefone, user_id
  FROM public.mensagens 
  ORDER BY telefone, created_at DESC
)
DELETE FROM public.mensagens m1
WHERE EXISTS (
  SELECT 1 FROM public.mensagens m2 
  WHERE m2.telefone = m1.telefone 
  AND m2.user_id != m1.user_id 
  AND m2.created_at > m1.created_at
);

-- 4. Criar constraint única para telefone + user_id (um telefone = um user_id)
ALTER TABLE public.mensagens 
DROP CONSTRAINT IF EXISTS unique_telefone_user_id;

ALTER TABLE public.mensagens 
ADD CONSTRAINT unique_telefone_user_id 
UNIQUE (telefone, user_id);

-- 5. Criar função para verificar consistência antes de inserir
CREATE OR REPLACE FUNCTION public.check_telefone_user_consistency()
RETURNS TRIGGER AS $$
DECLARE
  existing_user_id UUID;
BEGIN
  -- Verificar se já existe uma mensagem para este telefone com user_id diferente
  SELECT user_id INTO existing_user_id 
  FROM public.mensagens 
  WHERE telefone = NEW.telefone 
  AND user_id != NEW.user_id 
  LIMIT 1;
  
  -- Se encontrou user_id diferente, rejeitar inserção
  IF existing_user_id IS NOT NULL THEN
    RAISE EXCEPTION 'ERRO CRÍTICO: Telefone % já está associado ao user_id %. Não é possível associar ao user_id %', 
      NEW.telefone, existing_user_id, NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para executar a verificação antes de cada inserção
DROP TRIGGER IF EXISTS trigger_check_telefone_user_consistency ON public.mensagens;

CREATE TRIGGER trigger_check_telefone_user_consistency
  BEFORE INSERT ON public.mensagens
  FOR EACH ROW
  EXECUTE FUNCTION public.check_telefone_user_consistency();

-- 7. Verificação final - mostrar telefones únicos com seus user_ids
SELECT telefone, user_id, COUNT(*) as total_mensagens
FROM public.mensagens 
GROUP BY telefone, user_id 
ORDER BY telefone;
