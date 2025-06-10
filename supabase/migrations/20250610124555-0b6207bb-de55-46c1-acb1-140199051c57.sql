
-- Criar tabela de clientes
CREATE TABLE public.clientes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  user_nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de consultas
CREATE TABLE public.consulta (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  profissional TEXT DEFAULT 'Não especificado',
  protocolo TEXT NOT NULL,
  horario TIMESTAMP WITH TIME ZONE NOT NULL,
  tipo_atendimento TEXT NOT NULL,
  nome_cliente TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  id_evento TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consulta ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para clientes
CREATE POLICY "Users can view their own clientes" 
  ON public.clientes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clientes" 
  ON public.clientes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clientes" 
  ON public.clientes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clientes" 
  ON public.clientes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para consultas
CREATE POLICY "Users can view their own consultas" 
  ON public.consulta 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own consultas" 
  ON public.consulta 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consultas" 
  ON public.consulta 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own consultas" 
  ON public.consulta 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar índices para melhor performance
CREATE INDEX idx_clientes_telefone ON public.clientes(telefone);
CREATE INDEX idx_clientes_user_id ON public.clientes(user_id);
CREATE INDEX idx_consulta_telefone ON public.consulta(telefone);
CREATE INDEX idx_consulta_user_id ON public.consulta(user_id);
CREATE INDEX idx_consulta_horario ON public.consulta(horario);

-- Função para relacionar consultas com clientes existentes baseado no telefone
CREATE OR REPLACE FUNCTION public.link_consulta_to_existing_cliente()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se existe um cliente com esse telefone para o mesmo usuário
  IF EXISTS (
    SELECT 1 FROM public.clientes 
    WHERE telefone = NEW.telefone 
    AND user_id = NEW.user_id
  ) THEN
    -- Se existe, a consulta pode ser criada
    RETURN NEW;
  ELSE
    -- Se não existe, verificar se o telefone está na tabela contacts
    IF EXISTS (
      SELECT 1 FROM public.contacts 
      WHERE phone = NEW.telefone 
      AND user_id = NEW.user_id
    ) THEN
      -- Cliente existe na tabela contacts, criar entrada na tabela clientes
      INSERT INTO public.clientes (user_id, user_nome, telefone, email)
      VALUES (NEW.user_id, NEW.nome_cliente, NEW.telefone, NEW.email)
      ON CONFLICT (telefone) DO NOTHING;
      
      RETURN NEW;
    ELSE
      -- Cliente não existe, rejeitar a inserção
      RAISE EXCEPTION 'Cliente com telefone % não está cadastrado no sistema', NEW.telefone;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para executar a função antes de inserir consulta
CREATE TRIGGER trigger_link_consulta_cliente
  BEFORE INSERT ON public.consulta
  FOR EACH ROW
  EXECUTE FUNCTION public.link_consulta_to_existing_cliente();
