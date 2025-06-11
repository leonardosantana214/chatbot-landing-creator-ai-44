
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InstancePhone {
  id?: string;
  instance_name: string;
  phone_number: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useInstancePhoneManager = () => {
  const [instancePhone, setInstancePhone] = useState<InstancePhone | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getEvolutionInstancePhone = async (instanceName: string): Promise<string> => {
    try {
      const API_KEY = '09d18f5a0aa248bebdb35893efeb170e';
      const EVOLUTION_BASE_URL = 'https://leoevo.techcorps.com.br';
      
      const response = await fetch(`${EVOLUTION_BASE_URL}/instance/fetch/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const evolutionPhone = data.instance?.phone || data.phone || '';
        return evolutionPhone.replace(/\D/g, '');
      }
      
      return '';
    } catch (error) {
      console.error('❌ Erro ao buscar telefone da Evolution:', error);
      return '';
    }
  };

  const saveInstancePhone = async (instanceName: string, phoneNumber: string): Promise<boolean> => {
    try {
      console.log('💾 Salvando telefone da instância:', { instanceName, phoneNumber });
      
      // Usar a tabela chatbot_configs que já existe
      const { data, error } = await supabase
        .from('chatbot_configs')
        .update({
          phone_number: phoneNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('evo_instance_id', instanceName)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao salvar telefone da instância:', error);
        return false;
      }

      console.log('✅ Telefone da instância salvo:', data);
      
      // Mapear para a interface InstancePhone
      const mappedData: InstancePhone = {
        id: data.id,
        instance_name: data.evo_instance_id || instanceName,
        phone_number: data.phone_number || phoneNumber,
        is_active: data.is_active || true,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      
      setInstancePhone(mappedData);
      return true;
    } catch (error) {
      console.error('💥 Erro ao salvar telefone da instância:', error);
      return false;
    }
  };

  const getInstancePhone = async (instanceName: string): Promise<string | null> => {
    try {
      console.log('🔍 Buscando telefone da instância:', instanceName);
      
      // Buscar na tabela chatbot_configs
      const { data, error } = await supabase
        .from('chatbot_configs')
        .select('*')
        .eq('evo_instance_id', instanceName)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ Erro ao buscar telefone da instância:', error);
        return null;
      }

      if (data && data.phone_number) {
        console.log('✅ Telefone da instância encontrado no BD:', data.phone_number);
        
        // Mapear para a interface InstancePhone
        const mappedData: InstancePhone = {
          id: data.id,
          instance_name: data.evo_instance_id || instanceName,
          phone_number: data.phone_number,
          is_active: data.is_active || true,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        
        setInstancePhone(mappedData);
        return data.phone_number;
      }

      // Se não encontrou no BD, buscar na Evolution API e salvar
      console.log('📞 Buscando telefone na Evolution API...');
      const phoneFromAPI = await getEvolutionInstancePhone(instanceName);
      
      if (phoneFromAPI) {
        const saved = await saveInstancePhone(instanceName, phoneFromAPI);
        if (saved) {
          return phoneFromAPI;
        }
      }

      return null;
    } catch (error) {
      console.error('💥 Erro ao obter telefone da instância:', error);
      return null;
    }
  };

  const processInstanceConnection = async (instanceName: string) => {
    setIsLoading(true);
    
    try {
      const phoneNumber = await getInstancePhone(instanceName);
      
      if (phoneNumber) {
        toast({
          title: "Telefone da instância capturado!",
          description: `Instância ${instanceName}: ${phoneNumber}`,
        });
        return phoneNumber;
      } else {
        toast({
          title: "Erro ao capturar telefone",
          description: "Não foi possível obter o telefone da instância",
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
    saveInstancePhone,
    processInstanceConnection,
    getEvolutionInstancePhone,
  };
};
