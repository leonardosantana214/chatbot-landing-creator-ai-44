
import { useState, useEffect } from 'react';
import { Check, Smartphone, Wifi, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserData } from '../pages/LandingPage';

interface WhatsAppConnectionProps {
  userData: UserData;
  selectedPlan: string;
}

type ConnectionStatus = 'waiting' | 'connecting' | 'connected' | 'error';

const WhatsAppConnection = ({ userData, selectedPlan }: WhatsAppConnectionProps) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('waiting');

  // Simular processo de conexão
  const simulateConnection = () => {
    setConnectionStatus('connecting');
    
    setTimeout(() => {
      // Simular 80% de chance de sucesso
      const success = Math.random() > 0.2;
      setConnectionStatus(success ? 'connected' : 'error');
    }, 3000);
  };

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'waiting':
        return {
          icon: Smartphone,
          title: 'Escaneie o QR Code',
          description: 'Use o WhatsApp Business no seu celular para escanear o código',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      case 'connecting':
        return {
          icon: Wifi,
          title: 'Conectando...',
          description: 'Estabelecendo conexão com sua conta do WhatsApp Business',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        };
      case 'connected':
        return {
          icon: Check,
          title: 'Conectado com sucesso!',
          description: 'Sua secretária virtual com IA está ativa e funcionando',
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      case 'error':
        return {
          icon: AlertCircle,
          title: 'Erro na conexão',
          description: 'Houve um problema ao conectar. Tente novamente.',
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <section id="connection" className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Conectar ao WhatsApp
            </h2>
            <p className="text-xl text-gray-600">
              Último passo para ativar sua secretária virtual com IA
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* QR Code Section */}
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  WhatsApp Business API
                </CardTitle>
              </CardHeader>
              
              <CardContent className="text-center space-y-6">
                {/* QR Code Placeholder */}
                <div className="bg-white border-4 border-gray-200 rounded-xl p-8 mx-auto w-64 h-64 flex items-center justify-center">
                  <div className="grid grid-cols-8 gap-1">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 ${
                          Math.random() > 0.5 ? 'bg-black' : 'bg-white'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Como conectar:
                  </h3>
                  <ol className="text-left space-y-2 text-gray-600">
                    <li>1. Abra o WhatsApp Business no seu celular</li>
                    <li>2. Toque em "Mais opções" (⋮) → "Dispositivos conectados"</li>
                    <li>3. Toque em "Conectar um dispositivo"</li>
                    <li>4. Aponte a câmera para este QR code</li>
                  </ol>
                </div>

                {connectionStatus === 'waiting' && (
                  <Button 
                    onClick={simulateConnection}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Simular Conexão
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Status Section */}
            <div className="space-y-6">
              {/* User Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Resumo da Configuração</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nome:</span>
                    <span className="font-medium">{userData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Empresa:</span>
                    <span className="font-medium">{userData.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plano:</span>
                    <span className="font-medium text-blue-600">{selectedPlan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">WhatsApp:</span>
                    <span className="font-medium">{userData.whatsapp}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Connection Status */}
              <Card className={`border-2 ${
                connectionStatus === 'connected' ? 'border-green-500' :
                connectionStatus === 'error' ? 'border-red-500' :
                connectionStatus === 'connecting' ? 'border-yellow-500' :
                'border-blue-500'
              }`}>
                <CardContent className="text-center py-8">
                  <div className={`w-16 h-16 ${statusConfig.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <statusConfig.icon className={`h-8 w-8 ${statusConfig.color}`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {statusConfig.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {statusConfig.description}
                  </p>

                  {connectionStatus === 'connecting' && (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  )}

                  {connectionStatus === 'error' && (
                    <Button 
                      onClick={simulateConnection}
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      Tentar Novamente
                    </Button>
                  )}

                  {connectionStatus === 'connected' && (
                    <Button className="bg-green-600 hover:bg-green-700">
                      Acessar Dashboard
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatsAppConnection;
