
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Bot, Settings, TestTube } from 'lucide-react';

interface ChatbotConfig {
  id: string;
  bot_name: string;
  service_type: string;
  tone: string;
  evo_instance_id: string | null;
  phone_number: string | null;
  is_active: boolean;
}

interface ChatbotStatusCardProps {
  chatbotConfig: ChatbotConfig | null;
  onNavigateToSetup: () => void;
}

const ChatbotStatusCard = ({ chatbotConfig, onNavigateToSetup }: ChatbotStatusCardProps) => {
  if (chatbotConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>Chatbot Ativo</span>
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ativo
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Nome:</span>
              <span className="text-sm font-medium">{chatbotConfig.bot_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tipo:</span>
              <span className="text-sm">{chatbotConfig.service_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tom:</span>
              <span className="text-sm">{chatbotConfig.tone}</span>
            </div>
            
            <div className="pt-3 space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={onNavigateToSetup}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurar Chatbot
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Testar Chatbot
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <span>Chatbot</span>
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" />
            Não configurado
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Você ainda não criou um chatbot. Crie um agora para começar a automatizar suas conversas.
          </p>
          <Button 
            className="w-full"
            onClick={onNavigateToSetup}
          >
            <Bot className="h-4 w-4 mr-2" />
            Criar Meu Chatbot
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatbotStatusCard;
