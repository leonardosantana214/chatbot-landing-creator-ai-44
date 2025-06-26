
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EvolutionStatusData {
  instanceName: string;
  instanceId: string | null;
  phone: string | null;
  isConnected: boolean;
  status: string;
  lastCheck: Date;
  canSkipQR: boolean;
}

export const useEvolutionStatus = (instanceName?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<EvolutionStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const API_KEY = '09d18f5a0aa248bebdb35893efeb170e';
  const EVOLUTION_BASE_URL = 'https://leoevo.techcorps.com.br';

  const checkEvolutionConnection = useCallback(async (instanceName: string): Promise<{isConnected: boolean, phone?: string, state?: string}> => {
    try {
      const response = await fetch(`${EVOLUTION_BASE_URL}/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const isConnected = data.state === 'open';
        const phone = data.instance?.phone || null;
        
        if (isConnected) {
          return { isConnected, phone, state: data.state };
        }
        
        return { isConnected: false, state: data.state };
      }
      
      return { isConnected: false };
    } catch (error) {
      console.warn('⚠️ Erro ao verificar conexão Evolution:', error);
      return { isConnected: false };
    }
  }, []);

  const updateConnectionStatus = useCallback(async (instanceName: string, isConnected: boolean, phone?: string) => {
    if (!user) return;

    try {
      // Atualizar user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          connection_status: isConnected ? 'connected' : 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .eq('instance_name', instanceName);

      if (profileError) {
        console.warn('⚠️ Erro ao atualizar perfil:', profileError);
      }

      // Atualizar chatbot_configs
      const { error: configError } = await supabase
        .from('chatbot_configs')
        .update({
          connection_status: isConnected ? 'connected' : 'pending',
          evolution_phone: phone || null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (configError) {
        console.warn('⚠️ Erro ao atualizar config:', configError);
      }
    } catch (error) {
      console.error('💥 Erro ao atualizar status:', error);
    }
  }, [user]);

  const refreshStatus = useCallback(async (forceInstanceName?: string) => {
    const targetInstanceName = forceInstanceName || instanceName;
    if (!targetInstanceName || !user || isRefreshing) return;

    setIsRefreshing(true);
    setIsLoading(true);
    
    try {
      // 1. Buscar dados do Supabase primeiro
      const { data: configData } = await supabase
        .from('chatbot_configs')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!configData) {
        setStatus(null);
        return;
      }

      // 2. Verificar conexão na Evolution API
      const evolutionStatus = await checkEvolutionConnection(targetInstanceName);
      
      // 3. Verificar se houve mudança no status
      const currentlyConnected = configData.connection_status === 'connected';
      const nowConnected = evolutionStatus.isConnected;
      
      // 4. Se status mudou, atualizar no Supabase
      if (currentlyConnected !== nowConnected) {
        await updateConnectionStatus(targetInstanceName, nowConnected, evolutionStatus.phone);
        
        // Mostrar toast apenas quando conecta
        if (nowConnected && evolutionStatus.phone) {
          toast({
            title: "🎉 WhatsApp conectado automaticamente!",
            description: `Número: ${evolutionStatus.phone}`,
            duration: 5000,
          });
        }
      }

      // 5. Atualizar estado local sempre
      setStatus({
        instanceName: targetInstanceName,
        instanceId: configData.evo_instance_id,
        phone: evolutionStatus.phone || configData.evolution_phone,
        isConnected: evolutionStatus.isConnected,
        status: evolutionStatus.isConnected ? 'connected' : 'pending',
        lastCheck: new Date(),
        canSkipQR: true
      });

    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [instanceName, user, isRefreshing, checkEvolutionConnection, updateConnectionStatus, toast]);

  // Verificação inicial apenas quando necessário
  useEffect(() => {
    if (instanceName && user && !isRefreshing && !status) {
      refreshStatus();
    }
  }, [instanceName, user]);

  // Auto-refresh mais inteligente
  useEffect(() => {
    if (!instanceName || !user || isRefreshing) return;

    // Apenas verificar se não está conectado
    if (status && status.isConnected) return;

    const interval = setInterval(() => {
      if (!isRefreshing && (!status || !status.isConnected)) {
        refreshStatus();
      }
    }, 15000); // Verificar a cada 15 segundos apenas quando desconectado

    return () => clearInterval(interval);
  }, [instanceName, user, isRefreshing, status, refreshStatus]);

  return {
    status,
    isLoading,
    refreshStatus: () => {
      if (!isRefreshing) {
        refreshStatus();
      }
    }
  };
};
