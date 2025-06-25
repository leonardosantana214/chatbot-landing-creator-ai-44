
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

  const API_KEY = '09d18f5a0aa248bebdb35893efeb170e';
  const EVOLUTION_BASE_URL = 'https://leoevo.techcorps.com.br';

  const connectInstance = async (instanceName: string, config: ChatbotConfig): Promise<EvolutionConnectionData | null> => {
    setIsConnecting(true);
    
    try {
      console.log('🔄 Conectando instância:', instanceName);

      // 1. Verificar se instância já existe usando o endpoint correto
      const checkResponse = await fetch(`${EVOLUTION_BASE_URL}/instance/fetchInstances`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        }
      });

      let instanceData;
      let instanceExists = false;

      if (checkResponse.ok) {
        const allInstances = await checkResponse.json();
        const existingInstance = allInstances.find((inst: any) => inst.instanceName === instanceName);
        
        if (existingInstance) {
          instanceExists = true;
          instanceData = {
            instanceId: existingInstance.instanceId || existingInstance.id,
            phone: existingInstance.number || existingInstance.phone,
            qrCode: null
          };
          console.log('✅ Instância existente encontrada:', instanceData.instanceId);
        }
      }

      if (!instanceExists) {
        // 2. Criar nova instância usando o payload correto
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
            integration: 'WHATSAPP-BAILEYS',
            webhookUrl: `https://leowebhook.techcorps.com.br/webhook/${instanceName}`,
            webhookByEvents: false,
            webhookBase64: false,
            rejectCall: false,
            msgRetryCount: 3,
            markMessagesRead: false,
            alwaysOnline: false,
            readReceipts: false,
            readStatus: false,
            chatwootAccountId: "",
            chatwootToken: "",
            chatwootUrl: "",
            chatwootSignMsg: false,
            chatwootReopenConversation: false,
            chatwootConversationPending: false
          })
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          console.error('❌ Erro ao criar instância:', createResponse.status, errorText);
          throw new Error(`Erro ao criar instância: ${createResponse.status} - ${errorText}`);
        }

        const createData = await createResponse.json();
        instanceData = {
          instanceId: createData.instance?.instanceId || createData.instanceId || instanceName,
          qrCode: createData.qrcode?.base64 || createData.qr,
          phone: null
        };
        
        console.log('✅ Instância criada:', instanceData.instanceId);
      }

      // 3. Se instância existe mas não está conectada, obter QR Code
      if (instanceExists && !instanceData.phone) {
        console.log('📱 Obtendo QR Code para instância existente...');
        try {
          const qrResponse = await fetch(`${EVOLUTION_BASE_URL}/instance/connect/${instanceName}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'apikey': API_KEY
            }
          });

          if (qrResponse.ok) {
            const qrData = await qrResponse.json();
            instanceData.qrCode = qrData.base64 || qrData.qrcode;
          }
        } catch (qrError) {
          console.warn('⚠️ Erro ao obter QR Code, mas instância foi criada');
        }
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
