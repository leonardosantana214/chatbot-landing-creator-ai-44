
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
  instanceData?: {
    instanceName: string;
    instanceId: string;
    userId: string;
  };
  error?: string;
}

export const useCompleteRegistration = () => {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const generateInstanceData = (company: string): { instanceId: string; instanceName: string } => {
    const timestamp = Date.now();
    const cleanCompany = company.toLowerCase().replace(/[^a-z0-9]/g, '');
    const instanceName = `bot_${cleanCompany}_${timestamp}`;
    const instanceId = `inst_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
    
    return { instanceId, instanceName };
  };

  const createEvolutionInstance = async (instanceName: string): Promise<boolean> => {
    try {
      const API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY || '09d18f5a0aa248bebdb35893efeb170e';
      const EVOLUTION_BASE_URL = 'https://leoevo.techcorps.com.br';
      
      console.log('🚀 Criando instância na Evolution API:', instanceName);
      
      const response = await fetch(`${EVOLUTION_BASE_URL}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
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
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Instância criada na Evolution:', data);
        return true;
      } else {
        console.warn('⚠️ Erro ao criar instância na Evolution:', response.status);
        return false; // Não falhar por causa disso
      }
    } catch (error) {
      console.warn('⚠️ Erro na Evolution API (não crítico):', error);
      return false; // Não falhar por causa disso
    }
  };

  const saveChatbotConfig = async (userId: string, instanceName: string, instanceId: string, config: ChatbotConfig): Promise<boolean> => {
    try {
      console.log('💾 Salvando configuração do chatbot...');
      
      const { error } = await supabase
        .from('chatbot_configs')
        .insert({
          user_id: userId,
          evo_instance_id: instanceName,
          instance_name: instanceName,
          bot_name: config.nome_da_IA,
          company_name: config.empresa,
          service_type: config.nicho,
          tone: config.personalidade,
          identity: config.identidade,
          objective: config.objetivo,
          rules: config.regras,
          flow: config.fluxo,
          features: config.funcionalidades,
          webhook_url: `https://leowebhook.techcorps.com.br/webhook/${instanceName}`,
          is_active: true,
          connection_status: 'pending',
          can_skip_qr: true, // Permitir pular QR Code
          qr_completed: false
        });

      if (error) {
        console.error('❌ Erro ao salvar config do chatbot:', error);
        return false;
      }

      console.log('✅ Configuração do chatbot salva com sucesso');
      return true;
    } catch (error) {
      console.error('💥 Erro ao salvar configuração:', error);
      return false;
    }
  };

  const registerUserComplete = async (
    userData: UserRegistrationData, 
    chatbotConfig: ChatbotConfig
  ): Promise<RegistrationResult> => {
    setLoading(true);
    
    try {
      console.log('🔄 Iniciando registro completo do usuário...');
      
      // 1. Gerar dados da instância
      const { instanceId, instanceName } = generateInstanceData(userData.company);
      console.log('📋 Dados da instância gerados:', { instanceId, instanceName });

      // 2. Criar usuário no Supabase Auth com todos os dados
      console.log('👤 Criando usuário no Supabase...');
      const { data: authData, error: authError } = await signUp(userData.email, userData.password, {
        name: userData.name,
        company: userData.company,
        area: userData.area,
        whatsapp: userData.whatsapp,
        instance_id: instanceId,
        instance_name: instanceName,
        connection_status: 'pending',
        qr_code_required: false // QR Code não é obrigatório
      });

      if (authError) {
        console.error('❌ Erro ao criar usuário:', authError);
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Usuário não foi criado corretamente' };
      }

      const userId = authData.user.id;
      console.log('✅ Usuário criado com ID:', userId);

      // 3. Aguardar um pouco para o trigger criar o perfil
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 4. Verificar se o perfil foi criado corretamente
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('❌ Erro ao verificar perfil:', profileError);
        // Tentar criar manualmente se não existir
        const { error: manualProfileError } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            name: userData.name,
            email: userData.email,
            company: userData.company,
            area: userData.area,
            whatsapp: userData.whatsapp,
            instance_id: instanceId,
            instance_name: instanceName,
            connection_status: 'pending',
            qr_code_required: false
          });

        if (manualProfileError) {
          console.error('❌ Erro ao criar perfil manualmente:', manualProfileError);
        }
      } else {
        console.log('✅ Perfil verificado:', profileData);
      }

      // 5. Salvar configuração do chatbot
      const configSaved = await saveChatbotConfig(userId, instanceName, instanceId, chatbotConfig);
      if (!configSaved) {
        console.warn('⚠️ Configuração do chatbot não foi salva (não crítico)');
      }

      // 6. Tentar criar instância na Evolution (não crítico)
      await createEvolutionInstance(instanceName);

      // 7. Enviar dados para webhook (não crítico)
      try {
        const webhookData = {
          ...userData,
          ...chatbotConfig,
          instance_id: instanceId,
          instance_name: instanceName,
          user_id: userId,
          webhook_url: `https://leowebhook.techcorps.com.br/webhook/${instanceName}`
        };

        await fetch('https://leowebhook.techcorps.com.br/webhook/receber-formulario', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookData),
        });

        console.log('✅ Dados enviados para webhook');
      } catch (webhookError) {
        console.warn('⚠️ Erro no webhook (não crítico):', webhookError);
      }

      console.log('🎉 Registro completo finalizado com sucesso!');
      
      return {
        success: true,
        instanceData: {
          instanceName,
          instanceId,
          userId
        }
      };

    } catch (error) {
      console.error('💥 Erro geral no registro:', error);
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
