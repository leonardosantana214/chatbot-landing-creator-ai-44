
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EvolutionInstanceStatus {
  instanceName: string;
  status: 'open' | 'close' | 'connecting';
  qrcode?: string;
  connected: boolean;
}

export const useEvolutionApi = () => {
  const { toast } = useToast();
  
  const API_KEY = '09d18f5a0aa248bebdb35893efeb170e';
  const EVOLUTION_BASE_URL = 'https://leoevo.techcorps.com.br';

  const checkInstanceStatus = async (instanceName: string): Promise<EvolutionInstanceStatus> => {
    try {
      console.log('Verificando status da instância:', instanceName);
      
      // Primeiro, verificar se a instância existe
      const instanceResponse = await fetch(`${EVOLUTION_BASE_URL}/instance/fetchInstances`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (instanceResponse.ok) {
        const instances = await instanceResponse.json();
        console.log('Instâncias encontradas:', instances);
        
        const instance = instances.find((inst: any) => inst.instance?.instanceName === instanceName);
        
        if (!instance) {
          console.log('Instância não encontrada');
          return {
            instanceName,
            status: 'close',
            connected: false
          };
        }
      }

      // Verificar status de conexão
      const response = await fetch(`${EVOLUTION_BASE_URL}/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Status da instância:', data);
        
        const isConnected = data.state === 'open';
        
        return {
          instanceName,
          status: data.state || 'close',
          connected: isConnected,
          qrcode: data.qrcode
        };
      } else {
        console.error('Erro ao verificar status:', response.status);
        return {
          instanceName,
          status: 'close',
          connected: false
        };
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      return {
        instanceName,
        status: 'close',
        connected: false
      };
    }
  };

  const getQRCode = async (instanceName: string): Promise<string | null> => {
    try {
      console.log('Obtendo QR Code para:', instanceName);
      
      const response = await fetch(`${EVOLUTION_BASE_URL}/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.qrcode || data.qr || data.base64 || null;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
      return null;
    }
  };

  return {
    checkInstanceStatus,
    getQRCode
  };
};
