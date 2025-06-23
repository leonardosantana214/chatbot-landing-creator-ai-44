
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface EvolutionApiResponse {
  instanceName: string;
  status: string;
  connected: boolean;
  qrCode?: string;
  phone?: string;
}

export const useEvolutionApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const API_KEY = '09d18f5a0aa248bebdb35893efeb170e';
  const EVOLUTION_BASE_URL = 'https://leoevo.techcorps.com.br';

  const checkInstanceStatus = async (instanceName: string): Promise<EvolutionApiResponse | null> => {
    try {
      setIsLoading(true);
      console.log('🔍 Verificando status da instância:', instanceName);
      
      // Try the fetchInstances endpoint first (this seems to work based on your other code)
      const response = await fetch(`${EVOLUTION_BASE_URL}/instance/fetchInstances?instanceName=${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      console.log('📡 Status da resposta Evolution:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Instância encontrada:', data);
        
        // Handle array response
        let instanceData;
        if (Array.isArray(data) && data.length > 0) {
          instanceData = data[0];
        } else {
          instanceData = data;
        }
        
        return {
          instanceName,
          status: instanceData.status || 'unknown',
          connected: instanceData.status === 'open' || instanceData.connected === true,
          phone: instanceData.number || instanceData.phone || '',
          qrCode: instanceData.qrcode || instanceData.qr || ''
        };
      } else {
        console.log('⚠️ Instância não encontrada, tentando criar nova...');
        
        // If instance doesn't exist, try to create it
        const createResponse = await fetch(`${EVOLUTION_BASE_URL}/instance/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': API_KEY,
          },
          body: JSON.stringify({
            instanceName: instanceName,
            qrcode: true,
            integration: 'WHATSAPP-BAILEYS'
          }),
        });

        if (createResponse.ok) {
          console.log('✅ Nova instância criada com sucesso');
          toast({
            title: "Instância criada!",
            description: `A instância ${instanceName} foi criada com sucesso.`,
          });
          
          // Return pending status while instance initializes
          return {
            instanceName,
            status: 'close',
            connected: false,
          };
        } else {
          console.error('❌ Erro ao criar instância:', createResponse.status);
          const errorText = await createResponse.text();
          console.error('❌ Detalhes do erro:', errorText);
        }
      }
      
      // Fallback response for error cases
      return {
        instanceName,
        status: 'close',
        connected: false
      };

    } catch (error) {
      console.error('💥 Erro ao verificar status da instância:', error);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar com a API Evolution.",
        variant: "destructive",
      });
      
      return {
        instanceName,
        status: 'error',
        connected: false
      };
    } finally {
      setIsLoading(false);
    }
  };

  const connectInstance = async (instanceName: string): Promise<string | null> => {
    try {
      setIsLoading(true);
      console.log('🔗 Conectando instância:', instanceName);
      
      const response = await fetch(`${EVOLUTION_BASE_URL}/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const qrCode = data.qrcode || data.qr || data.base64;
        
        if (qrCode) {
          console.log('✅ QR Code obtido com sucesso');
          return qrCode.startsWith('data:image') ? qrCode : `data:image/png;base64,${qrCode}`;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao conectar instância:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    checkInstanceStatus,
    connectInstance,
  };
};
