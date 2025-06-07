
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
      console.log('🔍 Verificando status da instância:', instanceName);
      
      // Verificar status de conexão diretamente
      const response = await fetch(`${EVOLUTION_BASE_URL}/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      console.log('📡 Resposta da API Evolution:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Dados recebidos da Evolution:', data);
        
        // Verificar se está conectado baseado no estado
        const isConnected = data.state === 'open';
        const status = data.state || 'close';
        
        console.log(`✅ Status processado: ${status}, Conectado: ${isConnected}`);
        
        return {
          instanceName,
          status: status,
          connected: isConnected,
          qrcode: data.qrcode || data.qr || data.base64
        };
      } else {
        console.warn('⚠️ Erro na resposta da API:', response.status);
        
        // Se erro 404, instância não existe
        if (response.status === 404) {
          console.log('❌ Instância não encontrada na Evolution API');
          return {
            instanceName,
            status: 'close',
            connected: false
          };
        }
        
        // Para outros erros, assumir desconectado
        return {
          instanceName,
          status: 'close',
          connected: false
        };
      }
    } catch (error) {
      console.error('💥 Erro ao verificar status da instância:', error);
      return {
        instanceName,
        status: 'close',
        connected: false
      };
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
        console.log('✅ QR Code obtido com sucesso');
        return data.qrcode || data.qr || data.base64 || null;
      } else {
        console.warn('⚠️ Erro ao obter QR Code:', response.status);
      }
      
      return null;
    } catch (error) {
      console.error('💥 Erro ao obter QR Code:', error);
      return null;
    }
  };

  return {
    checkInstanceStatus,
    getQRCode
  };
};
