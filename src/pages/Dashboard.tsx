
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Users, MessageSquare, Calendar, RefreshCw, Bot, Settings, TestTube } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WhatsAppStatusCard from '@/components/WhatsAppStatusCard';

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

interface UserProfile {
  name: string | null;
  email: string | null;
  company: string | null;
  whatsapp: string | null;
  instance_id: string | null;
}

interface DashboardStats {
  totalContacts: number;
  totalMessages: number;
  totalConsultas: number;
  activeChats: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalContacts: 0,
    totalMessages: 0,
    totalConsultas: 0,
    activeChats: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserProfile = async (): Promise<void> => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('name, email, company, whatsapp, instance_id')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  const fetchDashboardStats = async (): Promise<void> => {
    if (!user) return;

    try {
      const { count: contactsCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: consultasCount } = await supabase
        .from('consulta')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: chatsCount } = await supabase
        .from('chats')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true);

      setDashboardStats({
        totalContacts: contactsCount || 0,
        totalMessages: messagesCount || 0,
        totalConsultas: consultasCount || 0,
        activeChats: chatsCount || 0
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const fetchChatbotConfig = async (): Promise<void> => {
    if (!user) return;

    try {
      const { data: configs, error } = await supabase
        .from('chatbot_configs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Erro ao verificar configuração:', error);
        return;
      }

      if (configs && configs.length > 0) {
        setChatbotConfig(configs[0]);
      } else {
        setChatbotConfig(null);
      }
    } catch (error) {
      console.error('Erro ao verificar configuração do chatbot:', error);
    }
  };

  const handleRefreshAll = async (): Promise<void> => {
    setIsLoading(true);
    await Promise.all([
      fetchUserProfile(),
      fetchDashboardStats(),
      fetchChatbotConfig()
    ]);
    setIsLoading(false);
    
    toast({
      title: "Dados atualizados",
      description: "Todas as informações foram atualizadas com sucesso.",
    });
  };

  const handleConnectionSuccess = (): void => {
    toast({
      title: "WhatsApp Conectado!",
      description: "Conexão estabelecida com sucesso",
    });
    fetchChatbotConfig();
  };

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchDashboardStats();
      fetchChatbotConfig();
    }
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
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Painel de controle centralizado</p>
        </div>
        
        <Button 
          onClick={handleRefreshAll} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Perfil do Usuário - Compacto */}
      {userProfile && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Nome:</span>
                <p className="font-medium">{userProfile.name || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-medium">{userProfile.email || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-gray-600">Empresa:</span>
                <p className="font-medium">{userProfile.company || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-gray-600">WhatsApp:</span>
                <p className="font-medium">{userProfile.whatsapp || 'Não informado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status WhatsApp e Chatbot lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <WhatsAppStatusCard 
          instanceName={chatbotConfig?.evo_instance_id || undefined}
          onConnectionSuccess={handleConnectionSuccess}
        />

        {chatbotConfig ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span>Chatbot Ativo</span>
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ativo
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Nome:</span>
                  <span className="text-sm font-medium">{chatbotConfig.bot_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tipo:</span>
                  <span className="text-sm">{chatbotConfig.service_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tom:</span>
                  <span className="text-sm">{chatbotConfig.tone}</span>
                </div>
                
                <div className="pt-3 space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.location.href = '/chatbot-setup'}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar Chatbot
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Testar Chatbot
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span>Chatbot</span>
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Não configurado
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Você ainda não criou um chatbot. Crie um agora para começar a automatizar suas conversas.
                </p>
                <Button 
                  className="w-full"
                  onClick={() => window.location.href = '/chatbot-setup'}
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Criar Meu Chatbot
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Estatísticas - Mais compacto */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <h3 className="text-xl font-bold">{dashboardStats.totalContacts}</h3>
            <p className="text-xs text-gray-600">Contatos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <h3 className="text-xl font-bold">{dashboardStats.totalMessages}</h3>
            <p className="text-xs text-gray-600">Mensagens</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <h3 className="text-xl font-bold">{dashboardStats.totalConsultas}</h3>
            <p className="text-xs text-gray-600">Consultas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-6 w-6 text-orange-500 mx-auto mb-2" />
            <h3 className="text-xl font-bold">{dashboardStats.activeChats}</h3>
            <p className="text-xs text-gray-600">Chats Ativos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-16 flex flex-col space-y-1"
              onClick={() => window.location.href = '/contacts'}
            >
              <Users className="h-5 w-5" />
              <span className="text-sm">Contatos</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-16 flex flex-col space-y-1"
              onClick={() => window.location.href = '/messages'}
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-sm">Mensagens</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-16 flex flex-col space-y-1"
              onClick={() => window.location.href = '/chats'}
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-sm">Conversas</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
