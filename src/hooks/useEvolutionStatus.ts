
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EvolutionStatusData {
  instanceName: string;
  realInstanceId: string | null;
  phone: string | null;
  isConnected: boolean;
  status: string;
  lastCheck: Date;
}

export const useEvolutionStatus = (instanceName?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<EvolutionStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const API_KEY = '09d18f5a0aa248bebdb35893efeb170e';
  const EVOLUTION_BASE_URL = 'https://leoevo.techcorps.com.br';

  const fetchRealInstanceData = async (instanceName: string): Promise<{instanceId: string, phone: string} | null> => {
    try {
      console.log('🔍 Buscando dados REAIS da instância:', instanceName);
      
      // Usar o endpoint fetchInstances que retorna dados corretos
      const response = await fetch(`${EVOLUTION_BASE_URL}/instance/fetchInstances?instanceName=${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📡 Dados RAW da Evolution:', data);
        
        let instanceData: any;
        if (Array.isArray(data) && data.length > 0) {
          instanceData = data[0];
        } else {
          instanceData = data;
        }
        
        // Extrair o Instance ID REAL - diferentes possibilidades
        const realInstanceId = instanceData.instance?.instanceId || 
                              instanceData.instanceId || 
                              instanceData.instance?.id ||
                              instanceData.id ||
                              instanceData.key ||
                              null;
        
        // Extrair telefone
        const phone = instanceData.instance?.phone || 
                     instanceData.phone || 
                     instanceData.instance?.number || 
                     instanceData.number ||
                     instanceData.phoneNumber ||
                     '';
        
        const cleanPhone = phone.replace(/\D/g, '');
        
        console.log('✅ Instance ID REAL encontrado:', realInstanceId);
        console.log('✅ Telefone encontrado:', cleanPhone);
        
        if (realInstanceId && realInstanceId !== instanceName) {
          toast({
            title: "🎯 Instance ID Real capturado!",
            description: `ID: ${realInstanceId} | Tel: ${cleanPhone}`,
            duration: 8000,
          });
        }
        
        return {
          instanceId: realInstanceId || instanceName,
          phone: cleanPhone
        };
      } else {
        console.error('❌ Erro na API Evolution:', response.status);
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados reais:', error);
      return null;
    }
  };

  const checkConnectionStatus = async (instanceName: string): Promise<boolean> => {
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
        return data.state === 'open';
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      return false;
    }
  };

  const saveRealDataToSupabase = async (instanceName: string, realInstanceId: string, phone: string, isConnected: boolean) => {
    if (!user) return;

    try {
      console.log('💾 Salvando dados REAIS no Supabase:', { instanceName, realInstanceId, phone, isConnected });
      
      // Atualizar user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          instance_id: instanceName,
          real_instance_id: realInstanceId,
          evolution_phone: phone,
          connection_status: isConnected ? 'connected' : 'disconnected',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('❌ Erro ao atualizar perfil:', profileError);
      }

      // Atualizar ou criar chatbot_configs
      const { data: existingConfig } = await supabase
        .from('chatbot_configs')
        .select('*')
        .eq('user_id', user.id)
        .eq('evo_instance_id', instanceName)
        .single();

      if (existingConfig) {
        const { error: configError } = await supabase
          .from('chatbot_configs')
          .update({
            real_instance_id: realInstanceId,
            evolution_phone: phone,
            phone_number: phone,
            connection_status: isConnected ? 'connected' : 'disconnected',
            last_status_check: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConfig.id);

        if (configError) {
          console.error('❌ Erro ao atualizar config:', configError);
        }
      } else {
        const { error: insertError } = await supabase
          .from('chatbot_configs')
          .insert({
            user_id: user.id,
            evo_instance_id: instanceName,
            real_instance_id: realInstanceId,
            evolution_phone: phone,
            phone_number: phone,
            bot_name: `Bot ${instanceName}`,
            service_type: 'WhatsApp',
            tone: 'Profissional',
            is_active: true,
            connection_status: isConnected ? 'connected' : 'disconnected',
            last_status_check: new Date().toISOString(),
            webhook_url: `https://leowebhook.techcorps.com.br/webhook/${instanceName}`
          });

        if (insertError) {
          console.error('❌ Erro ao criar config:', insertError);
        }
      }

      console.log('✅ Dados REAIS salvos no Supabase com sucesso!');
    } catch (error) {
      console.error('💥 Erro ao salvar dados:', error);
    }
  };

  const refreshStatus = async (forceInstanceName?: string) => {
    const targetInstanceName = forceInstanceName || instanceName;
    if (!targetInstanceName || !user) return;

    setIsLoading(true);
    
    try {
      console.log('🔄 Atualizando status da instância:', targetInstanceName);
      
      // 1. Buscar dados reais da Evolution
      const realData = await fetchRealInstanceData(targetInstanceName);
      
      if (realData) {
        // 2. Verificar status de conexão
        const isConnected = await checkConnectionStatus(targetInstanceName);
        
        // 3. Salvar dados reais no Supabase
        await saveRealDataToSupabase(targetInstanceName, realData.instanceId, realData.phone, isConnected);
        
        // 4. Atualizar estado local
        setStatus({
          instanceName: targetInstanceName,
          realInstanceId: realData.instanceId,
          phone: realData.phone,
          isConnected,
          status: isConnected ? 'connected' : 'disconnected',
          lastCheck: new Date()
        });
        
        console.log('✅ Status atualizado com dados REAIS:', {
          instanceName: targetInstanceName,
          realInstanceId: realData.instanceId,
          phone: realData.phone,
          isConnected
        });
      } else {
        // Se não conseguiu dados da Evolution, buscar do Supabase
        const { data: configData } = await supabase
          .from('chatbot_configs')
          .select('*')
          .eq('user_id', user.id)
          .eq('evo_instance_id', targetInstanceName)
          .single();

        if (configData) {
          setStatus({
            instanceName: targetInstanceName,
            realInstanceId: configData.real_instance_id,
            phone: configData.evolution_phone,
            isConnected: configData.connection_status === 'connected',
            status: configData.connection_status || 'disconnected',
            lastCheck: new Date()
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      toast({
        title: "Erro ao verificar status",
        description: "Não foi possível verificar o status da instância",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    if (instanceName) {
      refreshStatus();
      const interval = setInterval(() => refreshStatus(), 30000);
      return () => clearInterval(interval);
    }
  }, [instanceName, user]);

  return {
    status,
    isLoading,
    refreshStatus
  };
};
