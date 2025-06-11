
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ConversationData {
  instance_id: string; // ID real da instância (agora usado como user_id)
  user_phone: string;
  instance_phone: string;
  conversation_key: string;
  message: string;
  bot_response?: string;
}

export const useConversationManager = () => {
  const { toast } = useToast();

  const createConversationKey = (instanceId: string, userPhone: string): string => {
    // Formato: instance_id_telefone_usuario
    return `${instanceId}_${userPhone}`;
  };

  const saveConversation = async (conversationData: ConversationData) => {
    try {
      console.log('💾 Salvando conversa com INSTANCE_ID como USER_ID:', conversationData);
      
      // Verificar se instance_id é válido e não é um valor genérico
      if (!conversationData.instance_id || conversationData.instance_id === '00000000' || conversationData.instance_id.length < 3) {
        throw new Error(`Instance ID inválido: ${conversationData.instance_id}`);
      }

      // Salvar na tabela mensagens usando o INSTANCE_ID como USER_ID
      const { data, error } = await supabase
        .from('mensagens')
        .insert({
          user_id: conversationData.instance_id, // INSTANCE_ID usado como USER_ID
          telefone: conversationData.conversation_key, // Chave: instance_id_telefone_usuario  
          user_message: conversationData.message,
          bot_message: conversationData.bot_response || 'Processando...',
          message_type: 'text',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('❌ Erro ao salvar conversa:', error);
        throw error;
      }

      console.log('✅ Conversa salva com INSTANCE_ID como USER_ID:', data);
      console.log('🎯 USER_ID utilizado:', conversationData.instance_id);
      
      toast({
        title: "Conversa salva!",
        description: `Instance ID: ${conversationData.instance_id} | Chave: ${conversationData.conversation_key}`,
      });

      return data;
    } catch (error) {
      console.error('💥 Erro ao salvar conversa:', error);
      
      toast({
        title: "Erro ao salvar conversa",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
      
      return null;
    }
  };

  const getConversationsByInstanceId = async (instanceId: string) => {
    try {
      console.log('🔍 Buscando conversas do INSTANCE_ID:', instanceId);
      
      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .eq('user_id', instanceId) // Buscar pelo INSTANCE_ID como USER_ID
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar conversas:', error);
        return [];
      }

      console.log(`✅ Encontradas ${data?.length || 0} mensagens para INSTANCE_ID: ${instanceId}`);
      return data || [];
    } catch (error) {
      console.error('💥 Erro ao buscar conversas:', error);
      return [];
    }
  };

  const getConversationsByKey = async (conversationKey: string) => {
    try {
      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .eq('telefone', conversationKey)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar conversa por chave:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('💥 Erro ao buscar conversa por chave:', error);
      return [];
    }
  };

  return {
    createConversationKey,
    saveConversation,
    getConversationsByInstanceId,
    getConversationsByKey,
  };
};
