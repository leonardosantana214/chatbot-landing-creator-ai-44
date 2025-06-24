
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface EvolutionStatus {
  isConnected: boolean;
  status: 'open' | 'close' | 'connecting' | 'error';
  instanceName: string;
  phone?: string;
  lastCheck: Date;
}

export const useEvolutionStatus = (instanceName?: string) => {
  const [status, setStatus] = useState<EvolutionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const API_KEY = '09d18f5a0aa248bebdb35893efeb170e';
  const EVOLUTION_BASE_URL = 'https://leoevo.techcorps.com.br';

  const checkStatus = async (instanceToCheck?: string): Promise<EvolutionStatus | null> => {
    const targetInstance = instanceToCheck || instanceName;
    if (!targetInstance) return null;

    setIsLoading(true);
    
    try {
      console.log('🔍 Verificando status real da instância:', targetInstance);
      
      const response = await fetch(`${EVOLUTION_BASE_URL}/instance/fetchInstances?instanceName=${targetInstance}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📡 Dados recebidos da Evolution:', data);
        
        let instanceData: any;
        if (Array.isArray(data) && data.length > 0) {
          instanceData = data[0];
        } else {
          instanceData = data;
        }

        const currentStatus = instanceData?.status || 'close';
        const isConnected = currentStatus === 'open';
        const phone = instanceData?.number || instanceData?.phone || '';

        const newStatus: EvolutionStatus = {
          isConnected,
          status: currentStatus,
          instanceName: targetInstance,
          phone: phone.replace(/\D/g, ''),
          lastCheck: new Date()
        };

        setStatus(newStatus);
        return newStatus;
      } else {
        console.log('⚠️ Instância não encontrada na Evolution');
        const errorStatus: EvolutionStatus = {
          isConnected: false,
          status: 'close',
          instanceName: targetInstance,
          lastCheck: new Date()
        };
        setStatus(errorStatus);
        return errorStatus;
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      const errorStatus: EvolutionStatus = {
        isConnected: false,
        status: 'error',
        instanceName: targetInstance,
        lastCheck: new Date()
      };
      setStatus(errorStatus);
      return errorStatus;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStatus = (): Promise<EvolutionStatus | null> => {
    return checkStatus();
  };

  useEffect(() => {
    if (instanceName) {
      checkStatus();
      const interval = setInterval(() => checkStatus(), 30000);
      return () => clearInterval(interval);
    }
  }, [instanceName]);

  return {
    status,
    isLoading,
    checkStatus,
    refreshStatus
  };
};
