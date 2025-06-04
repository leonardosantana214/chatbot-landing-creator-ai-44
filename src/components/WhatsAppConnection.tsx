
import { useState, useEffect } from 'react';
import { Check, Smartphone, Wifi, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { UserData } from '../pages/LandingPage';

interface WhatsAppConnectionProps {
  userData: UserData;
  selectedPlan: string;
}

type ConnectionStatus = 'waiting' | 'analyzing' | 'connecting' | 'connected' | 'error';

const WhatsAppConnection = ({ userData, selectedPlan }: WhatsAppConnectionProps) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('waiting');
  const [analysisTime, setAnalysisTime] = useState(30);
  const [progress, setProgress] = useState(0);
  const [qrCode, setQrCode] = useState('');
  const navigate = useNavigate();

  // Timer para análise
  useEffect(() => {
    if (connectionStatus === 'analyzing' && analysisTime > 0) {
      const timer = setTimeout(() => {
        setAnalysisTime(prev => prev - 1);
        setProgress(prev => prev + (100 / 30));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (connectionStatus === 'analyzing' && analysisTime === 0) {
      setConnectionStatus('connecting');
      generateQRCode();
    }
  }, [connectionStatus, analysisTime]);

  // Simular geração de QR Code da Evolution API
  const generateQRCode = () => {
    // Simular dados que viriam da Evolution API
    const mockQRData = `evolution-api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setQrCode(mockQRData);
    console.log('QR Code gerado para Evolution API:', mockQRData);
  };

  // Iniciar processo de análise
  const startAnalysis = () => {
    setConnectionStatus('analyzing');
    setAnalysisTime(30);
    setProgress(0);
    console.log('Iniciando análise dos dados:', userData);
  };

  // Simular processo de conexão
  const simulateConnection = () => {
    setConnectionStatus('connecting');
    
    setTimeout(() => {
      const success = Math.random() > 0.2;
      setConnectionStatus(success ? 'connected' : 'error');
    }, 3000);
  };

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'waiting':
        return {
          icon: Smartphone,
          title: 'Pronto para começar',
          description: 'Clique no botão abaixo para iniciar a análise dos seus dados',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      case 'analyzing':
        return {
          icon: Clock,
          title: 'Analisando seus dados',
          description: `Configurando sua IA personalizada... ${analysisTime}s restantes`,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100'
        };
      case 'connecting':
        return {
          icon: Wifi,
          title: 'Escaneie o QR Code',
          description: 'Use o WhatsApp Business no seu celular para escanear o código',
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
                  Evolution API - WhatsApp Business
                </CardTitle>
                <Badge className="bg-green-100 text-green-800 mx-auto">
                  Integração Oficial
                </Badge>
              </CardHeader>
              
              <CardContent className="text-center space-y-6">
                {/* QR Code ou Status */}
                {connectionStatus === 'analyzing' ? (
                  <div className="space-y-4">
                    <div className="w-64 h-64 mx-auto flex items-center justify-center bg-gray-50 border-2 border-dashed rounded-xl">
                      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <Progress value={progress} className="w-full" />
                      <p className="text-sm text-gray-600">
                        Configurando IA baseada nos seus dados...
                      </p>
                    </div>
                  </div>
                ) : connectionStatus === 'connecting' || connectionStatus === 'connected' ? (
                  <div className="space-y-4">
                    {/* QR Code da Evolution API */}
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
                    <div className="text-xs text-gray-500 font-mono">
                      Evolution API ID: {qrCode}
                    </div>
                  </div>
                ) : (
                  <div className="w-64 h-64 mx-auto flex items-center justify-center bg-gray-50 border-2 border-dashed rounded-xl">
                    <div className="text-center">
                      <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">QR Code será gerado após análise</p>
                    </div>
                  </div>
                )}

                {connectionStatus === 'connecting' && (
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

                    <Button 
                      onClick={simulateConnection}
                      className="bg-green-600 hover:bg-green-700 mt-4"
                    >
                      Simular Conexão
                    </Button>
                  </div>
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
                    <span className="text-gray-600">Área:</span>
                    <span className="font-medium">{userData.area}</span>
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
                connectionStatus === 'analyzing' ? 'border-orange-500' :
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

                  {connectionStatus === 'waiting' && (
                    <Button 
                      onClick={startAnalysis}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Iniciar Análise
                    </Button>
                  )}

                  {connectionStatus === 'analyzing' && (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                    </div>
                  )}

                  {connectionStatus === 'error' && (
                    <Button 
                      onClick={startAnalysis}
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      Tentar Novamente
                    </Button>
                  )}

                  {connectionStatus === 'connected' && (
                    <Button 
                      onClick={() => navigate('/dashboard')}
                      className="bg-green-600 hover:bg-green-700"
                    >
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
