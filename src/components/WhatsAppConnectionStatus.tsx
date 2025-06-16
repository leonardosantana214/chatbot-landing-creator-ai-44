
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, Smartphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ConnectionStatusProps {
  instanceName?: string;
  refreshInterval?: number;
}

const WhatsAppConnectionStatus = ({ 
  instanceName, 
  refreshInterval = 10000 
}: ConnectionStatusProps) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<{
    isConnected: boolean;
    instanceId: string | null;
    phone: string | null;
    lastUpdate: Date | null;
  }>({
    isConnected: false,
    instanceId: null,
    phone: null,
    lastUpdate: null,
  });

  const checkConnectionStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chatbot_configs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao verificar status:', error);
        return;
      }

      if (data) {
        setStatus({
          isConnected: true,
          instanceId: data.evo_instance_id || null,
          phone: data.phone_number || null,
          lastUpdate: new Date(data.updated_at),
        });
      } else {
        setStatus({
          isConnected: false,
          instanceId: null,
          phone: null,
          lastUpdate: null,
        });
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status de conexão:', error);
    }
  };

  useEffect(() => {
    checkConnectionStatus();
    
    const interval = setInterval(checkConnectionStatus, refreshInterval);
    
    return () => clearInterval(interval);
  }, [user, refreshInterval]);

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Smartphone className="h-5 w-5" />
          <span>Status WhatsApp</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Conexão:</span>
          <Badge 
            variant={status.isConnected ? "default" : "secondary"}
            className={status.isConnected ? "bg-green-500 hover:bg-green-600" : ""}
          >
            {status.isConnected ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Conectado
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                Desconectado
              </>
            )}
          </Badge>
        </div>

        {status.instanceId && (
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Instance:</span>
              <code className="bg-gray-100 px-1 rounded text-xs">
                {status.instanceId}
              </code>
            </div>
            
            {status.phone && (
              <div className="flex justify-between">
                <span className="text-gray-600">Telefone:</span>
                <span className="font-mono text-xs">{status.phone}</span>
              </div>
            )}
            
            {status.lastUpdate && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Última atualização:</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs">
                    {status.lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {!status.isConnected && (
          <div className="text-xs text-gray-500 text-center">
            Nenhuma instância conectada para este usuário
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhatsAppConnectionStatus;
