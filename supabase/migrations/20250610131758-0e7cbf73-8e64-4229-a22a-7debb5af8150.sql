
-- Criar tabela de mensagens
CREATE TABLE public.mensagens (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  telefone TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  user_message TEXT NOT NULL,
  bot_message TEXT NOT NULL,
  ativo BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para mensagens
CREATE POLICY "Users can view their own mensagens" 
  ON public.mensagens 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mensagens" 
  ON public.mensagens 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mensagens" 
  ON public.mensagens 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mensagens" 
  ON public.mensagens 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar índices para melhor performance
CREATE INDEX idx_mensagens_telefone ON public.mensagens(telefone);
CREATE INDEX idx_mensagens_user_id ON public.mensagens(user_id);
CREATE INDEX idx_mensagens_created_at ON public.mensagens(created_at);
CREATE INDEX idx_mensagens_ativo ON public.mensagens(ativo);

-- Função para relacionar mensagens com contatos existentes
CREATE OR REPLACE FUNCTION public.link_mensagem_to_contact()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se existe um contato com esse telefone para o mesmo usuário
  IF EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE phone = NEW.telefone 
    AND user_id = NEW.user_id
  ) THEN
    -- Se existe, a mensagem pode ser criada
    RETURN NEW;
  ELSE
    -- Se não existe, criar um novo contato automaticamente
    INSERT INTO public.contacts (user_id, name, phone, created_at)
    VALUES (NEW.user_id, 'Contato', NEW.telefone, NEW.created_at)
    ON CONFLICT (phone) DO NOTHING;
    
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para executar a função antes de inserir mensagem
CREATE TRIGGER trigger_link_mensagem_contact
  BEFORE INSERT ON public.mensagens
  FOR EACH ROW
  EXECUTE FUNCTION public.link_mensagem_to_contact();
