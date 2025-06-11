
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
      
      const { data, error } = await supabase
        .from('telefone_instancia')
        .upsert({
          instance_name: instanceName,
          phone_number: phoneNumber,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'instance_name'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao salvar telefone da instância:', error);
        return false;
      }

      console.log('✅ Telefone da instância salvo:', data);
      setInstancePhone(data);
      return true;
    } catch (error) {
      console.error('💥 Erro ao salvar telefone da instância:', error);
      return false;
    }
  };

  const getInstancePhone = async (instanceName: string): Promise<string | null> => {
    try {
      console.log('🔍 Buscando telefone da instância:', instanceName);
      
      // Primeiro tentar buscar no banco de dados
      const { data, error } = await supabase
        .from('telefone_instancia')
        .select('*')
        .eq('instance_name', instanceName)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ Erro ao buscar telefone da instância:', error);
        return null;
      }

      if (data) {
        console.log('✅ Telefone da instância encontrado no BD:', data.phone_number);
        setInstancePhone(data);
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
