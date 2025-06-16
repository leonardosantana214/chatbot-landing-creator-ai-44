
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

  const API_KEY = '09d18f5a0aa248bebdb35893efeb170e';
  const EVOLUTION_BASE_URL = 'https://leoevo.techcorps.com.br';

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

  const connectInstance = async (instanceName: string, chatbotConfig: any): Promise<EvolutionInstanceData | null> => {
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
      
      // 3. Obter QR Code
      const qrCode = await getQRCode(instanceName);
      if (qrCode) {
        instanceData.qrCode = qrCode;
      }

      setConnectionData(instanceData);
      
      toast({
        title: "🎯 Instância Evolution criada!",
        description: `Instance ID: ${instanceData.instanceId} pronto para uso!`,
        duration: 5000,
      });
      
      return instanceData;

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
