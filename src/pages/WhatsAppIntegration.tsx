
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Smartphone, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEvolutionConnection } from '@/hooks/useEvolutionConnection';

const WhatsAppIntegration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { connectionData, isConnecting, connectInstance } = useEvolutionConnection();
  
  const [connectionSuccess, setConnectionSuccess] = useState(false);

  // Pegar dados do state da navegação
  const instanceName = location.state?.instanceName || '';
  const chatbotData = location.state?.chatbotData || {};

  useEffect(() => {
    // Verificar se usuário está autenticado
    if (!user) {
      toast({
        title: "❌ Erro de Autenticação",
        description: "Você precisa estar logado para conectar uma instância WhatsApp",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // Verificar se temos o nome da instância
    if (!instanceName) {
      toast({
        title: "❌ Erro",
        description: "Nome da instância não encontrado. Redirecionando...",
        variant: "destructive",
      });
      navigate('/chatbot-setup');
      return;
    }

    console.log('🔐 Usuário autenticado:', user.id);
    console.log('🏭 Instance Name:', instanceName);
    console.log('🤖 Chatbot Data:', chatbotData);
  }, [user, instanceName, navigate, toast, chatbotData]);

  const handleConnect = async () => {
    if (!user || !instanceName || isConnecting) {
      return;
    }

    console.log('🚀 Iniciando conexão da instância...');
    console.log('👤 User autenticado:', user.id);
    console.log('🏭 Instance:', instanceName);
    
    const result = await connectInstance(instanceName, chatbotData);
    
    if (result) {
      console.log('✅ Conexão bem-sucedida:', result);
      setConnectionSuccess(true);
    }
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  // Verificar se usuário não está autenticado
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Autenticação Necessária
            </h3>
            <p className="text-gray-600 mb-4">
              Você precisa estar logado para conectar uma instância WhatsApp.
            </p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/chatbot-setup')}
                className="flex items-center space-x-2"
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
                <h1 className="text-xl font-bold text-black">Integração WhatsApp</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Conectar WhatsApp Business
            </h2>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-blue-800">
                <strong>Usuário:</strong> {user.email} | <strong>ID:</strong> {user.id}
              </p>
              <p className="text-blue-800">
                <strong>Instância:</strong> <code className="bg-blue-200 px-2 py-1 rounded text-sm">{instanceName}</code>
              </p>
            </div>
          </div>

          {!connectionSuccess ? (
            <Card className="shadow-xl max-w-2xl mx-auto">
              <CardHeader className="bg-[#FF914C] text-white">
                <CardTitle className="text-2xl font-bold text-center">
                  <Smartphone className="h-8 w-8 mx-auto mb-2" />
                  {isConnecting ? 'Conectando Instância...' : 'Pronto para Conectar'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center">
                {isConnecting ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-16 h-16 border-4 border-[#FF914C] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <div className="space-y-2 text-gray-600">
                      <p>🔄 Processando instância Evolution...</p>
                      <p>🆔 Capturando Instance ID real...</p>
                      <p>💾 Salvando configuração autenticada no Supabase...</p>
                      <p className="text-sm">Aguarde, este processo pode levar alguns segundos...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">Sistema Reformulado:</h3>
                      <ul className="text-sm text-green-700 text-left space-y-1">
                        <li>✅ Autenticação obrigatória com Supabase</li>
                        <li>✅ Captura do Instance ID REAL da Evolution</li>
                        <li>✅ Vinculação correta: User ID ↔ Instance ID</li>
                        <li>✅ Eliminação do placeholder 00000000</li>
                        <li>✅ Resolução de constraint violations</li>
                      </ul>
                    </div>
                    
                    <Button 
                      onClick={handleConnect}
                      className="w-full bg-[#FF914C] hover:bg-[#FF7A2B] text-white py-3"
                      disabled={!instanceName}
                    >
                      Conectar Instância WhatsApp
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-xl border-green-200 max-w-2xl mx-auto">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-800 mb-4">
                  Conexão Realizada com Sucesso!
                </h3>
                
                {connectionData && (
                  <div className="bg-green-50 p-4 rounded-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-green-700">
                      <div><strong>User ID:</strong> {user.id}</div>
                      <div><strong>Instance ID:</strong> {connectionData.instanceId}</div>
                      <div><strong>Instance Name:</strong> {connectionData.instanceName}</div>
                      <div><strong>Telefone:</strong> {connectionData.phone}</div>
                    </div>
                  </div>
                )}
                
                {connectionData?.qrCode && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Escaneie o QR Code:</h4>
                    <img 
                      src={connectionData.qrCode} 
                      alt="QR Code WhatsApp"
                      className="mx-auto border rounded-lg max-w-xs"
                    />
                    <div className="bg-blue-50 p-3 rounded-lg mt-4">
                      <p className="text-sm text-blue-700">
                        Abra o WhatsApp → Menu → Dispositivos conectados → Conectar dispositivo
                      </p>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleFinish}
                  className="w-full bg-[#FF914C] hover:bg-[#FF7A2B] text-white py-3"
                >
                  Ir para o Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default WhatsAppIntegration;
