
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

      // VERIFICAR SE USUÁRIO JÁ EXISTE PARA EVITAR RATE LIMITING
      const { data: existingUser } = await supabase.auth.getUser();
      if (existingUser?.user?.email === userData.email) {
        console.log('✅ Usuário já existe, usando conta existente');
        
        // Se usuário já existe, apenas criar/atualizar perfil e config
        const userId = existingUser.user.id;
        
        // Criar/atualizar perfil
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: userId,
            email: userData.email,
            name: userData.name,
            company: userData.company,
            area: userData.area,
            whatsapp: userData.whatsapp,
            instance_id: instanceId,
            instance_name: instanceName,
            connection_status: 'pending',
            qr_code_required: false,
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('❌ Erro ao atualizar perfil:', profileError);
          throw new Error(`Erro ao atualizar perfil: ${profileError.message}`);
        }

        // Criar configuração do chatbot
        const { data: configData, error: configError } = await supabase
          .from('chatbot_configs')
          .upsert({
            user_id: userId,
            bot_name: chatbotConfig.nome_da_IA || 'Assistente IA',
            service_type: chatbotConfig.tipo_de_servico || 'Atendimento Geral',
            tone: chatbotConfig.tom || chatbotConfig.personalidade || 'Profissional e amigável',
            evo_instance_id: instanceName,
            real_instance_id: instanceId,
            instance_name: instanceName,
            phone_number: userData.whatsapp,
            connection_status: 'pending',
            phone_connected: null,
            qr_completed: false,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (configError) {
          console.error('❌ Erro ao criar config do chatbot:', configError);
          throw new Error(`Erro ao configurar chatbot: ${configError.message}`);
        }

        console.log('✅ Registro completo atualizado com sucesso!');
        
        toast({
          title: "✅ Configuração atualizada!",
          description: `Bem-vindo de volta, ${userData.name}!`,
        });
        
        return {
          success: true,
          user: existingUser.user,
          instanceData: {
            instanceName,
            instanceId,
            chatbotConfig: configData
          }
        };
      }

      // LIMPAR ESTADO AUTH ANTERIOR PARA EVITAR CONFLITOS
      try {
        await supabase.auth.signOut();
        // Aguardar um pouco para limpar estado
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.log('Sem sessão anterior para limpar');
      }

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
        
        // Se for erro de rate limiting, tentar usar o usuário existente
        if (authError.message.includes('For security purposes')) {
          console.log('🔄 Rate limiting detectado, tentando usar conta existente...');
          
          // Tentar fazer login
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: userData.email,
            password: userData.password
          });
          
          if (loginError) {
            throw new Error(`Erro de rate limiting. Aguarde alguns segundos e tente novamente.`);
          }
          
          if (loginData.user) {
            console.log('✅ Login realizado com sucesso');
            
            // Continuar com criação do perfil e config
            const userId = loginData.user.id;
            
            // Criar perfil
            const { error: profileError } = await supabase
              .from('user_profiles')
              .upsert({
                id: userId,
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
              console.error('❌ Erro ao criar perfil:', profileError);
              throw new Error(`Erro ao criar perfil: ${profileError.message}`);
            }

            // Criar configuração do chatbot
            const { data: configData, error: configError } = await supabase
              .from('chatbot_configs')
              .insert({
                user_id: userId,
                bot_name: chatbotConfig.nome_da_IA || 'Assistente IA',
                service_type: chatbotConfig.tipo_de_servico || 'Atendimento Geral',
                tone: chatbotConfig.tom || chatbotConfig.personalidade || 'Profissional e amigável',
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
              console.error('❌ Erro ao criar config do chatbot:', configError);
              throw new Error(`Erro ao configurar chatbot: ${configError.message}`);
            }

            console.log('✅ Registro completo realizado após login!');
            
            toast({
              title: "✅ Conta configurada com sucesso!",
              description: `Bem-vindo, ${userData.name}!`,
            });
            
            return {
              success: true,
              user: loginData.user,
              instanceData: {
                instanceName,
                instanceId,
                chatbotConfig: configData
              }
            };
          }
        }
        
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
        throw new Error(`Erro ao criar perfil completo: ${profileError.message}`);
      }

      console.log('✅ Perfil COMPLETO criado com sucesso');

      // ETAPA 3: Criar configuração COMPLETA do chatbot com TODOS os dados
      console.log('🤖 Criando configuração COMPLETA do chatbot...');
      const { data: configData, error: configError } = await supabase
        .from('chatbot_configs')
        .insert({
          user_id: authData.user.id,
          bot_name: chatbotConfig.nome_da_IA || 'Assistente IA',
          service_type: chatbotConfig.tipo_de_servico || 'Atendimento Geral',
          tone: chatbotConfig.tom || chatbotConfig.personalidade || 'Profissional e amigável',
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
        throw new Error(`Erro ao configurar chatbot completo: ${configError.message}`);
      }

      console.log('✅ Configuração COMPLETA do chatbot criada:', configData.id);

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
