
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEvolutionConnection } from './useEvolutionConnection';
import { supabase } from '@/integrations/supabase/client';

interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
  company: string;
  area: string;
  whatsapp: string;
}

interface ChatbotConfigData {
  nome_da_IA: string;
  empresa: string;
  nicho: string;
  identidade: string;
  personalidade: string;
  objetivo: string;
  regras: string;
  fluxo: string;
  funcionalidades: string[];
  nome_instancia: string;
}

export const useCompleteRegistration = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { signUp } = useAuth();
  const { connectInstance } = useEvolutionConnection();

  const registerUserComplete = async (
    userData: UserRegistrationData,
    chatbotConfig: ChatbotConfigData
  ): Promise<{ success: boolean; instanceData?: any }> => {
    setLoading(true);
    
    try {
      console.log('🚀 Iniciando processo completo de registro...');
      
      // 1. Primeiro criar/conectar instância no Evolution
      console.log('📡 Criando instância Evolution...');
      const instanceData = await connectInstance(chatbotConfig.nome_instancia, chatbotConfig);
      
      if (!instanceData) {
        throw new Error('Falha ao criar instância no Evolution');
      }

      console.log('✅ Instância criada:', instanceData.instanceId);

      // 2. Criar usuário no Supabase Auth COM instance_id nos metadados
      console.log('👤 Criando usuário com instance_id...');
      
      const { error: signUpError } = await signUp(userData.email, userData.password, {
        name: userData.name,
        company: userData.company,
        area: userData.area,
        whatsapp: userData.whatsapp,
        instance_id: instanceData.instanceId, // AQUI está o instance_id!
        instance_name: chatbotConfig.nome_instancia
      });

      if (signUpError) {
        console.error('❌ Erro ao criar usuário:', signUpError);
        throw new Error(`Erro ao criar usuário: ${signUpError.message}`);
      }

      // 3. Aguardar um pouco para o usuário ser criado completamente
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 4. Fazer login automático
      console.log('🔐 Fazendo login automático...');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      });

      if (loginError) {
        console.error('❌ Erro no login automático:', loginError);
        throw new Error(`Erro no login: ${loginError.message}`);
      }

      console.log('✅ Login realizado com sucesso!');

      // 5. Aguardar um pouco para garantir que a sessão está estabelecida
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 6. Salvar configuração do chatbot no Supabase
      console.log('💾 Salvando configuração do chatbot...');
      
      if (!loginData.user) {
        throw new Error('Usuário não encontrado após login');
      }

      const configData = {
        user_id: loginData.user.id,
        bot_name: chatbotConfig.nome_da_IA,
        service_type: chatbotConfig.nicho,
        tone: chatbotConfig.personalidade,
        evo_instance_id: chatbotConfig.nome_instancia,
        phone_number: instanceData.phone,
        is_active: true,
        webhook_url: `https://leowebhook.techcorps.com.br/webhook/${chatbotConfig.nome_instancia}`,
      };

      const { data: configResult, error: configError } = await supabase
        .from('chatbot_configs')
        .insert(configData)
        .select()
        .single();

      if (configError) {
        console.error('❌ Erro ao salvar configuração:', configError);
        throw new Error(`Erro ao salvar configuração: ${configError.message}`);
      }

      console.log('✅ Configuração salva com sucesso!', configResult);

      toast({
        title: "🎉 CADASTRO COMPLETO!",
        description: `Usuário criado com Instance ID: ${instanceData.instanceId}`,
        duration: 10000,
      });

      return { success: true, instanceData };

    } catch (error) {
      console.error('💥 Erro no processo completo:', error);
      
      toast({
        title: "❌ Erro no Cadastro",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
      
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    registerUserComplete,
    loading
  };
};
