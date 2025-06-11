
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InstancePhone {
  id?: string;
  instance_name: string;
  instance_id: string; // ID real da instância
  phone_number: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useInstancePhoneManager = () => {
  const [instancePhone, setInstancePhone] = useState<InstancePhone | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getEvolutionInstanceData = async (instanceName: string): Promise<{instanceId: string, phone: string} | null> => {
    try {
      const API_KEY = '09d18f5a0aa248bebdb35893efeb170e';
      const EVOLUTION_BASE_URL = 'https://leoevo.techcorps.com.br';
      
      console.log('🔍 Buscando dados completos da instância Evolution:', instanceName);
      
      const response = await fetch(`${EVOLUTION_BASE_URL}/instance/fetch/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📡 Dados completos recebidos da Evolution:', data);
        
        // Extrair o instance_id real (pode estar em diferentes campos)
        const instanceId = data.instance?.instanceId || 
                          data.instanceId || 
                          data.instance?.id ||
                          data.id ||
                          data.instance?.key ||
                          instanceName; // fallback para o nome se não encontrar ID específico
        
        // Extrair o telefone
        const evolutionPhone = data.instance?.phone || 
                              data.phone || 
                              data.instance?.number || 
                              data.number ||
                              data.instance?.phoneNumber ||
                              '';
        
        const cleanPhone = evolutionPhone.replace(/\D/g, '');
        
        console.log('✅ Instance ID encontrado:', instanceId);
        console.log('✅ Telefone encontrado:', cleanPhone);
        
        return {
          instanceId: instanceId,
          phone: cleanPhone
        };
      } else {
        console.error('❌ Erro na API Evolution:', response.status);
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar dados da Evolution:', error);
      return null;
    }
  };

  const saveInstanceData = async (instanceName: string, instanceId: string, phoneNumber: string): Promise<boolean> => {
    try {
      console.log('💾 Salvando dados da instância no Supabase:', { instanceName, instanceId, phoneNumber });
      
      // Primeiro, verificar se já existe configuração para esta instância
      const { data: existingConfig, error: searchError } = await supabase
        .from('chatbot_configs')
        .select('*')
        .eq('evo_instance_id', instanceName)
        .single();

      let result;
      
      if (existingConfig) {
        // Atualizar configuração existente com o instance_id real
        console.log('📝 Atualizando configuração existente...');
        const { data, error } = await supabase
          .from('chatbot_configs')
          .update({
            user_id: instanceId, // USAR O INSTANCE_ID COMO USER_ID
            phone_number: phoneNumber,
            updated_at: new Date().toISOString(),
          })
          .eq('evo_instance_id', instanceName)
          .select()
          .single();

        if (error) {
          console.error('❌ Erro ao atualizar configuração:', error);
          return false;
        }
        result = data;
      } else {
        // Criar nova configuração com instance_id como user_id
        console.log('🆕 Criando nova configuração...');
        const { data, error } = await supabase
          .from('chatbot_configs')
          .insert({
            user_id: instanceId, // USAR O INSTANCE_ID COMO USER_ID
            evo_instance_id: instanceName,
            phone_number: phoneNumber,
            bot_name: `Bot ${instanceName}`,
            service_type: 'WhatsApp',
            tone: 'Profissional',
            is_active: true,
            webhook_url: `https://leowebhook.techcorps.com.br/webhook/${instanceName}`
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Erro ao criar configuração:', error);
          return false;
        }
        result = data;
      }

      console.log('✅ Dados da instância salvos no Supabase:', result);
      console.log('🎯 USER_ID setado como INSTANCE_ID:', instanceId);
      
      // Mapear para a interface InstancePhone
      const mappedData: InstancePhone = {
        id: result.id,
        instance_name: result.evo_instance_id || instanceName,
        instance_id: instanceId,
        phone_number: result.phone_number || phoneNumber,
        is_active: result.is_active || true,
        created_at: result.created_at,
        updated_at: result.updated_at,
      };
      
      setInstancePhone(mappedData);
      return true;
    } catch (error) {
      console.error('💥 Erro ao salvar dados da instância:', error);
      return false;
    }
  };

  const getInstancePhone = async (instanceName: string): Promise<string | null> => {
    try {
      console.log('🔍 Processando instância:', instanceName);
      
      // Primeiro, buscar dados reais da Evolution API
      console.log('📞 Buscando dados da Evolution API...');
      const evolutionData = await getEvolutionInstanceData(instanceName);
      
      if (evolutionData) {
        const { instanceId, phone } = evolutionData;
        
        if (instanceId && phone) {
          // Salvar os dados reais no Supabase
          const saved = await saveInstanceData(instanceName, instanceId, phone);
          if (saved) {
            console.log('✅ Instance ID capturado e usado como USER_ID:', instanceId);
            console.log('✅ Telefone capturado:', phone);
            
            toast({
              title: "Instance ID capturado!",
              description: `ID: ${instanceId} | Tel: ${phone}`,
            });
            
            return phone;
          }
        }
      }

      // Se não conseguiu da API, tentar buscar do BD
      console.log('📋 Buscando no banco de dados...');
      const { data, error } = await supabase
        .from('chatbot_configs')
        .select('*')
        .eq('evo_instance_id', instanceName)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar no BD:', error);
        return null;
      }

      if (data && data.phone_number) {
        console.log('✅ Dados encontrados no BD:', data);
        
        const mappedData: InstancePhone = {
          id: data.id,
          instance_name: data.evo_instance_id || instanceName,
          instance_id: data.user_id, // O user_id agora é o instance_id real
          phone_number: data.phone_number,
          is_active: data.is_active || true,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        
        setInstancePhone(mappedData);
        return data.phone_number;
      }

      console.log('❌ Não foi possível obter dados da instância');
      return null;
    } catch (error) {
      console.error('💥 Erro ao obter dados da instância:', error);
      return null;
    }
  };

  const processInstanceConnection = async (instanceName: string) => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Processando conexão da instância:', instanceName);
      
      const phoneNumber = await getInstancePhone(instanceName);
      
      if (phoneNumber) {
        const instanceData = instancePhone;
        toast({
          title: "Instância processada com sucesso!",
          description: `Instance ID: ${instanceData?.instance_id} | Tel: ${phoneNumber}`,
        });
        return {
          instanceId: instanceData?.instance_id,
          phoneNumber
        };
      } else {
        toast({
          title: "Erro ao processar instância",
          description: "Não foi possível obter dados da instância",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao processar conexão da instância:', error);
      toast({
        title: "Erro no processamento",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    instancePhone,
    isLoading,
    getInstancePhone,
    saveInstanceData,
    processInstanceConnection,
    getEvolutionInstanceData,
  };
};
