
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConversationData {
  instance_id: string; // ID real da instância
  user_phone: string;
  instance_phone: string;
  conversation_key: string;
  message: string;
  bot_response: string;
}

export const useConversationManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createConversationKey = (instanceId: string, userPhone: string): string => {
    // Criar chave única: instanceId_telefoneUsuario
    const cleanInstanceId = instanceId.replace(/[^a-zA-Z0-9]/g, '');
    const cleanPhone = userPhone.replace(/[^0-9]/g, '');
    return `${cleanInstanceId}_${cleanPhone}`;
  };

  const saveConversation = async (conversationData: ConversationData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('💬 Salvando conversa:', conversationData);
      
      // 1. Salvar na tabela mensagens usando instance_id como user_id
      const { error: messageError } = await supabase
        .from('mensagens')
        .insert({
          user_id: conversationData.instance_id, // Usar instance_id como user_id
          Instance_ID: conversationData.instance_id,
          telefone: conversationData.user_phone,
          user_message: conversationData.message,
          bot_message: conversationData.bot_response,
          message_type: 'text',
          ativo: true
        });

      if (messageError) {
        console.error('❌ Erro ao salvar mensagem:', messageError);
        return false;
      }

      console.log('✅ Conversa salva com instance_id como user_id');
      return true;

    } catch (error) {
      console.error('❌ Erro ao salvar conversa:', error);
      
      toast({
        title: "Erro ao salvar conversa",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getConversationHistory = async (instanceId: string, userPhone: string) => {
    try {
      console.log('📚 Buscando histórico de conversa...');
      
      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .eq('Instance_ID', instanceId)
        .eq('telefone', userPhone)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar histórico:', error);
        return null;
      }

      console.log('✅ Histórico obtido:', data?.length || 0, 'mensagens');
      return data;

    } catch (error) {
      console.error('❌ Erro ao buscar histórico:', error);
      return null;
    }
  };

  return {
    isLoading,
    createConversationKey,
    saveConversation,
    getConversationHistory
  };
};
