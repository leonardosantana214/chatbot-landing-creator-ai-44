
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Bot, Settings, QrCode, Phone, RefreshCw, Smartphone } from 'lucide-react';
import { useEvolutionStatus } from '@/hooks/useEvolutionStatus';
import { useState } from 'react';
import QRCodeConnection from '@/components/QRCodeConnection';

interface ChatbotConfig {
  id: string;
  bot_name: string;
  service_type: string;
  tone: string;
  evo_instance_id: string | null;
  real_instance_id: string | null;
  phone_number: string | null;
  evolution_phone: string | null;
  connection_status: string | null;
  is_active: boolean;
}

interface WhatsAppStatusSectionProps {
  chatbots: ChatbotConfig[];
  onRefresh: () => void;
  loading: boolean;
}

const WhatsAppStatusSection = ({ chatbots, onRefresh, loading }: WhatsAppStatusSectionProps) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedInstanceName, setSelectedInstanceName] = useState<string>('');
  
  // Para cada chatbot, obter status da Evolution
  const getInstanceStatus = (instanceName: string) => {
    const { status, isLoading, refreshStatus } = useEvolutionStatus(instanceName);
    return { status, isLoading, refreshStatus };
  };

  const formatPhoneBrazilian = (phone: string) => {
    if (!phone) return '';
    
    const numbers = phone.replace(/\D/g, '');
    
    if (numbers.length === 13 && numbers.startsWith('55')) {
      const ddd = numbers.substring(2, 4);
      const firstPart = numbers.substring(4, 9);
      const secondPart = numbers.substring(9, 13);
      return `+55 (${ddd}) ${firstPart}-${secondPart}`;
    }
    
    if (numbers.length === 11) {
      const ddd = numbers.substring(0, 2);
      const firstPart = numbers.substring(2, 7);
      const secondPart = numbers.substring(7, 11);
      return `+55 (${ddd}) ${firstPart}-${secondPart}`;
    }
    
    return phone;
  };

  const handleGenerateQRCode = (instanceName: string) => {
    setSelectedInstanceName(instanceName);
    setShowQRCode(true);
  };

  const handleConnectionSuccess = () => {
    setShowQRCode(false);
    onRefresh();
  };

  if (showQRCode && selectedInstanceName) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <QrCode className="h-5 w-5 mr-2" />
              Conectar WhatsApp
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setShowQRCode(false)}
            >
              Voltar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QRCodeConnection 
            instanceName={selectedInstanceName}
            onConnectionSuccess={handleConnectionSuccess}
            onSkip={() => setShowQRCode(false)}
          />
        </CardContent>
      </Card>
    );
  }

  if (chatbots.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            Status dos Chatbots
          </div>
          <Button 
            onClick={onRefresh} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {chatbots.map((bot) => {
            const instanceName = bot.evo_instance_id || bot.real_instance_id;
            const evolutionStatus = instanceName ? getInstanceStatus(instanceName) : null;
            
            // Determinar se está realmente conectado baseado na Evolution API
            const isReallyConnected = evolutionStatus?.status?.isConnected || false;
            const evolutionPhone = evolutionStatus?.status?.phone;
            
            return (
              <div key={bot.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#FF914C] rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{bot.bot_name}</h4>
                    <p className="text-sm text-gray-600">{bot.service_type} • {bot.tone}</p>
                    
                    {/* Mostrar telefone se conectado */}
                    {(evolutionPhone || bot.evolution_phone) && (
                      <p className="text-xs text-green-600 flex items-center font-semibold">
                        <Phone className="h-3 w-3 mr-1" />
                        {formatPhoneBrazilian(evolutionPhone || bot.evolution_phone || '')}
                      </p>
                    )}
                    
                    {/* Mostrar dados da instância */}
                    {instanceName && (
                      <div className="text-xs text-gray-400 mt-1">
                        <p className="font-mono">Instância: {instanceName}</p>
                        {evolutionStatus?.status && (
                          <p className="text-xs">
                            Verificado: {evolutionStatus.status.lastCheck.toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right space-y-2">
                  {/* Badge de status baseado na Evolution API */}
                  <Badge className={`${
                    isReallyConnected 
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {isReallyConnected ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Conectado
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Desconectado
                      </>
                    )}
                  </Badge>
                  
                  {/* Mostrar botão de QR Code APENAS se não estiver conectado */}
                  {!isReallyConnected && instanceName && (
                    <div className="space-y-1">
                      <Button 
                        onClick={() => handleGenerateQRCode(instanceName)}
                        disabled={loading || evolutionStatus?.isLoading}
                        size="sm"
                        className="w-full bg-[#FF914C] hover:bg-[#FF7A2B]"
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        Conectar WhatsApp
                      </Button>
                    </div>
                  )}
                  
                  {/* Mostrar status conectado com detalhes */}
                  {isReallyConnected && (
                    <div className="bg-green-50 p-2 rounded text-xs text-green-800">
                      <div className="flex items-center">
                        <Smartphone className="h-3 w-3 mr-1" />
                        <span className="font-semibold">WhatsApp Ativo</span>
                      </div>
                      {evolutionPhone && (
                        <p className="mt-1 font-mono text-xs">
                          {formatPhoneBrazilian(evolutionPhone)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppStatusSection;
