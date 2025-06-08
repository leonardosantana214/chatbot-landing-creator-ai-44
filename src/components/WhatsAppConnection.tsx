
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, CheckCircle, Loader2 } from 'lucide-react';
import { UserData } from '../types/user';

interface WhatsAppConnectionProps {
  userData: UserData;
  onConnectionSuccess: () => void;
}

const WhatsAppConnection = ({ userData, onConnectionSuccess }: WhatsAppConnectionProps) => {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [qrCode, setQrCode] = useState('');

  const handleConnect = () => {
    setConnecting(true);
    // Simular processo de conexão
    setTimeout(() => {
      setQrCode('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
      setConnecting(false);
    }, 2000);
  };

  const handleConnectionConfirmed = () => {
    setConnected(true);
    setTimeout(() => {
      onConnectionSuccess();
    }, 1000);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="h-5 w-5" />
          <span>Conectar WhatsApp</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {!connecting && !qrCode && (
          <Button 
            onClick={handleConnect}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Gerar QR Code
          </Button>
        )}

        {connecting && (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Gerando QR Code...</span>
          </div>
        )}

        {qrCode && !connected && (
          <div className="space-y-4">
            <img src={qrCode} alt="QR Code WhatsApp" className="mx-auto border rounded" />
            <div className="text-sm text-gray-600 space-y-1">
              <p>1. Abra o WhatsApp no seu celular</p>
              <p>2. Toque em Menu → Dispositivos conectados</p>
              <p>3. Toque em "Conectar um dispositivo"</p>
              <p>4. Escaneie o código acima</p>
            </div>
            <Button 
              onClick={handleConnectionConfirmed}
              variant="outline"
            >
              Confirmar Conexão
            </Button>
          </div>
        )}

        {connected && (
          <div className="space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <h3 className="font-semibold text-green-800">Conectado com sucesso!</h3>
              <p className="text-sm text-gray-600">Redirecionando para o dashboard...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhatsAppConnection;
