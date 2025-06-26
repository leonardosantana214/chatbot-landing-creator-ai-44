
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
      console.log('🚀 Iniciando registro COMPLETO com TODOS os dados:', userData.email);
      
      // Gerar IDs únicos ANTES de tudo
      const instanceName = `${userData.company.toLowerCase().replace(/\s+/g, '')}_${Date.now()}`;
      const instanceId = `inst_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('📋 IDs gerados:', { instanceName, instanceId });

      // ETAPA 1: Criar conta no Supabase Auth com TODOS os dados necessários
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
        console.error('❌ Erro na criação da conta AUTH:', authError);
        throw new Error(`Erro ao criar conta: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado corretamente no auth');
      }

      console.log('✅ Conta AUTH criada:', authData.user.id);

      // ETAPA 2: Criar perfil completo com TODOS os dados de uma vez
      console.log('📝 Criando perfil COMPLETO com todos os dados...');
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
          qr_code_required: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('❌ Erro ao criar perfil COMPLETO:', profileError);
        // Se der erro no perfil, remover o usuário do auth para evitar conflitos
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(`Erro ao criar perfil completo: ${profileError.message}`);
      }

      console.log('✅ Perfil COMPLETO criado com sucesso');

      // ETAPA 3: Criar configuração COMPLETA do chatbot com TODOS os dados
      console.log('🤖 Criando configuração COMPLETA do chatbot...');
      const { data: configData, error: configError } = await supabase
        .from('chatbot_configs')
        .insert({
          user_id: authData.user.id,
          bot_name: chatbotConfig.nome_da_IA,
          service_type: chatbotConfig.tipo_de_servico,
          tone: chatbotConfig.tom,
          evo_instance_id: instanceName,
          real_instance_id: instanceId,
          instance_name: instanceName,
          phone_number: userData.whatsapp,
          connection_status: 'pending',
          phone_connected: null,
          qr_completed: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (configError) {
        console.error('❌ Erro ao criar config COMPLETA do chatbot:', configError);
        // Se der erro na config, remover tudo para evitar dados órfãos
        await supabase.from('user_profiles').delete().eq('id', authData.user.id);
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(`Erro ao configurar chatbot completo: ${configError.message}`);
      }

      console.log('✅ Configuração COMPLETA do chatbot criada:', configData.id);

      // ETAPA 4: Atualizar metadados do auth com o chatbot_id
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
        console.warn('⚠️ Erro ao atualizar metadados (não crítico):', updateError);
      } else {
        console.log('✅ Metadados atualizados no auth');
      }

      console.log('🎉 REGISTRO COMPLETO FINALIZADO COM SUCESSO! Todos os dados salvos de uma vez.');
      
      toast({
        title: "✅ Conta criada com sucesso!",
        description: `Bem-vindo, ${userData.name}! Todos os dados foram salvos corretamente.`,
      });
      
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
      console.error('💥 ERRO CRÍTICO no registro completo:', error);
      
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
