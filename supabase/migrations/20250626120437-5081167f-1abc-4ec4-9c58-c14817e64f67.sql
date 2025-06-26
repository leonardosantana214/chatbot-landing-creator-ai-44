
-- Limpar todos os dados das tabelas para começar do zero
DELETE FROM public.messages;
DELETE FROM public.chats;
DELETE FROM public.contacts;
DELETE FROM public.chatbot_configs;
DELETE FROM public.mensagens;
DELETE FROM public.consulta;
DELETE FROM public.clientes;
DELETE FROM public.user_profiles;

-- Resetar as sequences se necessário
ALTER SEQUENCE IF EXISTS clientes_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS consulta_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS mensagens_id_seq RESTART WITH 1;

-- Melhorar a estrutura da tabela user_profiles para capturar dados corretos
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS real_instance_id TEXT,
ADD COLUMN IF NOT EXISTS evolution_phone TEXT,
ADD COLUMN IF NOT EXISTS connection_status TEXT DEFAULT 'disconnected';

-- Melhorar a tabela chatbot_configs para dados mais precisos
ALTER TABLE public.chatbot_configs 
ADD COLUMN IF NOT EXISTS real_instance_id TEXT,
ADD COLUMN IF NOT EXISTS evolution_phone TEXT,
ADD COLUMN IF NOT EXISTS connection_status TEXT DEFAULT 'disconnected',
ADD COLUMN IF NOT EXISTS last_status_check TIMESTAMP WITH TIME ZONE;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_real_instance_id ON public.user_profiles(real_instance_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_configs_real_instance_id ON public.chatbot_configs(real_instance_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_configs_user_id ON public.chatbot_configs(user_id);

-- Atualizar a função handle_new_user para não criar dados automáticos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Apenas criar o perfil básico, sem dados da Evolution
  BEGIN
    INSERT INTO public.user_profiles (
      id, 
      name, 
      email, 
      company, 
      area, 
      whatsapp
    )
    VALUES (
      new.id,
      new.raw_user_meta_data->>'name',
      new.email,
      new.raw_user_meta_data->>'company',
      new.raw_user_meta_data->>'area',
      new.raw_user_meta_data->>'whatsapp'
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao criar perfil: %', SQLERRM;
  END;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
