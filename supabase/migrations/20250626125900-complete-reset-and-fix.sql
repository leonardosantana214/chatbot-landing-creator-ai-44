
-- Limpar completamente todos os dados para testes limpos
DELETE FROM public.messages;
DELETE FROM public.chats;
DELETE FROM public.contacts;
DELETE FROM public.chatbot_configs;
DELETE FROM public.mensagens;
DELETE FROM public.consulta;
DELETE FROM public.clientes;
DELETE FROM public.user_profiles;
DELETE FROM auth.users;

-- Resetar sequences
ALTER SEQUENCE IF EXISTS clientes_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS consulta_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS mensagens_id_seq RESTART WITH 1;

-- Melhorar estrutura da tabela user_profiles
ALTER TABLE public.user_profiles 
DROP COLUMN IF EXISTS real_instance_id,
DROP COLUMN IF EXISTS evolution_phone,
DROP COLUMN IF EXISTS connection_status;

-- Adicionar colunas essenciais se não existirem
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS instance_id TEXT,
ADD COLUMN IF NOT EXISTS instance_name TEXT,
ADD COLUMN IF NOT EXISTS connection_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS qr_code_required BOOLEAN DEFAULT false;

-- Melhorar estrutura da tabela chatbot_configs
ALTER TABLE public.chatbot_configs 
ADD COLUMN IF NOT EXISTS instance_name TEXT,
ADD COLUMN IF NOT EXISTS connection_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS phone_connected TEXT,
ADD COLUMN IF NOT EXISTS qr_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_skip_qr BOOLEAN DEFAULT true;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_instance_id ON public.user_profiles(instance_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_instance_name ON public.user_profiles(instance_name);
CREATE INDEX IF NOT EXISTS idx_chatbot_configs_instance_name ON public.chatbot_configs(instance_name);
CREATE INDEX IF NOT EXISTS idx_chatbot_configs_user_id ON public.chatbot_configs(user_id);

-- Função melhorada para lidar com novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar perfil completo com todos os dados necessários
  BEGIN
    INSERT INTO public.user_profiles (
      id, 
      name, 
      email, 
      company, 
      area, 
      whatsapp,
      instance_id,
      instance_name,
      connection_status,
      qr_code_required
    )
    VALUES (
      new.id,
      new.raw_user_meta_data->>'name',
      new.email,
      new.raw_user_meta_data->>'company',
      new.raw_user_meta_data->>'area',
      new.raw_user_meta_data->>'whatsapp',
      new.raw_user_meta_data->>'instance_id',
      new.raw_user_meta_data->>'instance_name',
      COALESCE(new.raw_user_meta_data->>'connection_status', 'pending'),
      COALESCE((new.raw_user_meta_data->>'qr_code_required')::boolean, false)
    );
    
    RAISE NOTICE '✅ Perfil criado com sucesso para usuário: % com instance_name: %', 
      new.email, new.raw_user_meta_data->>'instance_name';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro ao criar perfil para %: %', new.email, SQLERRM;
  END;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Verificar estrutura
SELECT 'user_profiles columns:' as info, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'chatbot_configs columns:' as info, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'chatbot_configs' AND table_schema = 'public'
ORDER BY ordinal_position;
