
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, Smartphone, Zap, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WhatsAppIntegration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [instanceName, setInstanceName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = async () => {
    if (!phoneNumber || !instanceName) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    // Simulação da conexão com webhook EVO
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      toast({
        title: "Conectado com sucesso!",
        description: "Seu WhatsApp foi integrado ao chatbot.",
      });
    }, 3000);
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/pricing-selection')}
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
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Conectar WhatsApp Business
            </h2>
            <p className="text-xl text-gray-600">
              Integre seu WhatsApp com nosso sistema para começar a usar o chatbot
            </p>
          </div>

          {!isConnected ? (
            <Card className="shadow-xl">
              <CardHeader className="bg-[#FF914C] text-white">
                <CardTitle className="text-2xl font-bold text-center">
                  <Smartphone className="h-8 w-8 mx-auto mb-2" />
                  Configuração da Instância
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={(e) => { e.preventDefault(); handleConnect(); }} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="instanceName">Nome da Instância *</Label>
                    <Input
                      id="instanceName"
                      type="text"
                      placeholder="Ex: MeuNegocio_Bot"
                      value={instanceName}
                      onChange={(e) => setInstanceName(e.target.value)}
                      required
                    />
                    <p className="text-sm text-gray-500">
                      Escolha um nome único para identificar sua instância
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Número do WhatsApp Business *</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                    <p className="text-sm text-gray-500">
                      Use o número do WhatsApp Business que será usado pelo chatbot
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Como funciona a integração:
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Criamos uma instância webhook segura para seu WhatsApp</li>
                      <li>• Todas as mensagens passam pelo nosso sistema de IA</li>
                      <li>• Respostas automáticas são enviadas instantaneamente</li>
                      <li>• Você mantém controle total sobre as configurações</li>
                    </ul>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#FF914C] hover:bg-[#FF7A2B] text-white py-3"
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Zap className="mr-2 h-4 w-4 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Conectar WhatsApp
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-xl border-green-200">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-800 mb-4">
                  WhatsApp Conectado com Sucesso!
                </h3>
                <p className="text-gray-600 mb-6">
                  Sua instância <strong>{instanceName}</strong> foi criada e está ativa.
                  O número <strong>{phoneNumber}</strong> agora está integrado ao chatbot da Techcorps.
                </p>
                
                <div className="bg-green-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-green-800 mb-2">Próximos passos:</h4>
                  <ul className="text-sm text-green-700 text-left space-y-1">
                    <li>✓ Instância webhook configurada</li>
                    <li>✓ IA treinada para seu negócio</li>
                    <li>✓ Sistema de respostas automáticas ativo</li>
                    <li>✓ Dashboard de monitoramento disponível</li>
                  </ul>
                </div>

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
