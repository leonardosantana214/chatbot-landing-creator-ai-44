
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface EvolutionConnectionData {
  instanceId: string;
  phone?: string;
  qrCode?: string;
}

interface ChatbotConfig {
  nome_da_IA?: string;
  empresa?: string;
  nicho?: string;
  [key: string]: any;
}

export const useEvolutionConnection = () => {
  const [connectionData, setConnectionData] = useState<EvolutionConnectionData | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const API_KEY = '09d18f5a0aa248bebdb35893efeb170e'; // Usando diretamente a API key
  const EVOLUTION_BASE_URL = 'https://leoevo.techcorps.com.br';

  const connectInstance = async (instanceName: string, config: ChatbotConfig): Promise<EvolutionConnectionData | null> => {
    setIsConnecting(true);
    
    try {
      console.log('🔄 Conectando instância:', instanceName);

      // 1. Verificar se instância já existe
      const checkResponse = await fetch(`${EVOLUTION_BASE_URL}/instance/fetchInstances?instanceName=${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        }
      });

      let instanceData;

      if (checkResponse.status === 404) {
        // 2. Criar nova instância se não existir
        console.log('🆕 Criando nova instância...');
        const createResponse = await fetch(`${EVOLUTION_BASE_URL}/instance/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': API_KEY
          },
          body: JSON.stringify({
            instanceName: instanceName,
            qrcode: true,
            integration: 'WHATSAPP-BAILEYS'
          })
        });

        if (!createResponse.ok) {
          throw new Error(`Erro ao criar instância: ${createResponse.status}`);
        }

        const createData = await createResponse.json();
        instanceData = {
          instanceId: createData.instance.instanceId,
          qrCode: createData.qrcode?.base64,
          phone: null
        };
        
        console.log('✅ Instância criada:', instanceData.instanceId);
      } else if (checkResponse.ok) {
        // 3. Instância já existe, obter dados
        const existingData = await checkResponse.json();
        const instance = existingData[0];
        
        instanceData = {
          instanceId: instance.id,
          phone: instance.number,
          qrCode: null
        };

        // Se não estiver conectada, obter QR Code
        if (instance.connectionStatus !== 'open') {
          console.log('📱 Obtendo QR Code...');
          const qrResponse = await fetch(`${EVOLUTION_BASE_URL}/instance/connect/${instanceName}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'apikey': API_KEY
            }
          });

          if (qrResponse.ok) {
            const qrData = await qrResponse.json();
            instanceData.qrCode = qrData.base64;
          }
        }
        
        console.log('✅ Instância existente encontrada:', instanceData.instanceId);
      } else {
        throw new Error(`Erro ao verificar instância: ${checkResponse.status}`);
      }

      setConnectionData(instanceData);
      return instanceData;

    } catch (error) {
      console.error('❌ Erro na conexão Evolution:', error);
      toast({
        title: "Erro na conexão",
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
    connectInstance
  };
};
