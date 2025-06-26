
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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

interface ChatbotConfig {
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

interface RegistrationResult {
  success: boolean;
  user?: any;
  instanceData?: {
    instanceName: string;
    instanceId: string;
    qrCode?: string;
    status: string;
  };
  error?: string;
}

export const useCompleteRegistration = () => {
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const API_KEY = '09d18f5a0aa248bebdb35893efeb170e';
  const EVOLUTION_BASE_URL = 'https://leoevo.techcorps.com.br';

  const createEvolutionInstance = async (instanceName: string): Promise<{instanceId: string, qrCode?: string} | null> => {
    try {
      console.log('🔄 Criando instância na Evolution API:', instanceName);
      
      const response = await fetch(`${EVOLUTION_BASE_URL}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
        body: JSON.stringify({
          instanceName: instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
          webhookUrl: `https://leowebhook.techcorps.com.br/webhook/${instanceName}`,
          webhookByEvents: false,
          webhookBase64: false,
          rejectCall: false,
          msgRetryCount: 3,
          markMessagesRead: false,
          alwaysOnline: false,
          readReceipts: false,
          readStatus: false
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro ao criar instância:', response.status, errorText);
        throw new Error(`Erro ao criar instância Evolution: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Instância criada na Evolution:', data);
      
      return {
        instanceId: data.instance?.instanceId || data.instanceId || instanceName,
        qrCode: data.qrcode?.base64 || data.qr
      };

    } catch (error) {
      console.error('❌ Erro na Evolution API:', error);
      throw error;
    }
  };

  const saveUserProfile = async (userData: UserRegistrationData, userId: string, instanceName: string, instanceId: string) => {
    try {
      console.log('💾 Salvando perfil do usuário...');
      
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          name: userData.name,
          email: userData.email,
          company: userData.company,
          area: userData.area,
          whatsapp: userData.whatsapp,
          instance_name: instanceName,
          instance_id: instanceId,
          connection_status: 'pending'
        });

      if (profileError) {
        console.error('❌ Erro ao salvar perfil:', profileError);
        throw new Error('Erro ao salvar perfil do usuário');
      }

      console.log('✅ Perfil salvo com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar perfil:', error);
      throw error;
    }
  };

  const saveChatbotConfig = async (config: ChatbotConfig, userId: string, instanceName: string, instanceId: string) => {
    try {
      console.log('🤖 Salvando configuração do chatbot...');
      
      const { error: configError } = await supabase
        .from('chatbot_configs')
        .insert({
          user_id: userId,
          evo_instance_id: instanceName,
          real_instance_id: instanceId,
          bot_name: config.nome_da_IA,
          service_type: 'WhatsApp',
          tone: config.personalidade,
          is_active: true,
          connection_status: 'pending',
          webhook_url: `https://leowebhook.techcorps.com.br/webhook/${instanceName}`
        });

      if (configError) {
        console.error('❌ Erro ao salvar config do chatbot:', configError);
        throw new Error('Erro ao salvar configuração do chatbot');
      }

      console.log('✅ Configuração do chatbot salva');
    } catch (error) {
      console.error('❌ Erro ao salvar config:', error);
      throw error;
    }
  };

  const registerUserComplete = async (
    userData: UserRegistrationData, 
    chatbotConfig: ChatbotConfig
  ): Promise<RegistrationResult> => {
    setLoading(true);
    
    try {
      console.log('🚀 Iniciando registro completo...');
      
      // 1. Criar usuário no Supabase Auth
      console.log('👤 Criando usuário no Supabase...');
      const signUpResult = await signUp(userData.email, userData.password, {
        name: userData.name,
        company: userData.company,
        area: userData.area,
        whatsapp: userData.whatsapp
      });

      if (signUpResult.error) {
        throw new Error(signUpResult.error.message || 'Erro ao criar conta');
      }

      if (!signUpResult.data?.user) {
        throw new Error('Usuário não foi criado corretamente');
      }

      const userId = signUpResult.data.user.id;
      console.log('✅ Usuário criado:', userId);

      // 2. Criar instância na Evolution API
      console.log('🔗 Criando instância na Evolution...');
      const evolutionData = await createEvolutionInstance(chatbotConfig.nome_instancia);
      
      if (!evolutionData) {
        throw new Error('Falha ao criar instância na Evolution API');
      }

      // 3. Salvar perfil do usuário
      await saveUserProfile(userData, userId, chatbotConfig.nome_instancia, evolutionData.instanceId);

      // 4. Salvar configuração do chatbot
      await saveChatbotConfig(chatbotConfig, userId, chatbotConfig.nome_instancia, evolutionData.instanceId);

      console.log('🎉 Registro completo finalizado com sucesso!');
      
      toast({
        title: "✅ Conta criada com sucesso!",
        description: `Instância ${chatbotConfig.nome_instancia} criada na Evolution API`,
      });

      return {
        success: true,
        user: signUpResult.data.user,
        instanceData: {
          instanceName: chatbotConfig.nome_instancia,
          instanceId: evolutionData.instanceId,
          qrCode: evolutionData.qrCode,
          status: 'pending'
        }
      };

    } catch (error) {
      console.error('💥 Erro no registro completo:', error);
      
      toast({
        title: "❌ Erro na criação da conta",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    registerUserComplete,
    loading
  };
};
