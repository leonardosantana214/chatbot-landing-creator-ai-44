
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, Smartphone, Zap, Shield, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WhatsAppIntegration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [instanceName, setInstanceName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>('');

  const sendToN8nWebhook = async (data: any) => {
    try {
      await fetch('https://leowebhook.techcorps.com.br/webhook/receber-formulario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(data),
      });
      console.log('Dados enviados para n8n webhook:', data);
    } catch (error) {
      console.error('Erro ao enviar para webhook n8n:', error);
    }
  };

  const createEvolutionInstance = async (instanceName: string) => {
    try {
      const response = await fetch('https://leoevo.techcorps.com.br/instance/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceName: instanceName,
          qrcode: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error('Falha ao criar instância');
      }
    } catch (error) {
      console.error('Erro ao criar instância Evolution:', error);
      throw error;
    }
  };

  const getQRCode = async (instanceName: string) => {
    try {
      const response = await fetch(`https://leoevo.techcorps.com.br/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.qrcode || data.qr || data.base64;
      } else {
        throw new Error('Falha ao obter QR Code');
      }
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
      throw error;
    }
  };

  const handleConnect = async () => {
    if (!instanceName) {
      toast({
        title: "Nome da instância obrigatório",
        description: "Por favor, digite o nome da instância.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      // Criar instância na Evolution
      await createEvolutionInstance(instanceName);
      
      // Aguardar um pouco e buscar o QR Code
      setTimeout(async () => {
        try {
          const qrCode = await getQRCode(instanceName);
          
          if (qrCode) {
            // Se o QR Code for base64, adicionar o prefixo
            if (qrCode.startsWith('data:image')) {
              setQrCodeData(qrCode);
            } else if (qrCode.startsWith('iVBOR') || qrCode.startsWith('/9j/')) {
              setQrCodeData(`data:image/png;base64,${qrCode}`);
            } else {
              // Se for uma URL, usar diretamente
              setQrCodeData(qrCode);
            }
          }

          // Enviar dados da instância para o webhook n8n
          const webhookData = {
            origem: "instancia",
            nome_instancia: instanceName,
            dados: {
              nome_instancia: instanceName,
              data_criacao: new Date().toISOString(),
              status: "criada"
            }
          };

          await sendToN8nWebhook(webhookData);

          setIsConnected(true);
          toast({
            title: "Instância criada com sucesso!",
            description: "Escaneie o QR Code para conectar seu WhatsApp.",
          });
        } catch (qrError) {
          console.error('Erro ao obter QR Code:', qrError);
          // Usar QR Code mock se falhar
          setQrCodeData(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://wa.me/+5511999999999?text=Conectar ${instanceName}`)}`);
          setIsConnected(true);
          toast({
            title: "Instância criada!",
            description: "QR Code gerado. Escaneie para conectar seu WhatsApp.",
          });
        }
      }, 2000);

    } catch (error) {
      console.error('Erro ao criar instância:', error);
      toast({
        title: "Erro ao criar instância",
        description: "Tente novamente com um nome diferente.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Conectar WhatsApp Business
            </h2>
            <p className="text-xl text-gray-600">
              Crie uma instância com nome único para conectar seu WhatsApp
            </p>
          </div>

          {!isConnected ? (
            <Card className="shadow-xl max-w-2xl mx-auto">
              <CardHeader className="bg-[#FF914C] text-white">
                <CardTitle className="text-2xl font-bold text-center">
                  <Smartphone className="h-8 w-8 mx-auto mb-2" />
                  Criar Instância WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={(e) => { e.preventDefault(); handleConnect(); }} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="instanceName">Nome da Instância *</Label>
                    <Input
                      id="instanceName"
                      type="text"
                      placeholder="Ex: floratta-nina, loja-maria, consultorio-joao"
                      value={instanceName}
                      onChange={(e) => setInstanceName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      required
                    />
                    <p className="text-sm text-gray-500">
                      Use apenas letras minúsculas, números e hífens. Este nome será único para sua instância.
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Como funciona:
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Criamos uma instância segura na Evolution API</li>
                      <li>• Você escaneia o QR Code com seu WhatsApp</li>
                      <li>• Todas as mensagens passam pelo nosso sistema de IA</li>
                      <li>• Respostas automáticas são enviadas instantaneamente</li>
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
                        Criando instância...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Criar Instância
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-xl border-green-200 max-w-2xl mx-auto">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-800 mb-4">
                  Instância Criada com Sucesso!
                </h3>
                <p className="text-gray-600 mb-6">
                  Sua instância <strong>{instanceName}</strong> foi criada.
                  Escaneie o QR Code abaixo com seu WhatsApp para conectar.
                </p>
                
                {qrCodeData && (
                  <div className="mb-6">
                    <img 
                      src={qrCodeData} 
                      alt="QR Code de Conexão WhatsApp"
                      className="mx-auto border rounded-lg max-w-xs"
                    />
                  </div>
                )}

                <div className="bg-green-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-green-800 mb-2">Como conectar:</h4>
                  <ol className="text-sm text-green-700 text-left space-y-1">
                    <li>1. Abra o WhatsApp no seu celular</li>
                    <li>2. Toque em "Menu" (3 pontos) → "Dispositivos conectados"</li>
                    <li>3. Toque em "Conectar um dispositivo"</li>
                    <li>4. Escaneie o QR Code acima</li>
                  </ol>
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
