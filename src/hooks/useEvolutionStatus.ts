
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
      console.log('🔍 Verificando conexão da instância:', instanceName);
      
      const response = await fetch(`${EVOLUTION_BASE_URL}/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Status da conexão recebido:', data);
        
        // CORREÇÃO: Verificar tanto o state direto quanto o instance.state
        const connectionState = data.state || data.instance?.state;
        const isConnected = connectionState === 'open';
        const phone = data.instance?.phone || data.phone || null;
        
        console.log('✅ Estado da conexão:', {
          connectionState,
          isConnected,
          phone,
          rawData: data
        });
        
        return { 
          isConnected, 
          phone, 
          state: connectionState 
        };
      } else {
        console.warn('⚠️ Erro na resposta da API:', response.status);
        return { isConnected: false };
      }
      
    } catch (error) {
      console.warn('⚠️ Erro ao verificar conexão Evolution:', error);
      return { isConnected: false };
    }
  }, []);

  const updateConnectionStatus = useCallback(async (instanceName: string, isConnected: boolean, phone?: string) => {
    if (!user) return;

    try {
      console.log('💾 Atualizando status no Supabase:', { instanceName, isConnected, phone });
      
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
      
      console.log('✅ Status atualizado no Supabase com sucesso');
    } catch (error) {
      console.error('💥 Erro ao atualizar status:', error);
    }
  }, [user]);

  const refreshStatus = useCallback(async (forceInstanceName?: string) => {
    const targetInstanceName = forceInstanceName || instanceName;
    if (!targetInstanceName || !user || isRefreshing) return;

    console.log('🔄 Iniciando verificação de status para:', targetInstanceName);
    setIsRefreshing(true);
    setIsLoading(true);
    
    try {
      // 1. Verificar conexão na Evolution API PRIMEIRO
      const evolutionStatus = await checkEvolutionConnection(targetInstanceName);
      console.log('📡 Status da Evolution API:', evolutionStatus);
      
      // 2. Buscar dados do Supabase
      const { data: configData } = await supabase
        .from('chatbot_configs')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!configData) {
        console.warn('⚠️ Configuração não encontrada no Supabase');
        setStatus(null);
        return;
      }

      // 3. Verificar se houve mudança no status
      const currentlyConnected = configData.connection_status === 'connected';
      const nowConnected = evolutionStatus.isConnected;
      
      console.log('🔄 Comparando status:', {
        currentlyConnected,
        nowConnected,
        shouldUpdate: currentlyConnected !== nowConnected
      });
      
      // 4. Se status mudou, atualizar no Supabase
      if (currentlyConnected !== nowConnected) {
        console.log('🔄 Status mudou, atualizando...');
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

      // 5. Atualizar estado local SEMPRE com dados da Evolution API
      const newStatus: EvolutionStatusData = {
        instanceName: targetInstanceName,
        instanceId: configData.evo_instance_id,
        phone: evolutionStatus.phone || configData.evolution_phone,
        isConnected: evolutionStatus.isConnected, // SEMPRE usar dados da Evolution API
        status: evolutionStatus.isConnected ? 'connected' : 'pending',
        lastCheck: new Date(),
        canSkipQR: true
      };
      
      console.log('✅ Novo status definido:', newStatus);
      setStatus(newStatus);

    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [instanceName, user, isRefreshing, checkEvolutionConnection, updateConnectionStatus, toast]);

  // Verificação inicial
  useEffect(() => {
    if (instanceName && user && !isRefreshing && !status) {
      console.log('🚀 Iniciando verificação inicial...');
      refreshStatus();
    }
  }, [instanceName, user]);

  // Auto-refresh apenas quando desconectado
  useEffect(() => {
    if (!instanceName || !user || isRefreshing) return;

    // Se já está conectado, não precisa verificar mais
    if (status && status.isConnected) {
      console.log('✅ Já conectado, parando verificações automáticas');
      return;
    }

    console.log('🔄 Iniciando verificações automáticas (desconectado)');
    const interval = setInterval(() => {
      if (!isRefreshing && (!status || !status.isConnected)) {
        console.log('⏰ Verificação automática executando...');
        refreshStatus();
      }
    }, 10000); // Verificar a cada 10 segundos

    return () => {
      console.log('🛑 Parando verificações automáticas');
      clearInterval(interval);
    };
  }, [instanceName, user, isRefreshing, status, refreshStatus]);

  return {
    status,
    isLoading,
    refreshStatus: () => {
      if (!isRefreshing) {
        console.log('🔄 Refresh manual solicitado');
        refreshStatus();
      }
    }
  };
};
