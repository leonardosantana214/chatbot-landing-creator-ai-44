
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEvolutionConnection } from '@/hooks/useEvolutionConnection';
import { useToast } from '@/hooks/use-toast';

interface QRCodeConnectionProps {
  instanceName: string;
  onConnectionSuccess?: () => void;
}

const QRCodeConnection = ({ instanceName, onConnectionSuccess }: QRCodeConnectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { connectionData, isConnecting, connectInstance } = useEvolutionConnection();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const handleConnect = async () => {
    if (!user || !instanceName) return;

    setConnectionStatus('connecting');
    
    try {
      const result = await connectInstance(instanceName, {});
      
      if (result) {
        setQrCode(result.qrCode || null);
        if (result.phone) {
          setConnectionStatus('connected');
          onConnectionSuccess?.();
          toast({
            title: "Conexão estabelecida!",
            description: `WhatsApp conectado com sucesso ao número ${result.phone}`,
          });
        }
      } else {
        setConnectionStatus('disconnected');
        toast({
          title: "Erro na conexão",
          description: "Não foi possível conectar com o WhatsApp",
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      console.error('Erro ao conectar:', error);
      toast({
        title: "Erro na conexão",
        description: "Ocorreu um erro ao tentar conectar com o WhatsApp",
        variant: "destructive",
      });
    }
  };

  const refreshQRCode = () => {
    setQrCode(null);
    handleConnect();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="h-5 w-5" />
          <span>Conexão WhatsApp</span>
          <Badge 
            variant={connectionStatus === 'connected' ? 'default' : 'secondary'}
            className={connectionStatus === 'connected' ? 'bg-green-500' : ''}
          >
            {connectionStatus === 'connected' && <CheckCircle className="h-3 w-3 mr-1" />}
            {connectionStatus === 'connecting' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
            {connectionStatus === 'disconnected' && <AlertCircle className="h-3 w-3 mr-1" />}
            {connectionStatus === 'connected' ? 'Conectado' : 
             connectionStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectionStatus === 'disconnected' && (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Clique no botão abaixo para gerar o QR Code e conectar seu WhatsApp
            </p>
            <Button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Gerando QR Code...
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

        {qrCode && connectionStatus !== 'connected' && (
          <div className="text-center space-y-4">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
              <img 
                src={qrCode} 
                alt="QR Code para WhatsApp" 
                className="w-48 h-48 mx-auto"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Escaneie o QR Code com seu WhatsApp para conectar
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshQRCode}
                disabled={isConnecting}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar QR Code
              </Button>
            </div>
          </div>
        )}

        {connectionStatus === 'connected' && connectionData && (
          <div className="text-center space-y-2">
            <div className="bg-green-50 p-4 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-green-800 font-medium">WhatsApp Conectado!</p>
              {connectionData.phone && (
                <p className="text-green-700 text-sm">
                  Número: {connectionData.phone}
                </p>
              )}
            </div>
          </div>
        )}

        {instanceName && (
          <div className="text-xs text-gray-500 border-t pt-2">
            <strong>Instância:</strong> {instanceName}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeConnection;
