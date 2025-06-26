
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, RefreshCw, Smartphone, QrCode, Loader2, SkipForward } from 'lucide-react';
import { useEvolutionStatus } from '@/hooks/useEvolutionStatus';
import QRCodeConnection from '@/components/QRCodeConnection';
import { useState } from 'react';

interface WhatsAppStatusCardProps {
  instanceName?: string;
  onConnectionSuccess?: () => void;
  onSkipConnection?: () => void;
}

const WhatsAppStatusCard = ({ instanceName, onConnectionSuccess, onSkipConnection }: WhatsAppStatusCardProps) => {
  const { status, isLoading, refreshStatus } = useEvolutionStatus(instanceName);
  const [showQRCode, setShowQRCode] = useState(false);

  const getStatusColor = () => {
    if (!status) return 'bg-gray-500';
    if (status.isConnected) return 'bg-green-500';
    if (status.status === 'error') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const getStatusText = () => {
    if (!status) return 'Verificando...';
    if (status.isConnected) return 'Conectado';
    if (status.status === 'error') return 'Erro';
    return 'Desconectado';
  };

  const getStatusMessage = () => {
    if (!status) return 'Verificando status da instância...';
    if (status.isConnected && status.phone) {
      return `✅ WhatsApp conectado com sucesso no número ${status.phone}`;
    }
    if (status.isConnected) {
      return '✅ WhatsApp conectado com sucesso';
    }
    return '⚠️ WhatsApp não conectado. Conecte via QR Code ou pule esta etapa.';
  };

  const handleConnectClick = () => {
    setShowQRCode(true);
  };

  const handleConnectionSuccess = () => {
    setShowQRCode(false);
    refreshStatus();
    onConnectionSuccess?.();
  };

  const handleSkipConnection = () => {
    console.log('⏭️ Usuário optou por pular conexão WhatsApp');
    onSkipConnection?.();
  };

  const handleRefreshClick = () => {
    refreshStatus();
  };

  if (showQRCode && instanceName) {
    return (
      <QRCodeConnection 
        instanceName={instanceName}
        onConnectionSuccess={handleConnectionSuccess}
        onSkip={() => setShowQRCode(false)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>Status WhatsApp</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`${getStatusColor()} text-white`}>
              {status?.isConnected ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              {getStatusText()}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshClick}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          {getStatusMessage()}
        </p>

        {status && (
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Instância:</span>
              <span className="font-mono">{status.instanceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status Evolution:</span>
              <span className={status.isConnected ? 'text-green-600 font-semibold' : 'text-red-600'}>
                {status.isConnected ? 'CONECTADO' : 'DESCONECTADO'}
              </span>
            </div>
            {status.phone && (
              <div className="flex justify-between">
                <span className="text-gray-600">Telefone:</span>
                <span className="font-mono text-green-600 font-semibold">{status.phone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Última verificação:</span>
              <span>{status.lastCheck.toLocaleTimeString()}</span>
            </div>
          </div>
        )}

        {/* Mostrar botões apenas se não estiver conectado */}
        {status && !status.isConnected && instanceName && (
          <div className="space-y-2">
            <Button 
              onClick={handleConnectClick}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Conectar via QR Code
                </>
              )}
            </Button>

            {status.canSkipQR && onSkipConnection && (
              <Button 
                onClick={handleSkipConnection}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                <SkipForward className="h-4 w-4 mr-2" />
                Pular Conexão (Conectar Depois)
              </Button>
            )}
          </div>
        )}

        {/* Mostrar status conectado */}
        {status?.isConnected && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center text-green-800">
              <CheckCircle className="h-5 w-5 mr-3" />
              <div>
                <span className="font-bold text-lg">WhatsApp Conectado! 🎉</span>
                {status.phone && (
                  <p className="text-sm text-green-700 mt-1">
                    Número: <span className="font-mono font-bold">{status.phone}</span>
                  </p>
                )}
                <p className="text-xs text-green-600 mt-1">
                  Seu chatbot está pronto para receber mensagens!
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhatsAppStatusCard;
