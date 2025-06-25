
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

      // 2. Criar usuário no Supabase Auth com dados completos
      console.log('👤 Criando usuário no Supabase...');
      
      const { data: authData, error: signUpError } = await signUp(userData.email, userData.password, {
        name: userData.name,
        company: userData.company,
        area: userData.area,
        whatsapp: userData.whatsapp,
        instance_id: instanceData.instanceId,
        instance_name: chatbotConfig.nome_instancia
      });

      if (signUpError) {
        console.error('❌ Erro ao criar usuário:', signUpError);
        throw new Error(`Erro ao criar usuário: ${signUpError.message}`);
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado corretamente');
      }

      console.log('✅ Usuário criado com sucesso!', authData.user.id);

      // 3. Aguardar um pouco para o trigger do perfil ser executado
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 4. Verificar se o perfil foi criado pelo trigger
      console.log('🔍 Verificando criação do perfil...');
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar perfil:', profileError);
        // Se não existe, vamos criar manualmente
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            name: userData.name,
            email: userData.email,
            company: userData.company,
            area: userData.area,
            whatsapp: userData.whatsapp,
            instance_id: instanceData.instanceId,
            instance_name: chatbotConfig.nome_instancia
          });

        if (insertError) {
          console.error('❌ Erro ao criar perfil manualmente:', insertError);
        } else {
          console.log('✅ Perfil criado manualmente');
        }
      } else {
        console.log('✅ Perfil já existe ou foi criado pelo trigger:', profileData);
      }

      // 5. Salvar configuração do chatbot
      console.log('💾 Salvando configuração do chatbot...');
      
      const configData = {
        user_id: authData.user.id,
        bot_name: chatbotConfig.nome_da_IA,
        service_type: chatbotConfig.nicho,
        tone: chatbotConfig.personalidade,
        evo_instance_id: chatbotConfig.nome_instancia,
        phone_number: instanceData.phone || null,
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
        console.log('⚠️ Continuando sem salvar configuração do chatbot...');
      } else {
        console.log('✅ Configuração salva com sucesso!', configResult);
      }

      toast({
        title: "🎉 CONTA CRIADA COM SUCESSO!",
        description: `Bem-vindo, ${userData.name}! Sua conta e chatbot foram configurados.`,
        duration: 5000,
      });

      return { success: true, instanceData };

    } catch (error) {
      console.error('💥 Erro no processo completo:', error);
      
      toast({
        title: "❌ Erro na Criação da Conta",
        description: error instanceof Error ? error.message : 'Erro desconhecido ao criar conta',
        variant: "destructive",
        duration: 10000,
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
