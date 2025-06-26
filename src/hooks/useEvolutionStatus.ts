
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

  const checkEvolutionConnection = useCallback(async (instanceName: string): Promise<{isConnected: boolean, phone?: string}> => {
    try {
      console.log('🔍 Verificando conexão Evolution para:', instanceName);
      
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
        
        if (isConnected && data.instance?.phone) {
          return { isConnected, phone: data.instance.phone };
        }
        
        return { isConnected };
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
      console.log('💾 Atualizando status de conexão:', { instanceName, isConnected, phone });
      
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

      // Atualizar chatbot_configs - usando apenas campos que existem no tipo
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

      console.log('✅ Status atualizado no Supabase');
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
      console.log('🔄 Atualizando status:', targetInstanceName);
      
      // 1. Buscar dados do Supabase primeiro
      const { data: configData } = await supabase
        .from('chatbot_configs')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!configData) {
        console.log('❌ Configuração não encontrada para:', targetInstanceName);
        setStatus(null);
        return;
      }

      // 2. Verificar conexão na Evolution
      const evolutionStatus = await checkEvolutionConnection(targetInstanceName);
      
      // 3. Atualizar status apenas se houve mudança
      const currentStatus = configData.connection_status === 'connected';
      if (currentStatus !== evolutionStatus.isConnected) {
        await updateConnectionStatus(targetInstanceName, evolutionStatus.isConnected, evolutionStatus.phone);
      }

      // 4. Atualizar estado local
      setStatus({
        instanceName: targetInstanceName,
        instanceId: configData.evo_instance_id,
        phone: evolutionStatus.phone || configData.evolution_phone,
        isConnected: evolutionStatus.isConnected,
        status: evolutionStatus.isConnected ? 'connected' : 'pending',
        lastCheck: new Date(),
        canSkipQR: true // Sempre true por padrão
      });

      if (evolutionStatus.isConnected && evolutionStatus.phone) {
        toast({
          title: "✅ WhatsApp conectado!",
          description: `Número: ${evolutionStatus.phone}`,
          duration: 3000,
        });
      }

    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [instanceName, user, isRefreshing, checkEvolutionConnection, updateConnectionStatus, toast]);

  // Buscar status inicial apenas uma vez
  useEffect(() => {
    if (instanceName && user && !status && !isRefreshing) {
      console.log('🚀 Buscando status inicial para:', instanceName);
      refreshStatus();
    }
  }, [instanceName, user, status, isRefreshing]);

  // Auto-refresh com intervalo maior
  useEffect(() => {
    if (!instanceName || !user || !status || isRefreshing) return;

    const interval = setInterval(() => {
      if (!isRefreshing) {
        refreshStatus();
      }
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, [instanceName, user, status, isRefreshing]);

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
