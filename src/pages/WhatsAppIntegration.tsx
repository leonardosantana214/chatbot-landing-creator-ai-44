
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Smartphone, QrCode, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompleteRegistration } from '@/hooks/useCompleteRegistration';

const WhatsAppIntegration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { registerUserComplete, loading } = useCompleteRegistration();
  
  const [step, setStep] = useState(1);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const userData = location.state?.userData;
  const chatbotConfig = location.state?.chatbotConfig;
  const instanceName = location.state?.instanceName;

  useEffect(() => {
    if (!userData || !chatbotConfig || !instanceName) {
      navigate('/chatbot-setup');
      return;
    }

    // Iniciar processo automaticamente
    handleCompleteSetup();
  }, [userData, chatbotConfig, instanceName]);

  const handleCompleteSetup = async () => {
    if (!userData || !chatbotConfig) return;

    setStep(1); // Iniciando criação
    setErrorMessage(null);
    
    try {
      console.log('🚀 Iniciando configuração completa...');
      
      // Gerar senha automática mais robusta
      const password = `Tech${Date.now()}!${Math.random().toString(36).slice(-4)}`;
      
      const userRegistrationData = {
        name: userData.name,
        email: userData.email,
        password: password,
        company: userData.company,
        area: userData.area,
        whatsapp: userData.whatsapp
      };

      const result = await registerUserComplete(userRegistrationData, chatbotConfig);
      
      if (result.success && result.instanceData) {
        setAccountCreated(true);
        setStep(2); // Conta criada com sucesso
        
        toast({
          title: "✅ Conta criada com sucesso!",
          description: "Agora vamos conectar seu WhatsApp...",
        });
        
        // Aguardar um pouco e buscar QR Code
        setTimeout(async () => {
          setStep(3); // Mostrando QR Code
          await fetchRealQRCode();
        }, 2000);
        
      } else {
        setErrorMessage("Falha ao criar conta. Tente novamente.");
        setStep(1);
      }
    } catch (error) {
      console.error('💥 Erro no setup completo:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido');
      setStep(1);
    }
  };

  const fetchRealQRCode = async () => {
    try {
      const API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY || '09d18f5a0aa248bebdb35893efeb170e';
      const EVOLUTION_BASE_URL = 'https://leoevo.techcorps.com.br';
      
      console.log('📱 Buscando QR Code real da Evolution API...');
      
      // Primeiro verificar status da instância
      const statusResponse = await fetch(`${EVOLUTION_BASE_URL}/instance/fetch/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log('📊 Status da instância:', statusData);
        
        // Verificar se já está conectado
        if (statusData.instance?.connectionStatus === 'open') {
          setConnectionSuccess(true);
          setStep(4);
          toast({
            title: "🎉 WhatsApp já conectado!",
            description: "Sua instância já está ativa!",
          });
          return;
        }
      }
      
      // Buscar QR Code se não estiver conectado
      console.log('🔄 Gerando novo QR Code...');
      const qrResponse = await fetch(`${EVOLUTION_BASE_URL}/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (qrResponse.ok) {
        const qrData = await qrResponse.json();
        console.log('📱 Resposta QR Code:', qrData);
        
        if (qrData.base64) {
          const qrImage = qrData.base64.startsWith('data:image') 
            ? qrData.base64 
            : `data:image/png;base64,${qrData.base64}`;
          
          setQrCodeImage(qrImage);
          console.log('✅ QR Code obtido e configurado!');
        } else {
          console.log('⚠️ QR Code não encontrado na resposta');
          setErrorMessage("QR Code não disponível. Tente recarregar.");
        }
      } else {
        console.error('❌ Erro ao obter QR Code:', qrResponse.status);
        setErrorMessage("Erro ao carregar QR Code. Tente novamente.");
      }
    } catch (error) {
      console.error('❌ Erro ao buscar QR Code:', error);
      setErrorMessage("Falha na conexão com servidor. Verifique sua internet.");
    }
  };

  const handleManualConnection = async () => {
    try {
      const API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY || '09d18f5a0aa248bebdb35893efeb170e';
      const EVOLUTION_BASE_URL = 'https://leoevo.techcorps.com.br';
      
      console.log('🔍 Verificando conexão do WhatsApp...');
      
      const statusResponse = await fetch(`${EVOLUTION_BASE_URL}/instance/fetch/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        
        if (statusData.instance?.connectionStatus === 'open') {
          setConnectionSuccess(true);
          setStep(4);
          
          toast({
            title: "🎉 WhatsApp conectado!",
            description: "Conexão confirmada com sucesso!",
          });
          return;
        }
      }
      
      toast({
        title: "⚠️ WhatsApp não conectado",
        description: "Escaneie o QR Code primeiro para conectar.",
        variant: "destructive",
      });
      
    } catch (error) {
      console.error('❌ Erro ao verificar conexão:', error);
      toast({
        title: "❌ Erro na verificação",
        description: "Não foi possível verificar conexão.",
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    setErrorMessage(null);
    setStep(1);
    handleCompleteSetup();
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  const renderStep = () => {
    if (errorMessage) {
      return (
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-800 mb-2">Erro na Configuração</h3>
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <Button 
            onClick={handleRetry}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            Tentar Novamente
          </Button>
        </div>
      );
    }

    switch (step) {
      case 1:
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF914C] mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Criando sua conta...</h3>
            <p className="text-gray-600">
              {accountCreated 
                ? "Conta criada! Configurando sistemas..." 
                : "Configurando Evolution API e Supabase..."
              }
            </p>
          </div>
        );
      
      case 2:
        return (
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">Conta criada com sucesso!</h3>
            <p className="text-gray-600">
              Dados salvos no sistema! Preparando conexão WhatsApp...
            </p>
          </div>
        );
      
      case 3:
        return (
          <div className="text-center space-y-4">
            <QrCode className="h-12 w-12 text-[#FF914C] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-4">Conecte seu WhatsApp</h3>
            
            {qrCodeImage ? (
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                <img 
                  src={qrCodeImage} 
                  alt="QR Code para WhatsApp" 
                  className="w-48 h-48 mx-auto"
                  onError={() => {
                    console.log('❌ Erro ao carregar QR Code');
                    setErrorMessage("Erro ao carregar QR Code. Tente recarregar.");
                  }}
                />
              </div>
            ) : (
              <div className="bg-gray-100 p-4 rounded-lg border-2 border-gray-200 inline-block">
                <div className="w-48 h-48 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700 mb-2">
                <strong>Como conectar:</strong>
              </p>
              <ol className="text-sm text-blue-700 text-left space-y-1">
                <li>1. Abra o WhatsApp no seu celular</li>
                <li>2. Vá em Menu (⋮) → Dispositivos conectados</li>
                <li>3. Toque em "Conectar dispositivo"</li>
                <li>4. Escaneie o QR Code acima</li>
              </ol>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={handleManualConnection}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Confirmar que conectei o WhatsApp
              </Button>
              
              <Button 
                onClick={fetchRealQRCode}
                variant="outline"
                className="w-full"
              >
                Recarregar QR Code
              </Button>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-800 mb-4">
              Tudo Pronto! 🎉
            </h3>
            <div className="bg-green-50 p-6 rounded-lg mb-6">
              <h4 className="font-semibold text-green-800 mb-3">Seu chatbot está configurado:</h4>
              <div className="space-y-2 text-sm text-green-700">
                <p><strong>IA:</strong> {chatbotConfig?.nome_da_IA}</p>
                <p><strong>Empresa:</strong> {userData?.company}</p>
                <p><strong>WhatsApp:</strong> Conectado ✅</p>
                <p><strong>Status:</strong> Ativo e funcionando</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Seu chatbot já está atendendo clientes no WhatsApp!
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/chatbot-setup')}
                className="flex items-center space-x-2"
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/0cf142c2-da7d-452c-a8d8-0413cfb6c023.png" 
                  alt="Techcorps" 
                  className="h-8 w-auto"
                />
                <h1 className="text-xl font-bold text-black">Configuração Final</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Finalizando Configuração
            </h2>
            <p className="text-gray-600">
              Criando conta, salvando dados e conectando WhatsApp
            </p>
          </div>

          <Card className="shadow-xl">
            <CardHeader className="bg-[#FF914C] text-white">
              <CardTitle className="text-2xl font-bold text-center">
                <Smartphone className="h-8 w-8 mx-auto mb-2" />
                Configuração Completa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {renderStep()}
              
              {step === 4 && (
                <Button 
                  onClick={handleFinish}
                  className="w-full bg-[#FF914C] hover:bg-[#FF7A2B] text-white py-3 mt-6"
                  size="lg"
                >
                  Ir para o Dashboard
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <div className={`h-4 w-4 rounded-full mr-1 ${
                  step >= 1 ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span>Criação</span>
              </div>
              <div className="flex items-center">
                <div className={`h-4 w-4 rounded-full mr-1 ${
                  step >= 2 ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span>Conta</span>
              </div>
              <div className="flex items-center">
                <div className={`h-4 w-4 rounded-full mr-1 ${
                  step >= 3 ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span>WhatsApp</span>
              </div>
              <div className="flex items-center">
                <div className={`h-4 w-4 rounded-full mr-1 ${
                  step >= 4 ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span>Pronto</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WhatsAppIntegration;
