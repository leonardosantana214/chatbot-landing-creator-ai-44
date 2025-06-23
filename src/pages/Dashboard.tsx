
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Smartphone, Settings, Users, MessageSquare, Calendar, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEvolutionApi } from '@/hooks/useEvolutionApi';
import WhatsAppConnectionStatus from '@/components/WhatsAppConnectionStatus';
import ChatbotStatus from '@/components/ChatbotStatus';

interface ChatbotConfig {
  id: string;
  bot_name: string;
  service_type: string;
  tone: string;
  evo_instance_id: string | null;
  phone_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isLoading, checkInstanceStatus } = useEvolutionApi();
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig | null>(null);
  const [instanceStatus, setInstanceStatus] = useState<{
    connected: boolean;
    status: string;
    instanceName: string;
  } | null>(null);

  const [userProfile, setUserProfile] = useState<{
    name: string | null;
    email: string | null;
    company: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('name, email, company')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Erro ao buscar perfil:', error);
          } else {
            setUserProfile({
              name: data?.name || null,
              email: data?.email || null,
              company: data?.company || null,
            });
          }
        } catch (error) {
          console.error('Erro ao buscar perfil:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const checkChatbotStatus = async () => {
    if (!user) return;

    try {
      console.log('Verificando se usuário tem chatbot configurado...');
      
      // Buscar apenas configurações do usuário logado
      const { data: configs, error } = await supabase
        .from('chatbot_configs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Erro ao verificar configuração:', error);
        return;
      }

      console.log('Configurações encontradas:', configs);

      if (configs && configs.length > 0) {
        const config = configs[0];
        setChatbotConfig(config);
        
        if (config.evo_instance_id) {
          console.log('Verificando status da instância:', config.evo_instance_id);
          const status = await checkInstanceStatus(config.evo_instance_id);
          
          if (status) {
            setInstanceStatus({
              connected: status.connected,
              status: status.status,
              instanceName: status.instanceName
            });
            
            console.log('Status retornado da Evolution API:', status);
          } else {
            setInstanceStatus({
              connected: false,
              status: 'error',
              instanceName: config.evo_instance_id
            });
            
            toast({
              title: "Problema na instância",
              description: `A instância ${config.evo_instance_id} precisa ser configurada novamente.`,
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status do chatbot:', error);
    }
  };

  const handleRefreshStatus = async () => {
    if (chatbotConfig?.evo_instance_id) {
      await checkChatbotStatus();
      toast({
        title: "Status atualizado",
        description: "O status da instância foi verificado novamente.",
      });
    }
  };

  useEffect(() => {
    checkChatbotStatus();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
          <p className="text-gray-600">Você precisa estar logado para acessar o dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Gerencie seus chatbots e acompanhe o desempenho</p>
        </div>
        
        {chatbotConfig && (
          <Button 
            onClick={handleRefreshStatus} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar Status
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Status do WhatsApp */}
        <WhatsAppConnectionStatus />
        
        {/* Status do Chatbot com verificação automática */}
        <ChatbotStatus />
        
        {/* Configuração do Chatbot */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <MessageSquare className="h-5 w-5" />
              <span>Chatbot</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chatbotConfig ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={chatbotConfig.is_active ? "default" : "secondary"}>
                    {chatbotConfig.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nome:</span>
                    <span className="font-medium">{chatbotConfig.bot_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium">{chatbotConfig.service_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tom:</span>
                    <span className="font-medium">{chatbotConfig.tone}</span>
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => window.location.href = '/chatbot-setup'}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-3">Nenhum chatbot configurado</p>
                <Button 
                  size="sm"
                  onClick={() => window.location.href = '/chatbot-setup'}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Criar Chatbot
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => window.location.href = '/contacts'}>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Contatos</h3>
            <p className="text-sm text-gray-600">Gerencie seus contatos</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => window.location.href = '/messages'}>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Mensagens</h3>
            <p className="text-sm text-gray-600">Visualize conversas</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => window.location.href = '/consultas'}>
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Consultas</h3>
            <p className="text-sm text-gray-600">Agende consultas</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => window.location.href = '/chatbot-setup'}>
          <CardContent className="p-6 text-center">
            <Settings className="h-8 w-8 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Configurações</h3>
            <p className="text-sm text-gray-600">Ajustar preferências</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
