
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ConversationData {
  user_id: string;
  user_phone: string;
  instance_phone: string;
  conversation_key: string;
  message: string;
  bot_response?: string;
}

export const useConversationManager = () => {
  const { toast } = useToast();

  const createConversationKey = (userId: string, instancePhone: string): string => {
    // Formato: user_id_telefone_instancia
    return `${userId}_${instancePhone}`;
  };

  const saveConversation = async (conversationData: ConversationData) => {
    try {
      console.log('💾 Salvando conversa:', conversationData);
      
      // Verificar se user_id é um UUID válido
      if (!conversationData.user_id || conversationData.user_id.length !== 36) {
        throw new Error(`user_id inválido: ${conversationData.user_id}`);
      }

      // Salvar na tabela mensagens com a nova estrutura
      const { data, error } = await supabase
        .from('mensagens')
        .insert({
          user_id: conversationData.user_id, // UUID do usuário
          telefone: conversationData.conversation_key, // Chave: user_id_telefone_instancia
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

      console.log('✅ Conversa salva com sucesso:', data);
      
      toast({
        title: "Conversa salva!",
        description: `Chave: ${conversationData.conversation_key}`,
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

  const getConversationsByUserId = async (userId: string) => {
    try {
      console.log('🔍 Buscando conversas do usuário:', userId);
      
      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar conversas:', error);
        return [];
      }

      console.log(`✅ Encontradas ${data?.length || 0} mensagens para o usuário`);
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
    getConversationsByUserId,
    getConversationsByKey,
  };
};
