
-- Limpar todos os usuários existentes e dados relacionados
DELETE FROM public.user_profiles;
DELETE FROM public.chatbot_configs;
DELETE FROM auth.users;

-- Remover a foreign key constraint problemática
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Recriar a constraint corretamente
ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Atualizar a função de trigger para lidar melhor com erros
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Tentar inserir o perfil, se falhar, não bloquear a criação do usuário
  BEGIN
    INSERT INTO public.user_profiles (
      id, 
      name, 
      email, 
      company, 
      area, 
      whatsapp, 
      instance_id, 
      instance_name
    )
    VALUES (
      new.id,
      new.raw_user_meta_data->>'name',
      new.email,
      new.raw_user_meta_data->>'company',
      new.raw_user_meta_data->>'area',
      new.raw_user_meta_data->>'whatsapp',
      new.raw_user_meta_data->>'instance_id',
      new.raw_user_meta_data->>'instance_name'
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log o erro mas não falha a criação do usuário
    RAISE NOTICE 'Erro ao criar perfil: %', SQLERRM;
  END;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
