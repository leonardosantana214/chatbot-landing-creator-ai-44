
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useInstancePhoneManager } from './useInstancePhoneManager';
import { useConversationManager } from './useConversationManager';

interface ProcessedMessageData {
  user_phone: string;
  instance_id: string; // ID real da instância
  instance_phone: string;
  conversation_key: string;
}

export const usePhoneManager = () => {
  const [messageData, setMessageData] = useState<ProcessedMessageData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { getInstancePhone, getEvolutionInstanceData } = useInstancePhoneManager();
  const { createConversationKey } = useConversationManager();

  const extractPhoneFromWhatsApp = (whatsappData: any): string => {
    const phone = whatsappData.from || whatsappData.phone || whatsappData.number || '';
    return phone.replace(/\D/g, '');
  };

  const processMessage = async (whatsappData: any, instanceName: string) => {
    setIsProcessing(true);
    
    try {
      console.log('🔄 Processando mensagem com INSTANCE_ID...');
      console.log('📨 Dados WhatsApp:', whatsappData);
      console.log('🏭 Instância:', instanceName);
      
      // 1. Extrair telefone do usuário
      const userPhone = extractPhoneFromWhatsApp(whatsappData);
      if (!userPhone) {
        throw new Error('Não foi possível extrair o telefone do usuário');
      }
      console.log('📱 Telefone do usuário:', userPhone);

      // 2. Buscar dados reais da instância Evolution (ID + telefone)
      const evolutionData = await getEvolutionInstanceData(instanceName);
      if (!evolutionData) {
        throw new Error('Não foi possível obter dados da instância Evolution');
      }

      const { instanceId, phone: instancePhone } = evolutionData;
      
      if (!instanceId || instanceId === '00000000') {
        throw new Error('Instance ID inválido obtido da Evolution');
      }

      console.log('🤖 Instance ID real:', instanceId);
      console.log('📞 Telefone da instância:', instancePhone);

      // 3. Criar chave de conversa: instance_id_telefone_usuario
      const conversationKey = createConversationKey(instanceId, userPhone);
      console.log('🔑 Chave da conversa:', conversationKey);

      // 4. Criar objeto com dados processados
      const processedData: ProcessedMessageData = {
        user_phone: userPhone,
        instance_id: instanceId, // ID REAL da instância
        instance_phone: instancePhone,
        conversation_key: conversationKey,
      };

      console.log('📦 Dados processados com INSTANCE_ID real:', processedData);
      setMessageData(processedData);
      
      toast({
        title: "Mensagem processada!",
        description: `Instance ID: ${instanceId} | Chave: ${conversationKey}`,
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
  };
};
