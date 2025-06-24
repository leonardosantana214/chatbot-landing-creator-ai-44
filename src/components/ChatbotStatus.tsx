import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEvolutionApi } from '@/hooks/useEvolutionApi';

interface ChatbotStatusProps {
  onStatusChange?: (isActive: boolean) => void;
  compact?: boolean;
}

const ChatbotStatus = ({ onStatusChange, compact = false }: ChatbotStatusProps) => {
  const { user } = useAuth();
  const { checkInstanceStatus, isLoading } = useEvolutionApi();
  const [status, setStatus] = useState({
    isActive: false,
    instanceName: '',
    connected: false,
    lastCheck: new Date(),
  });

  const checkChatbotStatus = async () => {
    if (!user) return;

    try {
      const { data: config, error } = await supabase
        .from('chatbot_configs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error || !config) {
        setStatus(prev => ({ ...prev, isActive: false, connected: false }));
        onStatusChange?.(false);
        return;
      }

      if (config.evo_instance_id) {
        const evolutionStatus = await checkInstanceStatus(config.evo_instance_id);
        const isConnected = evolutionStatus?.connected || false;
        
        setStatus({
          isActive: config.is_active,
          instanceName: config.evo_instance_id,
          connected: isConnected,
          lastCheck: new Date(),
        });
        
        onStatusChange?.(config.is_active && isConnected);
      }
    } catch (error) {
      console.error('Erro ao verificar status do chatbot:', error);
      setStatus(prev => ({ ...prev, isActive: false, connected: false }));
      onStatusChange?.(false);
    }
  };

  useEffect(() => {
    checkChatbotStatus();
    const interval = setInterval(checkChatbotStatus, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const getStatusColor = () => {
    if (status.isActive && status.connected) return 'bg-green-500';
    if (status.isActive && !status.connected) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (status.isActive && status.connected) return 'Conectado com sucesso';
    if (status.isActive && !status.connected) return 'Desconectado';
    return 'Inativo';
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Badge className={`${getStatusColor()} text-white`}>
          {status.isActive && status.connected ? (
            <CheckCircle className="h-3 w-3 mr-1" />
          ) : (
            <AlertCircle className="h-3 w-3 mr-1" />
          )}
          {getStatusText()}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={checkChatbotStatus}
          disabled={isLoading}
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Status do Chatbot</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkChatbotStatus}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge className={`${getStatusColor()} text-white`}>
            {status.isActive && status.connected ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <AlertCircle className="h-3 w-3 mr-1" />
            )}
            {getStatusText()}
          </Badge>
        </div>

        <div className="text-sm text-gray-600">
          {getStatusMessage()}
        </div>

        {status.instanceName && (
          <div className="text-xs text-gray-500">
            Instância: {status.instanceName}
          </div>
        )}

        <div className="text-xs text-gray-400">
          Última verificação: {status.lastCheck.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

const getStatusMessage = (status: any) => {
    if (status.isActive && status.connected) {
      return 'Chatbot funcionando normalmente';
    }
    if (status.isActive && !status.connected) {
      return 'Chatbot indisponível no momento. Por favor, tente novamente mais tarde.';
    }
    return 'Chatbot não configurado ou inativo';
  };

export default ChatbotStatus;
