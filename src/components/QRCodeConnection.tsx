
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, CheckCircle, AlertCircle, RefreshCw, SkipForward } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeConnectionProps {
  instanceName: string;
  onConnectionSuccess?: () => void;
  onSkip?: () => void;
}

const QRCodeConnection = ({ instanceName, onConnectionSuccess, onSkip }: QRCodeConnectionProps) => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const API_KEY = '09d18f5a0aa248bebdb35893efeb170e';
  const EVOLUTION_BASE_URL = 'https://leoevo.techcorps.com.br';

  const generateQRCode = async () => {
    setIsLoading(true);
    try {
      console.log('📱 Gerando QR Code para:', instanceName);
      
      const response = await fetch(`${EVOLUTION_BASE_URL}/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.base64 || data.qrcode) {
          const qrData = data.base64 || data.qrcode;
          const qrImage = qrData.startsWith('data:image') ? qrData : `data:image/png;base64,${qrData}`;
          setQrCode(qrImage);
          
          toast({
            title: "QR Code gerado!",
            description: "Escaneie com seu WhatsApp para conectar.",
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error);
      toast({
        title: "Erro ao gerar QR Code",
        description: "Tente novamente em alguns segundos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      console.log('🔍 Verificando conexão da instância:', instanceName);
      
      const response = await fetch(`${EVOLUTION_BASE_URL}/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const connected = data.state === 'open';
        
        if (connected) {
          setIsConnected(true);
          toast({
            title: "🎉 WhatsApp conectado!",
            description: "Conexão estabelecida com sucesso!",
          });
          onConnectionSuccess?.();
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar conexão:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Verificar conexão automaticamente a cada 5 segundos quando QR estiver visível
  useEffect(() => {
    if (!qrCode || isConnected) return;

    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, [qrCode, isConnected]);

  // Gerar QR Code automaticamente quando componente carrega
  useEffect(() => {
    if (!isConnected) {
      generateQRCode();
    }
  }, []);

  if (isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="text-center p-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            WhatsApp Conectado!
          </h3>
          <p className="text-gray-600">
            Sua instância está conectada e pronta para receber mensagens.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-center">
          <QrCode className="h-5 w-5" />
          <span>Conectar WhatsApp</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {qrCode ? (
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
              <img 
                src={qrCode} 
                alt="QR Code WhatsApp" 
                className="mx-auto max-w-full h-auto"
              />
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Como conectar:</strong></p>
              <ol className="text-left space-y-1">
                <li>1. Abra o WhatsApp no seu celular</li>
                <li>2. Toque nos 3 pontos → Dispositivos conectados</li>
                <li>3. Toque em "Conectar um dispositivo"</li>
                <li>4. Escaneie este QR Code</li>
              </ol>
            </div>

            <div className="flex space-x-2 mt-4">
              <Button 
                onClick={checkConnection}
                disabled={isChecking}
                variant="outline"
                className="flex-1"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verificar Conexão
                  </>
                )}
              </Button>
              
              {onSkip && (
                <Button 
                  onClick={onSkip}
                  variant="ghost"
                  className="flex-1"
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Pular
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Erro ao carregar QR Code
            </p>
            <Button 
              onClick={generateQRCode}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Gerar QR Code
                </>
              )}
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          Instância: <code>{instanceName}</code>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeConnection;
