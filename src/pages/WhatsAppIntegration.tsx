import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CheckCircle, Smartphone, QrCode, Loader2, AlertCircle, Copy, Eye, EyeOff, SkipForward } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompleteRegistration } from '@/hooks/useCompleteRegistration';
import QRCodeConnection from '@/components/QRCodeConnection';

const WhatsAppIntegration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { registerUserComplete, loading } = useCompleteRegistration();
  
  const [step, setStep] = useState(0); // Começar no step 0 para escolha de senha
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userCredentials, setUserCredentials] = useState<{email: string, password: string} | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [skippedQR, setSkippedQR] = useState(false);

  const userData = location.state?.userData;
  const chatbotConfig = location.state?.chatbotConfig;
  const instanceName = location.state?.instanceName;

  useEffect(() => {
    if (!userData || !chatbotConfig || !instanceName) {
      navigate('/chatbot-setup');
      return;
    }
  }, [userData, chatbotConfig, instanceName]);

  const handlePasswordSubmit = () => {
    if (!password || password.length < 6) {
      toast({
        title: "❌ Senha inválida",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "❌ Senhas não coincidem",
        description: "As senhas digitadas não são iguais.",
        variant: "destructive",
      });
      return;
    }

    // Salvar credenciais e continuar
    setUserCredentials({
      email: userData.email,
      password: password
    });

    handleCompleteSetup();
  };

  const handleCompleteSetup = async () => {
    if (!userData || !chatbotConfig || !password) return;

    setStep(1); // Iniciando criação
    setErrorMessage(null);
    
    try {
      console.log('🚀 Iniciando configuração completa...');
      
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
          description: "Agora você pode conectar seu WhatsApp ou pular esta etapa.",
        });
        
        // Aguardar um pouco e ir para QR Code opcional
        setTimeout(() => {
          setStep(3); // Mostrando QR Code opcional
        }, 2000);
        
      } else {
        setErrorMessage("Falha ao criar conta. Tente novamente.");
        setStep(0);
      }
    } catch (error) {
      console.error('💥 Erro no setup completo:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido');
      setStep(0);
    }
  };

  const handleConnectionSuccess = () => {
    setConnectionSuccess(true);
    setStep(4);
    toast({
      title: "🎉 WhatsApp conectado!",
      description: "Conexão estabelecida com sucesso!",
    });
  };

  const handleSkipQR = () => {
    console.log('⏭️ Usuário optou por pular QR Code');
    setSkippedQR(true);
    setStep(4); // Ir direto para finalização
    toast({
      title: "⏭️ Configuração concluída!",
      description: "Você pode conectar o WhatsApp mais tarde no dashboard.",
    });
  };

  const fetchRealQRCode = async () => {
    try {
      const API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY || '09d18f5a0aa248bebdb35893efeb170e';
      const EVOLUTION_BASE_URL = 'https://leoevo.techcorps.com.br';
      
      console.log('📱 Buscando QR Code real da Evolution API...');
      
      // Primeiro verificar status da instância usando o endpoint correto
      const statusResponse = await fetch(`${EVOLUTION_BASE_URL}/instance/fetchInstances`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log('📊 Status das instâncias:', statusData);
        
        // Procurar nossa instância na lista
        const ourInstance = statusData.find((inst: any) => inst.instanceName === instanceName);
        
        if (ourInstance && ourInstance.connectionStatus === 'open') {
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
      
      const statusResponse = await fetch(`${EVOLUTION_BASE_URL}/instance/fetchInstances`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        const ourInstance = statusData.find((inst: any) => inst.instanceName === instanceName);
        
        if (ourInstance && ourInstance.connectionStatus === 'open') {
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copiado!",
      description: "Texto copiado para a área de transferência.",
    });
  };

  const handleRetry = () => {
    setErrorMessage(null);
    setStep(0);
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
      case 0:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Escolha sua senha</h3>
              <p className="text-gray-600">
                Defina uma senha segura para acessar sua conta
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (confirmado)
                </label>
                <Input
                  type="email"
                  value={userData?.email || ''}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nova senha *
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha (mín. 6 caracteres)"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar senha *
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a senha novamente"
                />
              </div>

              <Button 
                onClick={handlePasswordSubmit}
                className="w-full bg-[#FF914C] hover:bg-[#FF7A2B] text-white"
                disabled={!password || !confirmPassword}
              >
                Continuar Configuração
              </Button>
            </div>
          </div>
        );
      
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
            <h3 className="text-xl font-semibold mb-4">Conectar WhatsApp (Opcional)</h3>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-700 mb-2">
                <strong>Esta etapa é opcional!</strong>
              </p>
              <p className="text-xs text-blue-600">
                Você pode conectar seu WhatsApp agora ou mais tarde no dashboard. 
                Sua conta já está criada e funcionando.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => setQrCodeImage('generate')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={loading}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Conectar WhatsApp Agora
              </Button>
              
              <Button 
                onClick={handleSkipQR}
                variant="outline"
                className="w-full"
              >
                <SkipForward className="h-4 w-4 mr-2" />
                Pular e Conectar Depois
              </Button>
            </div>

            {qrCodeImage === 'generate' && instanceName && (
              <div className="mt-4">
                <QRCodeConnection 
                  instanceName={instanceName}
                  onConnectionSuccess={handleConnectionSuccess}
                  onSkip={handleSkipQR}
                />
              </div>
            )}
          </div>
        );
      
      case 4:
        return (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-800 mb-4">
              Tudo Pronto! 🎉
            </h3>
            
            {userCredentials && (
              <div className="bg-blue-50 p-6 rounded-lg mb-6 border-2 border-blue-200">
                <h4 className="font-bold text-blue-800 mb-4 text-lg">
                  🔐 SUAS CREDENCIAIS DE ACESSO
                </h4>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded border">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email:</label>
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="font-mono text-sm">{userCredentials.email}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(userCredentials.email)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded border">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Senha:</label>
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="font-mono text-sm">
                        {showPassword ? userCredentials.password : '••••••••••••'}
                      </span>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(userCredentials.password)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-300">
                  <p className="text-yellow-800 text-sm font-semibold">
                    ⚠️ IMPORTANTE: Anote essas credenciais em um local seguro! 
                  </p>
                </div>
              </div>
            )}

            <div className="bg-green-50 p-6 rounded-lg mb-6">
              <h4 className="font-semibold text-green-800 mb-3">Sua configuração:</h4>
              <div className="space-y-2 text-sm text-green-700">
                <p><strong>IA:</strong> {chatbotConfig?.nome_da_IA}</p>
                <p><strong>Empresa:</strong> {userData?.company}</p>
                <p><strong>WhatsApp:</strong> {connectionSuccess ? 'Conectado ✅' : skippedQR ? 'Não conectado (pode conectar depois) ⏭️' : 'Verificando...'}</p>
                <p><strong>Status:</strong> Ativo e funcionando</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">
              {connectionSuccess 
                ? "Conta criada e WhatsApp conectado com sucesso!" 
                : "Conta criada com sucesso! Você pode conectar o WhatsApp mais tarde no dashboard."
              }
            </p>
            
            <div className="space-y-2">
              <Button 
                onClick={handleFinish}
                className="w-full bg-[#FF914C] hover:bg-[#FF7A2B] text-white"
              >
                Ir para Dashboard
              </Button>
              
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
              >
                Voltar para Início
              </Button>
            </div>
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
              {step === 0 ? "Escolha sua senha para continuar" : 
               step === 3 ? "Conecte seu WhatsApp (opcional)" :
               "Criando conta, salvando dados e configurando sistema"}
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
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <div className={`h-4 w-4 rounded-full mr-1 ${
                  step >= 0 ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span>Senha</span>
              </div>
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
