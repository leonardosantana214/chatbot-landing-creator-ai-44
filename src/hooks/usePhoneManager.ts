
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useInstancePhoneManager } from './useInstancePhoneManager';
import { useConversationManager } from './useConversationManager';

interface ProcessedMessageData {
  user_phone: string;
  user_id: string;
  instance_phone: string;
  conversation_key: string;
}

export const usePhoneManager = () => {
  const [messageData, setMessageData] = useState<ProcessedMessageData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { getInstancePhone } = useInstancePhoneManager();
  const { createConversationKey } = useConversationManager();

  const extractPhoneFromWhatsApp = (whatsappData: any): string => {
    const phone = whatsappData.from || whatsappData.phone || whatsappData.number || '';
    return phone.replace(/\D/g, '');
  };

  const findOrCreateUser = async (userPhone: string): Promise<string | null> => {
    try {
      console.log('🔍 Buscando usuário para telefone:', userPhone);
      
      // Primeiro, tentar encontrar usuário existente pelo telefone
      const { data: existingContact, error: searchError } = await supabase
        .from('contacts')
        .select('user_id')
        .eq('phone', userPhone)
        .limit(1);

      if (searchError) {
        console.error('❌ Erro ao buscar contato:', searchError);
        return null;
      }

      if (existingContact && existingContact.length > 0) {
        console.log('✅ Usuário existente encontrado:', existingContact[0].user_id);
        return existingContact[0].user_id;
      }

      console.log('👤 Usuário não encontrado, obtendo usuário autenticado...');
      
      // Se não encontrou, usar o usuário logado como padrão
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('❌ Usuário não autenticado');
        return null;
      }

      console.log('📝 Criando novo contato para user_id:', user.id);

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
        console.error('❌ Erro ao criar contato:', createError);
        return null;
      }

      console.log('✅ Novo contato criado com user_id:', newContact.user_id);
      return newContact.user_id;
    } catch (error) {
      console.error('💥 Erro ao buscar/criar usuário:', error);
      return null;
    }
  };

  const processMessage = async (whatsappData: any, instanceName: string) => {
    setIsProcessing(true);
    
    try {
      console.log('🔄 Processando mensagem...');
      console.log('📨 Dados WhatsApp:', whatsappData);
      console.log('🏭 Instância:', instanceName);
      
      // 1. Extrair telefone do usuário
      const userPhone = extractPhoneFromWhatsApp(whatsappData);
      if (!userPhone) {
        throw new Error('Não foi possível extrair o telefone do usuário');
      }
      console.log('📱 Telefone do usuário:', userPhone);

      // 2. Buscar telefone da instância (do BD ou API)
      const instancePhone = await getInstancePhone(instanceName);
      if (!instancePhone) {
        throw new Error('Não foi possível obter o telefone da instância');
      }
      console.log('🤖 Telefone da instância:', instancePhone);

      // 3. Buscar ou criar user_id
      const userId = await findOrCreateUser(userPhone);
      if (!userId) {
        throw new Error('Não foi possível obter user_id');
      }
      console.log('👤 User ID:', userId);

      // 4. Criar chave de conversa: user_id_telefone_instancia
      const conversationKey = createConversationKey(userId, instancePhone);
      console.log('🔑 Chave da conversa:', conversationKey);

      // 5. Criar objeto com dados processados
      const processedData: ProcessedMessageData = {
        user_phone: userPhone,
        user_id: userId,
        instance_phone: instancePhone,
        conversation_key: conversationKey,
      };

      console.log('📦 Dados processados:', processedData);
      setMessageData(processedData);
      
      toast({
        title: "Mensagem processada!",
        description: `Chave: ${conversationKey}`,
      });
      
      return processedData;

    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      
      toast({
        title: "Erro ao processar mensagem",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    messageData,
    isProcessing,
    processMessage,
    extractPhoneFromWhatsApp,
    findOrCreateUser,
  };
};
