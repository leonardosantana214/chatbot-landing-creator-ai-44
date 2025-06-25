
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
  const { connectInstance } = useEvolutionConnection();

  const clearAllData = async () => {
    try {
      console.log('🧹 Limpando TODOS os dados anteriores...');
      await supabase.auth.signOut();
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Limpeza completa realizada');
    } catch (error) {
      console.error('⚠️ Erro na limpeza:', error);
    }
  };

  const registerUserComplete = async (
    userData: UserRegistrationData,
    chatbotConfig: ChatbotConfigData
  ): Promise<{ success: boolean; instanceData?: any }> => {
    setLoading(true);
    
    try {
      console.log('🚀 Iniciando processo COMPLETO de registro...');
      
      await clearAllData();
      
      // 1. Criar instância Evolution PRIMEIRO
      console.log('📡 Criando instância Evolution...');
      const instanceData = await connectInstance(chatbotConfig.nome_instancia, chatbotConfig);
      
      if (!instanceData) {
        throw new Error('Falha ao criar instância no Evolution API');
      }

      console.log('✅ Instância Evolution criada:', instanceData.instanceId);

      // 2. Criar usuário no Supabase Auth SEM confirmação de email
      console.log('👤 Criando usuário no Supabase Auth...');
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: undefined, // Remove confirmação por email
          data: {
            name: userData.name,
            company: userData.company,
            area: userData.area,
            whatsapp: userData.whatsapp,
            instance_id: instanceData.instanceId,
            instance_name: chatbotConfig.nome_instancia,
            email_confirm: true // Forçar confirmação automática
          }
        }
      });

      if (signUpError) {
        console.error('❌ Erro ao criar usuário:', signUpError);
        throw new Error(`Erro ao criar usuário: ${signUpError.message}`);
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado corretamente');
      }

      const userId = authData.user.id;
      console.log('✅ Usuário criado no Auth:', userId);

      // 3. Aguardar criação automática do perfil
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 4. Verificar se perfil foi criado automaticamente pelo trigger
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileCheckError) {
        console.log('⚠️ Erro ao verificar perfil:', profileCheckError);
      }

      if (!existingProfile) {
        console.log('📝 Criando perfil manualmente...');
        
        const { data: newProfile, error: createProfileError } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            name: userData.name,
            email: userData.email,
            company: userData.company,
            area: userData.area,
            whatsapp: userData.whatsapp,
            instance_id: instanceData.instanceId,
            instance_name: chatbotConfig.nome_instancia
          })
          .select()
          .single();

        if (createProfileError) {
          console.error('❌ Erro ao criar perfil manualmente:', createProfileError);
          console.log('⚠️ Continuando sem perfil por enquanto...');
        } else {
          console.log('✅ Perfil criado manualmente:', newProfile);
        }
      } else {
        console.log('✅ Perfil já existe (criado pelo trigger):', existingProfile);
      }

      // 5. Verificar se já existe configuração para evitar duplicata
      const { data: existingConfig } = await supabase
        .from('chatbot_configs')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingConfig) {
        console.log('⚠️ Configuração já existe, removendo...');
        await supabase
          .from('chatbot_configs')
          .delete()
          .eq('user_id', userId);
      }

      // 6. Criar configuração do chatbot
      console.log('💾 Salvando configuração do chatbot...');
      
      const configData = {
        user_id: userId,
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
        throw new Error('Erro ao salvar configuração do chatbot');
      }

      console.log('✅ Configuração do chatbot salva:', configResult);

      // 7. Enviar dados para webhook
      console.log('📤 Enviando dados para webhook...');
      
      const webhookData = {
        ...userData,
        ...chatbotConfig,
        instance_id: instanceData.instanceId,
        user_id: userId,
        webhook_url: `https://leowebhook.techcorps.com.br/webhook/${chatbotConfig.nome_instancia}`
      };

      try {
        const webhookResponse = await fetch('https://leowebhook.techcorps.com.br/webhook/receber-formulario', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData),
        });

        if (webhookResponse.ok) {
          console.log('✅ Webhook enviado com sucesso');
        } else {
          console.warn('⚠️ Webhook com erro, mas continuando...');
        }
      } catch (webhookError) {
        console.warn('⚠️ Erro no webhook, mas continuando:', webhookError);
      }

      // 8. Sucesso - NÃO fazer login automático
      console.log('🎉 CONTA CRIADA COM SUCESSO - Login manual disponível');
      
      toast({
        title: "🎉 CONTA CRIADA COM SUCESSO!",
        description: `Bem-vindo, ${userData.name}! Use suas credenciais para fazer login quando quiser.`,
        duration: 8000,
      });

      return { success: true, instanceData };

    } catch (error) {
      console.error('💥 Erro no processo completo:', error);
      
      toast({
        title: "❌ Erro na Configuração",
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
