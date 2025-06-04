
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle, QrCode, Smartphone, ArrowRight } from 'lucide-react';
import { UserData } from '../pages/LandingPage';
import { useNavigate } from 'react-router-dom';

interface WhatsAppConnectionProps {
  userData: UserData;
  selectedPlan: string;
}

const WhatsAppConnection = ({ userData, selectedPlan }: WhatsAppConnectionProps) => {
  const [analysisPhase, setAnalysisPhase] = useState<'analyzing' | 'generating' | 'ready'>('analyzing');
  const [connectionStatus, setConnectionStatus] = useState<'waiting' | 'connected' | 'error'>('waiting');
  const [qrCode, setQrCode] = useState<string>('');
  const [countdown, setCountdown] = useState(30);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Iniciando análise dos dados:', userData);
    
    // Simulação do processo de análise
    const analysisTimer = setTimeout(() => {
      setAnalysisPhase('generating');
      
      // Simular geração do QR Code
      const generateTimer = setTimeout(() => {
        const qrCodeId = `evolution-api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setQrCode(qrCodeId);
        setAnalysisPhase('ready');
        console.log('QR Code gerado para Evolution API:', qrCodeId);
      }, 3000);

      return () => clearTimeout(generateTimer);
    }, 5000);

    return () => clearTimeout(analysisTimer);
  }, [userData]);

  useEffect(() => {
    if (analysisPhase === 'ready' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, analysisPhase]);

  const handleConnect = () => {
    setConnectionStatus('connected');
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const getAnalysisMessage = () => {
    switch (analysisPhase) {
      case 'analyzing':
        return 'Analisando seus dados e configurando a IA...';
      case 'generating':
        return 'Gerando configuração personalizada para sua IA...';
      case 'ready':
        return 'Tudo pronto! Conecte seu WhatsApp para finalizar.';
      default:
        return 'Processando...';
    }
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-black mb-4">
              Conectar ao WhatsApp
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Último passo: conecte sua IA ao WhatsApp Business e comece a automatizar seu atendimento
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-gray-600">Dados</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <div className="flex items-center">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-gray-600">Plano</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <div className="flex items-center">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-black">Conexão</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Analysis Status */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-black text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Clock className="h-6 w-6 mr-2" />
                  Status da Configuração
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-black mb-2">Dados Configurados:</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Nome:</strong> {userData.name}</p>
                      <p><strong>Empresa:</strong> {userData.company}</p>
                      <p><strong>Área:</strong> {userData.area}</p>
                      <p><strong>Plano:</strong> {selectedPlan}</p>
                    </div>
                  </div>

                  {/* Analysis Status */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      {analysisPhase === 'analyzing' ? (
                        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      )}
                      <span className="text-sm">Análise dos dados da empresa</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {analysisPhase === 'generating' ? (
                        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      ) : analysisPhase === 'ready' ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                      )}
                      <span className="text-sm">Configuração personalizada da IA</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {analysisPhase === 'ready' ? (
                        connectionStatus === 'connected' ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        )
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                      )}
                      <span className="text-sm">Conexão com WhatsApp</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      {getAnalysisMessage()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - QR Code */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-black text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <QrCode className="h-6 w-6 mr-2" />
                  Conectar WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {analysisPhase !== 'ready' ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 text-center">
                      Preparando sua conexão personalizada...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {connectionStatus === 'connected' ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-black mb-2">Conectado com Sucesso!</h3>
                        <p className="text-gray-600 mb-4">Redirecionando para o dashboard...</p>
                      </div>
                    ) : (
                      <>
                        {/* QR Code Area */}
                        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <div className="w-48 h-48 mx-auto bg-black rounded-lg flex items-center justify-center mb-4">
                            <QrCode className="h-24 w-24 text-white" />
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            ID da Sessão: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{qrCode}</code>
                          </p>
                          <p className="text-xs text-gray-500">Evolution API v1.0</p>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-black">Como conectar:</h4>
                          <ol className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start">
                              <span className="bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                              Abra o WhatsApp Business no seu celular
                            </li>
                            <li className="flex items-start">
                              <span className="bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                              Vá em Menu → Dispositivos conectados
                            </li>
                            <li className="flex items-start">
                              <span className="bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                              Toque em "Conectar um dispositivo"
                            </li>
                            <li className="flex items-start">
                              <span className="bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
                              Escaneie o QR Code acima
                            </li>
                          </ol>
                        </div>

                        {/* Timer */}
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-gray-600">
                            QR Code expira em: <span className="font-bold text-black">{countdown}s</span>
                          </p>
                        </div>

                        {/* Connect Button */}
                        <Button 
                          onClick={handleConnect}
                          className="w-full bg-black hover:bg-gray-800 text-white py-3 font-semibold"
                        >
                          <Smartphone className="h-5 w-5 mr-2" />
                          Simular Conexão (Demo)
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Support */}
          <div className="text-center mt-12">
            <div className="bg-white border border-gray-200 p-6 rounded-lg max-w-2xl mx-auto">
              <h4 className="font-semibold text-black mb-2">Precisa de ajuda?</h4>
              <p className="text-sm text-gray-600 mb-4">
                Nossa equipe de suporte está disponível 24/7 para ajudar você
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                  💬 Chat ao Vivo
                </Button>
                <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                  📧 Email: suporte@iasecretary.com
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatsAppConnection;
