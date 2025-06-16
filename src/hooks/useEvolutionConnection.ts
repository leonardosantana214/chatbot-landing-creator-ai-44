import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EvolutionInstanceData {
  instanceId: string;
  instanceName: string;
  phone: string;
  status: 'connected' | 'disconnected' | 'connecting';
  qrCode?: string;
}

export const useEvolutionConnection = () => {
  const [connectionData, setConnectionData] = useState<EvolutionInstanceData | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const API_KEY = '09d18f5a0aa248bebdb35893efeb170e';
  const EVOLUTION_BASE_URL = 'https://leoevo.techcorps.com.br';

  const updateUserInstanceId = async (instanceName: string): Promise<boolean> => {
    if (!user) {
      console.error('❌ Usuário não autenticado');
      return false;
    }

    try {
      console.log('🔄 Atualizando instance_id nos metadados do usuário...');
      
      // Atualizar os metadados do usuário com o instance_id
      const { error } = await supabase.auth.updateUser({
        data: {
          instance_id: instanceName
        }
      });

      if (error) {
        console.error('❌ Erro ao atualizar metadados do usuário:', error);
        return false;
      }

      console.log('✅ Instance ID salvo nos metadados do usuário:', instanceName);
      return true;
    } catch (error) {
      console.error('💥 Erro ao atualizar instance_id do usuário:', error);
      return false;
    }
  };

  const fetchInstanceDetails = async (instanceName: string): Promise<EvolutionInstanceData | null> => {
    try {
      console.log('🔍 Buscando detalhes da instância:', instanceName);
      
      // Primeiro tentar buscar instância existente
      const fetchResponse = await fetch(`${EVOLUTION_BASE_URL}/instance/fetchInstances?instanceName=${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (fetchResponse.ok) {
        const data = await fetchResponse.json();
        console.log('📡 Dados da instância encontrada:', data);
        
        let instanceId = '';
        let phone = '';
        
        if (Array.isArray(data) && data.length > 0) {
          const instance = data[0];
          instanceId = instance.id || instance.instanceId || '';
          phone = instance.number || instance.phone || '';
        } else if (data.id) {
          instanceId = data.id;
          phone = data.number || data.phone || '';
        }

        if (instanceId && instanceId !== '00000000-0000-0000-0000-000000000000') {
          const cleanPhone = phone.replace(/\D/g, '');
          
          return {
            instanceId,
            instanceName,
            phone: cleanPhone,
            status: 'connected'
          };
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar detalhes da instância:', error);
      return null;
    }
  };

  const createNewInstance = async (instanceName: string): Promise<EvolutionInstanceData | null> => {
    try {
      console.log('🚀 Criando nova instância:', instanceName);
      
      const createPayload = {
        instanceName: instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS'
      };

      const response = await fetch(`${EVOLUTION_BASE_URL}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
        body: JSON.stringify(createPayload),
      });

      if (response.ok) {
        console.log('✅ Instância criada, aguardando inicialização...');
        
        // Aguardar alguns segundos para a instância inicializar
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Buscar detalhes da instância recém-criada
        return await fetchInstanceDetails(instanceName);
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao criar instância:', errorText);
        throw new Error(`Erro ao criar instância: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erro na criação da instância:', error);
      throw error;
    }
  };

  const getQRCode = async (instanceName: string): Promise<string | null> => {
    try {
      console.log('📱 Obtendo QR Code para:', instanceName);
      
      const response = await fetch(`${EVOLUTION_BASE_URL}/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const qrCode = data.qrcode || data.qr || data.base64 || data.code;
        
        if (qrCode) {
          console.log('✅ QR Code obtido com sucesso');
          return qrCode.startsWith('data:image') ? qrCode : `data:image/png;base64,${qrCode}`;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao obter QR Code:', error);
      return null;
    }
  };

  const saveToSupabase = async (instanceData: EvolutionInstanceData, chatbotConfig: any): Promise<boolean> => {
    if (!user) {
      console.error('❌ Usuário não autenticado');
      return false;
    }

    try {
      console.log('💾 Salvando configuração no Supabase...');
      console.log('👤 User ID:', user.id);
      console.log('🤖 Instance ID real:', instanceData.instanceId);
      console.log('📞 Telefone da instância:', instanceData.phone);

      // Verificar se já existe configuração
      const { data: existing, error: searchError } = await supabase
        .from('chatbot_configs')
        .select('*')
        .eq('user_id', user.id)
        .eq('evo_instance_id', instanceData.instanceName)
        .maybeSingle();

      if (searchError) {
        console.error('❌ Erro ao buscar configuração existente:', searchError);
        return false;
      }

      const configData = {
        user_id: user.id,
        bot_name: chatbotConfig?.nome_da_IA || 'Chatbot',
        service_type: chatbotConfig?.nicho || 'WhatsApp',
        tone: chatbotConfig?.personalidade || 'Profissional',
        evo_instance_id: instanceData.instanceName,
        phone_number: instanceData.phone,
        is_active: true,
        webhook_url: `https://leowebhook.techcorps.com.br/webhook/${instanceData.instanceName}`,
        updated_at: new Date().toISOString(),
      };

      let result;
      
      if (existing) {
        // Atualizar configuração existente
        console.log('📝 Atualizando configuração existente...');
        
        const { data, error } = await supabase
          .from('chatbot_configs')
          .update(configData)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          console.error('❌ Erro ao atualizar:', error);
          return false;
        }
        result = data;
      } else {
        // Criar nova configuração
        console.log('🆕 Criando nova configuração...');
        
        const { data, error } = await supabase
          .from('chatbot_configs')
          .insert(configData)
          .select()
          .single();

        if (error) {
          console.error('❌ Erro ao inserir:', error);
          return false;
        }
        result = data;
      }

      console.log('✅ Configuração salva com sucesso:', result);
      
      toast({
        title: "✅ Configuração Salva!",
        description: `Instance ID: ${instanceData.instanceId} conectado ao usuário ${user.id}`,
        duration: 5000,
      });
      
      return true;
    } catch (error) {
      console.error('💥 Erro ao salvar no Supabase:', error);
      return false;
    }
  };

  const connectInstance = async (instanceName: string, chatbotConfig: any): Promise<EvolutionInstanceData | null> => {
    if (!user) {
      toast({
        title: "❌ Erro de Autenticação",
        description: "Usuário não está logado",
        variant: "destructive",
      });
      return null;
    }

    setIsConnecting(true);
    
    try {
      console.log('🔄 Iniciando processo de conexão para:', instanceName);
      
      // 1. Tentar buscar instância existente
      let instanceData = await fetchInstanceDetails(instanceName);
      
      // 2. Se não encontrar, criar nova instância
      if (!instanceData) {
        console.log('🆕 Instância não encontrada, criando nova...');
        instanceData = await createNewInstance(instanceName);
      }

      if (!instanceData) {
        throw new Error('Não foi possível obter ou criar a instância');
      }

      console.log('✅ Instance ID real capturado:', instanceData.instanceId);
      
      // 3. Salvar instance_id nos metadados do usuário
      const userUpdated = await updateUserInstanceId(instanceData.instanceName);
      if (!userUpdated) {
        console.warn('⚠️ Falha ao atualizar instance_id do usuário, mas continuando...');
      }
      
      // 4. Obter QR Code
      const qrCode = await getQRCode(instanceName);
      if (qrCode) {
        instanceData.qrCode = qrCode;
      }

      // 5. Salvar no Supabase com o Instance ID REAL
      const saved = await saveToSupabase(instanceData, chatbotConfig);
      
      if (saved) {
        setConnectionData(instanceData);
        
        toast({
          title: "🎯 SUCESSO TOTAL!",
          description: `Instance ID ${instanceData.instanceId} conectado e salvo nos metadados do usuário!`,
          duration: 10000,
        });
        
        return instanceData;
      } else {
        throw new Error('Falha ao salvar configuração no Supabase');
      }

    } catch (error) {
      console.error('💥 Erro no processo de conexão:', error);
      
      toast({
        title: "❌ Erro na Conexão",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    connectionData,
    isConnecting,
    connectInstance,
    fetchInstanceDetails,
    getQRCode,
  };
};
