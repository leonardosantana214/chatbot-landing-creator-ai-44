
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PhoneData {
  user_phone: string;
  evolution_phone: string;
  concatenated_key: string;
  user_id: string;
}

export const usePhoneManager = () => {
  const [phoneData, setPhoneData] = useState<PhoneData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const extractPhoneFromWhatsApp = (whatsappData: any): string => {
    // Extrair número do WhatsApp (formato pode variar)
    const phone = whatsappData.from || whatsappData.phone || whatsappData.number || '';
    // Limpar o número (remover caracteres especiais, manter apenas números)
    return phone.replace(/\D/g, '');
  };

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
      console.error('Erro ao buscar telefone da Evolution:', error);
      return '';
    }
  };

  const findOrCreateUser = async (userPhone: string): Promise<string | null> => {
    try {
      // Primeiro, tentar encontrar usuário existente pelo telefone
      const { data: existingContact, error: searchError } = await supabase
        .from('contacts')
        .select('user_id')
        .eq('phone', userPhone)
        .limit(1);

      if (searchError) {
        console.error('Erro ao buscar contato:', searchError);
        return null;
      }

      if (existingContact && existingContact.length > 0) {
        return existingContact[0].user_id;
      }

      // Se não encontrou, criar novo contato (precisará de um user_id válido)
      // Por enquanto, vamos usar um user_id padrão ou do usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('Usuário não autenticado');
        return null;
      }

      // Criar novo contato
      const { data: newContact, error: createError } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          name: `Usuário ${userPhone}`,
          phone: userPhone,
        })
        .select('user_id')
        .single();

      if (createError) {
        console.error('Erro ao criar contato:', createError);
        return null;
      }

      return newContact.user_id;
    } catch (error) {
      console.error('Erro ao buscar/criar usuário:', error);
      return null;
    }
  };

  const savePhoneKey = async (phoneData: PhoneData): Promise<boolean> => {
    try {
      // Salvar na tabela mensagens ou criar uma tabela específica para chaves
      const { error } = await supabase
        .from('contacts')
        .upsert({
          user_id: phoneData.user_id,
          phone: phoneData.user_phone,
          notes: `Chave: ${phoneData.concatenated_key}`,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'phone'
        });

      if (error) {
        console.error('Erro ao salvar chave do telefone:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao salvar chave:', error);
      return false;
    }
  };

  const processPhoneData = async (whatsappData: any, instanceName: string) => {
    setIsProcessing(true);
    
    try {
      console.log('🔄 Processando dados do telefone...');
      
      // 1. Extrair telefone do usuário
      const userPhone = extractPhoneFromWhatsApp(whatsappData);
      if (!userPhone) {
        throw new Error('Não foi possível extrair o telefone do usuário');
      }
      
      console.log('📱 Telefone do usuário:', userPhone);

      // 2. Buscar telefone da Evolution
      const evolutionPhone = await getEvolutionInstancePhone(instanceName);
      if (!evolutionPhone) {
        throw new Error('Não foi possível obter o telefone da Evolution');
      }
      
      console.log('🤖 Telefone da Evolution:', evolutionPhone);

      // 3. Buscar ou criar user_id
      const userId = await findOrCreateUser(userPhone);
      if (!userId) {
        throw new Error('Não foi possível obter user_id');
      }
      
      console.log('👤 User ID:', userId);

      // 4. Criar chave concatenada
      const concatenatedKey = `${userPhone}_${evolutionPhone}`;
      console.log('🔑 Chave concatenada:', concatenatedKey);

      // 5. Criar objeto com todos os dados
      const newPhoneData: PhoneData = {
        user_phone: userPhone,
        evolution_phone: evolutionPhone,
        concatenated_key: concatenatedKey,
        user_id: userId,
      };

      // 6. Salvar no Supabase
      const saved = await savePhoneKey(newPhoneData);
      
      if (saved) {
        setPhoneData(newPhoneData);
        
        toast({
          title: "Telefones processados!",
          description: `Chave criada: ${concatenatedKey}`,
        });
        
        return newPhoneData;
      } else {
        throw new Error('Erro ao salvar dados no Supabase');
      }

    } catch (error) {
      console.error('❌ Erro ao processar telefones:', error);
      
      toast({
        title: "Erro ao processar telefones",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    phoneData,
    isProcessing,
    processPhoneData,
    extractPhoneFromWhatsApp,
    getEvolutionInstancePhone,
    findOrCreateUser,
  };
};
