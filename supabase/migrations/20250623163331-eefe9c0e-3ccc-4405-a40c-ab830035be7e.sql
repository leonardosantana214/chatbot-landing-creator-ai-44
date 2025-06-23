
-- Modificar o trigger para criar automaticamente clientes não cadastrados
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
      -- Cliente não existe em contacts, criar automaticamente nas duas tabelas
      -- Primeiro criar na tabela contacts
      INSERT INTO public.contacts (user_id, name, phone, email, created_at)
      VALUES (NEW.user_id, NEW.nome_cliente, NEW.telefone, NEW.email, NEW.created_at)
      ON CONFLICT (phone) DO NOTHING;
      
      -- Depois criar na tabela clientes
      INSERT INTO public.clientes (user_id, user_nome, telefone, email)
      VALUES (NEW.user_id, NEW.nome_cliente, NEW.telefone, NEW.email)
      ON CONFLICT (telefone) DO NOTHING;
      
      RETURN NEW;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;
