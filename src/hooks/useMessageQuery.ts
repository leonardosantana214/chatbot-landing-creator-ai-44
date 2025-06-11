
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MessageQueryData {
  user_phone: string;
  evolution_phone: string;
  concatenated_key: string;
  user_id: string;
  message: string;
  bot_response?: string;
}

export const useMessageQuery = () => {
  const { toast } = useToast();

  const saveMessageWithPhoneKey = async (queryData: MessageQueryData) => {
    try {
      console.log('💾 Salvando mensagem com chave de telefone:', queryData);

      // Salvar na tabela mensagens com a chave concatenada
      const { data, error } = await supabase
        .from('mensagens')
        .insert({
          user_id: queryData.user_id,
          telefone: queryData.concatenated_key, // Usar a chave concatenada como telefone
          user_message: queryData.message,
          bot_message: queryData.bot_response || 'Processando...',
          message_type: 'text',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('❌ Erro ao salvar mensagem:', error);
        throw error;
      }

      console.log('✅ Mensagem salva com sucesso:', data);
      
      toast({
        title: "Mensagem salva!",
        description: `Chave: ${queryData.concatenated_key}`,
      });

      return data;
    } catch (error) {
      console.error('💥 Erro ao salvar mensagem:', error);
      
      toast({
        title: "Erro ao salvar mensagem",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
      
      return null;
    }
  };

  const findMessagesByPhoneKey = async (concatenatedKey: string) => {
    try {
      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .eq('telefone', concatenatedKey)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar mensagens:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('💥 Erro ao buscar mensagens:', error);
      return [];
    }
  };

  return {
    saveMessageWithPhoneKey,
    findMessagesByPhoneKey,
  };
};
