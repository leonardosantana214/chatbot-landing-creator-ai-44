
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
  company: string;
  area: string;
  whatsapp: string;
}

export const useCompleteRegistration = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const registerUserComplete = async (userData: UserRegistrationData, chatbotConfig: any) => {
    setLoading(true);
    
    try {
      console.log('🚀 Iniciando registro completo do usuário:', userData.email);
      
      // 1. Criar conta no Supabase Auth
      const instanceName = `${userData.company.toLowerCase().replace(/\s+/g, '')}_${Date.now()}`;
      const instanceId = `inst_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('📋 Dados da instância:', { instanceName, instanceId });

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            name: userData.name,
            company: userData.company,
            area: userData.area,
            whatsapp: userData.whatsapp,
            instance_id: instanceId,
            instance_name: instanceName
          }
        }
      });

      if (authError) {
        console.error('❌ Erro na criação da conta:', authError);
        throw new Error(`Erro ao criar conta: ${authError.message}`);
      }

      console.log('✅ Conta criada no Supabase Auth:', authData.user?.id);

      if (!authData.user) {
        throw new Error('Usuário não foi criado corretamente');
      }

      // 2. Criar perfil do usuário com instance_id e instance_name
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          company: userData.company,
          area: userData.area,
          whatsapp: userData.whatsapp,
          instance_id: instanceId,
          instance_name: instanceName,
          connection_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('❌ Erro ao criar perfil:', profileError);
        throw new Error(`Erro ao criar perfil: ${profileError.message}`);
      }

      console.log('✅ Perfil criado com instance_id:', instanceId);

      // 3. Criar configuração do chatbot
      const { data: configData, error: configError } = await supabase
        .from('chatbot_configs')
        .insert({
          user_id: authData.user.id,
          bot_name: chatbotConfig.nome_da_IA,
          service_type: chatbotConfig.tipo_de_servico,
          tone: chatbotConfig.tom,
          evo_instance_id: instanceName,
          real_instance_id: instanceId,
          phone_number: userData.whatsapp,
          connection_status: 'pending',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (configError) {
        console.error('❌ Erro ao criar config do chatbot:', configError);
        throw new Error(`Erro ao configurar chatbot: ${configError.message}`);
      }

      console.log('✅ Configuração do chatbot criada:', configData.id);

      // 4. Atualizar os metadados do usuário no auth.users com os dados corretos
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: userData.name,
          company: userData.company,
          area: userData.area,
          whatsapp: userData.whatsapp,
          instance_id: instanceId,
          instance_name: instanceName,
          chatbot_id: configData.id
        }
      });

      if (updateError) {
        console.warn('⚠️ Erro ao atualizar metadados do usuário:', updateError);
      } else {
        console.log('✅ Metadados do usuário atualizados no auth.users');
      }

      console.log('🎉 Registro completo finalizado com sucesso!');
      
      return {
        success: true,
        user: authData.user,
        instanceData: {
          instanceName,
          instanceId,
          chatbotConfig: configData
        }
      };

    } catch (error) {
      console.error('💥 Erro no registro completo:', error);
      
      toast({
        title: "❌ Erro no registro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido"
      };
    } finally {
      setLoading(false);
    }
  };

  return { registerUserComplete, loading };
};
