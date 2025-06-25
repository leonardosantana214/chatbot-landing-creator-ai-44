
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

  const clearAllAuthUsers = async () => {
    try {
      console.log('🧹 Limpando todos os usuários do Auth...');
      // Fazer logout de qualquer usuário logado
      await supabase.auth.signOut();
      console.log('✅ Usuários limpos com sucesso');
    } catch (error) {
      console.error('⚠️ Erro ao limpar usuários:', error);
    }
  };

  const registerUserComplete = async (
    userData: UserRegistrationData,
    chatbotConfig: ChatbotConfigData
  ): Promise<{ success: boolean; instanceData?: any }> => {
    setLoading(true);
    
    try {
      console.log('🚀 Iniciando processo completo de registro...');
      
      // 1. LIMPAR TODOS OS USUÁRIOS ANTERIORES
      await clearAllAuthUsers();
      
      // 2. Criar/conectar instância no Evolution PRIMEIRO
      console.log('📡 Criando instância Evolution...');
      const instanceData = await connectInstance(chatbotConfig.nome_instancia, chatbotConfig);
      
      if (!instanceData) {
        throw new Error('Falha ao criar instância no Evolution API');
      }

      console.log('✅ Instância criada:', instanceData.instanceId);

      // 3. Criar usuário no Supabase Auth SEM confirmação de email
      console.log('👤 Criando usuário no Supabase...');
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            company: userData.company,
            area: userData.area,
            whatsapp: userData.whatsapp,
            instance_id: instanceData.instanceId,
            instance_name: chatbotConfig.nome_instancia
          },
          emailRedirectTo: undefined // Remover redirecionamento de email
        }
      });

      if (signUpError) {
        console.error('❌ Erro ao criar usuário:', signUpError);
        throw new Error(`Erro ao criar usuário: ${signUpError.message}`);
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado corretamente');
      }

      console.log('✅ Usuário criado com sucesso!', authData.user.id);

      // 4. Aguardar e garantir que o perfil foi criado
      console.log('🔍 Garantindo criação do perfil...');
      
      // Aguardar o trigger funcionar
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verificar e criar perfil se necessário
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError || !profileData) {
        console.log('📝 Criando perfil manualmente...');
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
          console.error('❌ Erro ao criar perfil:', insertError);
        } else {
          console.log('✅ Perfil criado manualmente');
        }
      } else {
        console.log('✅ Perfil já existe:', profileData);
      }

      // 5. Salvar configuração COMPLETA do chatbot
      console.log('💾 Salvando configuração COMPLETA do chatbot...');
      
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
        throw new Error('Erro ao salvar configuração do chatbot');
      } else {
        console.log('✅ Configuração salva com sucesso!', configResult);
      }

      // 6. Enviar TODOS os dados para o webhook
      console.log('📤 Enviando dados para webhook...');
      
      const webhookData = {
        ...userData,
        ...chatbotConfig,
        instance_id: instanceData.instanceId,
        user_id: authData.user.id,
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
          console.log('✅ Dados enviados para webhook com sucesso');
        } else {
          console.warn('⚠️ Webhook retornou erro, mas continuando...');
        }
      } catch (webhookError) {
        console.warn('⚠️ Erro no webhook, mas continuando:', webhookError);
      }

      // 7. Fazer login automático após criação
      console.log('🔐 Fazendo login automático...');
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      });

      if (signInError) {
        console.error('❌ Erro no login automático:', signInError);
        throw new Error('Conta criada mas erro no login automático');
      }

      console.log('✅ Login automático realizado com sucesso!');

      toast({
        title: "🎉 CONTA CRIADA COM SUCESSO!",
        description: `Bem-vindo, ${userData.name}! Você está logado e pronto para usar o sistema.`,
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
