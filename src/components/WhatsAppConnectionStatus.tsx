
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, Smartphone, User, Building } from 'lucide-react';
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
    userProfile: any | null;
  }>({
    isConnected: false,
    instanceId: null,
    phone: null,
    lastUpdate: null,
    userProfile: null,
  });

  const checkConnectionStatus = async () => {
    if (!user) return;

    try {
      // 1. Buscar dados do perfil do usuário (incluindo instance_id)
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
      }

      // 2. Buscar configuração do chatbot
      const { data: configData, error: configError } = await supabase
        .from('chatbot_configs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (configError) {
        console.error('❌ Erro ao verificar config:', configError);
        return;
      }

      if (configData && profileData) {
        setStatus({
          isConnected: true,
          instanceId: profileData.instance_id,
          phone: configData.phone_number,
          lastUpdate: new Date(configData.updated_at),
          userProfile: profileData,
        });
      } else {
        setStatus({
          isConnected: false,
          instanceId: profileData?.instance_id || null,
          phone: null,
          lastUpdate: null,
          userProfile: profileData,
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
        {/* Status da Conexão */}
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

        {/* Dados do Usuário */}
        {status.userProfile && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
              <User className="h-4 w-4 mr-1" />
              Dados do Usuário
            </h4>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-blue-600">Nome:</span>
                <span className="font-medium">{status.userProfile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">Email:</span>
                <span className="font-mono text-xs">{status.userProfile.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">Empresa:</span>
                <span className="font-medium">{status.userProfile.company}</span>
              </div>
            </div>
          </div>
        )}

        {/* Detalhes da Instância */}
        {status.instanceId && (
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Instance ID:</span>
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
            {status.userProfile ? 
              'Configuração do chatbot não encontrada' : 
              'Nenhuma instância conectada para este usuário'
            }
          </div>
        )}

        {/* Debug Info */}
        {status.userProfile && (
          <div className="bg-gray-50 p-2 rounded text-xs">
            <strong>🔧 Para N8N:</strong>
            <br />
            <code>User ID: {user.id}</code>
            <br />
            <code>Instance ID: {status.instanceId}</code>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhatsAppConnectionStatus;
