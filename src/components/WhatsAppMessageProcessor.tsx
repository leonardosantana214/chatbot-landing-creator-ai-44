
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, Key, User } from 'lucide-react';
import { usePhoneManager } from '@/hooks/usePhoneManager';

interface WhatsAppMessage {
  from: string;
  message: string;
  timestamp: string;
  instanceName: string;
}

interface WhatsAppMessageProcessorProps {
  message?: WhatsAppMessage;
  instanceName: string;
  onProcessed?: (phoneData: any) => void;
}

const WhatsAppMessageProcessor = ({ 
  message, 
  instanceName,
  onProcessed 
}: WhatsAppMessageProcessorProps) => {
  const { phoneData, isProcessing, processPhoneData } = usePhoneManager();
  const [lastProcessedMessage, setLastProcessedMessage] = useState<string>('');

  // Processar automaticamente quando uma nova mensagem chegar
  useEffect(() => {
    if (message && message.from !== lastProcessedMessage) {
      handleProcessMessage(message);
      setLastProcessedMessage(message.from);
    }
  }, [message]);

  const handleProcessMessage = async (whatsappMessage: WhatsAppMessage) => {
    console.log('📨 Nova mensagem de consulta recebida:', whatsappMessage);
    
    const result = await processPhoneData(whatsappMessage, instanceName);
    
    if (result && onProcessed) {
      onProcessed(result);
    }
  };

  const handleManualProcess = () => {
    // Para teste manual
    const testMessage: WhatsAppMessage = {
      from: '5511999999999', // Telefone de teste
      message: 'Mensagem de teste',
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
          <span>Processamento de Mensagens WhatsApp</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isProcessing && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-700">Processando telefones...</span>
            </div>
          </div>
        )}

        {phoneData && (
          <div className="bg-green-50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-green-800 flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>Dados Processados</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-green-600" />
                <span><strong>Tel. Usuário:</strong> {phoneData.user_phone}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4 text-green-600" />
                <span><strong>Tel. Evolution:</strong> {phoneData.evolution_phone}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-green-600" />
                <span><strong>User ID:</strong> {phoneData.user_id.substring(0, 8)}...</span>
              </div>
              
              <div className="flex items-center space-x-2 md:col-span-2">
                <Key className="h-4 w-4 text-green-600" />
                <span><strong>Chave:</strong> <code className="bg-white px-2 py-1 rounded text-xs">{phoneData.concatenated_key}</code></span>
              </div>
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <h5 className="font-medium mb-2">Como funciona:</h5>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. 📱 Captura o telefone do usuário da mensagem WhatsApp</li>
            <li>2. 🤖 Busca o telefone da instância Evolution ({instanceName})</li>
            <li>3. 👤 Encontra ou cria o user_id no Supabase</li>
            <li>4. 🔑 Cria chave única: telefone_usuario_telefone_evolution</li>
            <li>5. 💾 Salva/atualiza no Supabase para consultas futuras</li>
          </ol>
        </div>

        <Button 
          onClick={handleManualProcess}
          disabled={isProcessing}
          className="w-full"
          variant="outline"
        >
          {isProcessing ? 'Processando...' : 'Testar Processamento Manual'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default WhatsAppMessageProcessor;
