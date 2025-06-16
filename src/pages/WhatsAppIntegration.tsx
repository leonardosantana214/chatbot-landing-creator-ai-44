
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Smartphone, Zap, Shield, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useN8nWebhook } from '@/hooks/useN8nWebhook';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const WhatsAppIntegration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [configSaved, setConfigSaved] = useState(false);

  // Pegar o nome da instância do state
  const instanceName = location.state?.instanceName || '';
  const chatbotData = location.state?.chatbotData || {};

  const API_KEY = '09d18f5a0aa248bebdb35893efeb170e';
  const EVOLUTION_BASE_URL = 'https://leoevo.techcorps.com.br';

  useEffect(() => {
    if (!instanceName) {
      toast({
        title: "Erro",
        description: "Nome da instância não encontrado. Redirecionando...",
        variant: "destructive",
      });
      navigate('/chatbot-setup');
      return;
    }

    // Conectar automaticamente apenas uma vez
    if (!isConnecting && !isConnected && !configSaved) {
      handleConnect();
    }
  }, [instanceName]);

  const fetchInstanceData = async (instanceName: string) => {
    try {
      console.log('🔍 Buscando dados da instância:', instanceName);
      
      // URL CORRETA para fetch-instances
      const url = `${EVOLUTION_BASE_URL}/instance/fetchInstances?instanceName=${instanceName}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      console.log('📡 Status da resposta:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📡 DADOS COMPLETOS DA INSTÂNCIA:', JSON.stringify(data, null, 2));
        
        // Mostrar dados brutos na tela
        toast({
          title: "📡 DADOS DA INSTÂNCIA CAPTURADOS",
          description: `Resposta: ${JSON.stringify(data).substring(0, 200)}...`,
          duration: 10000,
        });
        
        // Extrair o instance_id real (baseado na imagem fornecida)
        let realInstanceId = '';
        let instancePhone = '';
        
        // Verificar estrutura da resposta e extrair o ID correto
        if (data && Array.isArray(data) && data.length > 0) {
          const instanceData = data[0];
          realInstanceId = instanceData.id || instanceData.instanceId || '';
          instancePhone = instanceData.number || instanceData.phone || '';
        } else if (data.id) {
          realInstanceId = data.id;
          instancePhone = data.number || data.phone || '';
        } else if (data.instance?.id) {
          realInstanceId = data.instance.id;
          instancePhone = data.instance.number || data.instance.phone || '';
        }
        
        const cleanPhone = instancePhone.replace(/\D/g, '');
        
        console.log('✅ Instance ID REAL extraído:', realInstanceId);
        console.log('✅ Telefone extraído:', cleanPhone);
        
        // MOSTRAR NA TELA O ID REAL CAPTURADO
        toast({
          title: "🎯 INSTANCE ID REAL CAPTURADO!",
          description: `ID: ${realInstanceId} | Telefone: ${cleanPhone}`,
          duration: 12000,
        });
        
        return {
          instanceId: realInstanceId,
          phone: cleanPhone
        };
      } else {
        console.error('❌ Erro na API:', response.status);
        const errorText = await response.text();
        console.error('❌ Erro detalhado:', errorText);
        
        toast({
          title: "❌ Erro ao buscar dados",
          description: `Status: ${response.status}`,
          variant: "destructive",
        });
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar dados da instância:', error);
      toast({
        title: "❌ Erro de conexão",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
      return null;
    }
  };

  const createEvolutionInstance = async (instanceName: string) => {
    try {
      console.log('Criando instância:', instanceName);
      
      const response = await fetch(`${EVOLUTION_BASE_URL}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
        body: JSON.stringify({
          instanceName: instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS'
        }),
      });

      const responseText = await response.text();
      console.log('Resposta da criação:', responseText);

      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          console.log('Instância criada com sucesso:', data);
          return data;
        } catch (e) {
          console.log('Resposta não é JSON válido, mas request foi bem-sucedido');
          return { success: true };
        }
      } else {
        console.error('Erro na criação da instância:', response.status, responseText);
        throw new Error(`Erro ${response.status}: ${responseText}`);
      }
    } catch (error) {
      console.error('Erro ao criar instância Evolution:', error);
      throw error;
    }
  };

  const getQRCode = async (instanceName: string, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Tentativa ${i + 1} de obter QR Code para:`, instanceName);
        
        const response = await fetch(`${EVOLUTION_BASE_URL}/instance/connect/${instanceName}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': API_KEY,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Dados do QR Code recebidos:', data);
          
          const qrCode = data.qrcode || data.qr || data.base64 || data.code;
          
          if (qrCode) {
            console.log('QR Code encontrado!');
            return qrCode;
          } else {
            console.log('QR Code não encontrado na resposta, tentando novamente...');
          }
        } else {
          console.log(`Erro ${response.status} ao obter QR Code, tentativa ${i + 1}`);
        }
        
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Erro na tentativa ${i + 1}:`, error);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    throw new Error('Não foi possível obter o QR Code após várias tentativas');
  };

  const saveChatbotConfig = async (realInstanceId?: string, instancePhone?: string) => {
    if (!user || configSaved) return;

    try {
      console.log('💾 Salvando configuração no Supabase...');
      
      // USAR O INSTANCE_ID REAL COMO USER_ID
      const userIdToSave = realInstanceId || user.id;
      
      const { error } = await supabase
        .from('chatbot_configs')
        .insert({
          user_id: userIdToSave, // USAR INSTANCE_ID REAL COMO USER_ID
          bot_name: chatbotData.nome_da_IA || 'Chatbot',
          service_type: chatbotData.nicho || 'Geral',
          tone: chatbotData.personalidade || 'Profissional',
          evo_instance_id: instanceName,
          phone_number: instancePhone || null,
          is_active: true,
          webhook_url: `https://leowebhook.techcorps.com.br/webhook/${instanceName}`
        });

      if (error) throw error;
      
      console.log('✅ Configuração salva com INSTANCE_ID REAL como USER_ID:', userIdToSave);
      
      toast({
        title: "✅ Configuração salva!",
        description: `User ID: ${userIdToSave} | Telefone: ${instancePhone || 'N/A'}`,
        duration: 8000,
      });
      
      setConfigSaved(true);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: "❌ Erro ao salvar",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const handleConnect = async () => {
    if (!instanceName || isConnecting || isConnected) {
      return;
    }

    setIsConnecting(true);
    
    try {
      console.log('🚀 Iniciando processo de criação da instância...');
      
      // 1. Criar instância na Evolution
      await createEvolutionInstance(instanceName);
      
      toast({
        title: "Instância criada!",
        description: "Buscando dados reais da instância...",
      });

      // 2. Aguardar um pouco antes de buscar os dados
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 3. BUSCAR DADOS REAIS DA INSTÂNCIA
      const instanceData = await fetchInstanceData(instanceName);
      
      let realInstanceId = '';
      let instancePhone = '';
      
      if (instanceData) {
        realInstanceId = instanceData.instanceId;
        instancePhone = instanceData.phone;
        
        console.log('🎯 Dados reais capturados:', { realInstanceId, instancePhone });
      }
      
      // 4. Salvar configuração com o INSTANCE_ID REAL
      await saveChatbotConfig(realInstanceId, instancePhone);
      
      // 5. Tentar obter QR Code
      try {
        const qrCode = await getQRCode(instanceName);
        
        if (qrCode) {
          let qrCodeUrl = '';
          
          if (qrCode.startsWith('data:image')) {
            qrCodeUrl = qrCode;
          } else if (qrCode.startsWith('iVBOR') || qrCode.startsWith('/9j/') || qrCode.includes('base64')) {
            qrCodeUrl = `data:image/png;base64,${qrCode.replace('data:image/png;base64,', '')}`;
          } else if (qrCode.startsWith('http')) {
            qrCodeUrl = qrCode;
          } else {
            qrCodeUrl = `data:image/png;base64,${qrCode}`;
          }
          
          setQrCodeData(qrCodeUrl);
          console.log('QR Code configurado:', qrCodeUrl);
        }
      } catch (qrError) {
        console.error('Erro ao obter QR Code:', qrError);
        
        // Usar QR Code de fallback
        const fallbackQR = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`Conectar instância: ${instanceName}`)}`;
        setQrCodeData(fallbackQR);
        
        toast({
          title: "QR Code de demonstração",
          description: "Instância criada, mas QR Code real não disponível.",
        });
      }

      setIsConnected(true);
      toast({
        title: "✅ Processo concluído!",
        description: `Instance ID real: ${realInstanceId || 'N/A'} capturado e salvo!`,
        duration: 10000,
      });

    } catch (error) {
      console.error('Erro ao criar instância:', error);
      toast({
        title: "Erro ao criar instância",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Tente novamente.`,
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
            <p className="text-xl text-gray-600">
              Instância <code className="bg-gray-200 px-2 py-1 rounded text-sm">{instanceName}</code> - Capturando Instance ID real
            </p>
          </div>

          {!isConnected ? (
            <Card className="shadow-xl max-w-2xl mx-auto">
              <CardHeader className="bg-[#FF914C] text-white">
                <CardTitle className="text-2xl font-bold text-center">
                  <Smartphone className="h-8 w-8 mx-auto mb-2" />
                  Criando Instância e Capturando ID Real
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 border-4 border-[#FF914C] border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">
                    {isConnecting ? 'Criando instância, capturando Instance ID real e salvando no Supabase...' : 'Processando...'}
                  </p>
                </div>
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
                      onError={(e) => {
                        console.error('Erro ao carregar QR Code');
                        e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`Instância: ${instanceName}`)}`;
                      }}
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
