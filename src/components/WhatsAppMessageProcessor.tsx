
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, Key, User, Database } from 'lucide-react';
import { usePhoneManager } from '@/hooks/usePhoneManager';
import { useConversationManager } from '@/hooks/useConversationManager';

interface WhatsAppMessage {
  from: string;
  message: string;
  timestamp: string;
  instanceName: string;
}

interface WhatsAppMessageProcessorProps {
  message?: WhatsAppMessage;
  instanceName: string;
  onProcessed?: (messageData: any) => void;
}

const WhatsAppMessageProcessor = ({ 
  message, 
  instanceName,
  onProcessed 
}: WhatsAppMessageProcessorProps) => {
  const { messageData, isProcessing, processMessage } = usePhoneManager();
  const { saveConversation } = useConversationManager();
  const [lastProcessedMessage, setLastProcessedMessage] = useState<string>('');

  // Processar automaticamente quando uma nova mensagem chegar
  useEffect(() => {
    if (message && message.from !== lastProcessedMessage) {
      handleProcessMessage(message);
      setLastProcessedMessage(message.from);
    }
  }, [message]);

  const handleProcessMessage = async (whatsappMessage: WhatsAppMessage) => {
    console.log('📨 Nova mensagem recebida:', whatsappMessage);
    
    const result = await processMessage(whatsappMessage, instanceName);
    
    if (result) {
      // Salvar a conversa usando o INSTANCE_ID como USER_ID
      await saveConversation({
        instance_id: result.instance_id, // ID real da instância
        user_phone: result.user_phone,
        instance_phone: result.instance_phone,
        conversation_key: result.conversation_key,
        message: whatsappMessage.message,
        bot_response: 'Mensagem processada pelo sistema',
      });

      if (onProcessed) {
        onProcessed(result);
      }
    }
  };

  const handleManualTest = () => {
    const testMessage: WhatsAppMessage = {
      from: '5511999999999',
      message: 'Mensagem de teste do sistema',
      timestamp: new Date().toISOString(),
      instanceName: instanceName,
    };
    
    handleProcessMessage(testMessage);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <span>Sistema de Conversas WhatsApp</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isProcessing && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-700">Processando mensagem...</span>
            </div>
          </div>
        )}

        {messageData && (
          <div className="bg-green-50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-green-800 flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Conversa Processada</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-green-600" />
                <span><strong>Tel. Usuário:</strong> {messageData.user_phone}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4 text-green-600" />
                <span><strong>Tel. Instância:</strong> {messageData.instance_phone}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-green-600" />
                <span><strong>Instance ID:</strong> {messageData.instance_id}</span>
              </div>
              
              <div className="flex items-center space-x-2 md:col-span-2">
                <Key className="h-4 w-4 text-green-600" />
                <span><strong>Chave Conversa:</strong> <code className="bg-white px-2 py-1 rounded text-xs">{messageData.conversation_key}</code></span>
              </div>
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <h5 className="font-medium mb-2">Sistema Atualizado com Instance ID Real:</h5>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. 📱 Captura telefone do usuário da mensagem</li>
            <li>2. 🆔 Busca INSTANCE_ID real da Evolution API</li>
            <li>3. 📞 Captura telefone da instância conectada</li>
            <li>4. 💾 Usa INSTANCE_ID como USER_ID no Supabase</li>
            <li>5. 🔑 Cria chave: instance_id_telefone_usuario</li>
            <li>6. 🎯 N8N pode usar o Instance ID como referência</li>
          </ol>
        </div>

        <Button 
          onClick={handleManualTest}
          disabled={isProcessing}
          className="w-full"
          variant="outline"
        >
          {isProcessing ? 'Processando...' : 'Testar Sistema com Instance ID'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default WhatsAppMessageProcessor;
