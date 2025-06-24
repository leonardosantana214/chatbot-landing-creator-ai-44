import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Smartphone, Users, MessageSquare, Calendar, RefreshCw, User, Building, Phone, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEvolutionApi } from '@/hooks/useEvolutionApi';
import QRCodeConnection from '@/components/QRCodeConnection';

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

interface EvolutionStatus {
  connected: boolean;
  status: string;
  instanceName: string;
  lastCheck: Date;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isLoading, checkInstanceStatus } = useEvolutionApi();
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalContacts: 0,
    totalMessages: 0,
    totalConsultas: 0,
    activeChats: 0
  });
  const [evolutionStatus, setEvolutionStatus] = useState<EvolutionStatus | null>(null);

  const fetchUserProfile = async () => {
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

  const fetchDashboardStats = async () => {
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

  const checkChatbotStatus = async () => {
    if (!user) return;

    try {
      console.log('Verificando configuração do chatbot...');
      
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
        const config = configs[0];
        setChatbotConfig(config);
        
        if (config.evo_instance_id) {
          console.log('Verificando status da Evolution API:', config.evo_instance_id);
          const status = await checkInstanceStatus(config.evo_instance_id);
          
          if (status) {
            setEvolutionStatus({
              connected: status.connected,
              status: status.status,
              instanceName: status.instanceName,
              lastCheck: new Date()
            });
            
            console.log('Status da Evolution API:', status);
          } else {
            setEvolutionStatus({
              connected: false,
              status: 'error',
              instanceName: config.evo_instance_id,
              lastCheck: new Date()
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status do chatbot:', error);
    }
  };

  const handleRefreshAll = async () => {
    await Promise.all([
      fetchUserProfile(),
      fetchDashboardStats(),
      checkChatbotStatus()
    ]);
    
    toast({
      title: "Dados atualizados",
      description: "Todas as informações foram atualizadas com sucesso.",
    });
  };

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchDashboardStats();
      checkChatbotStatus();
      
      const interval = setInterval(() => {
        checkChatbotStatus();
      }, 30000);
      
      return () => clearInterval(interval);
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

  const getStatusColor = () => {
    if (evolutionStatus?.connected) return 'bg-green-500';
    if (evolutionStatus?.status === 'error') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const getStatusText = () => {
    if (evolutionStatus?.connected) return 'Conectado com sucesso';
    if (evolutionStatus?.status === 'error') return 'Erro de conexão';
    return 'Desconectado';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Painel centralizado de controle</p>
        </div>
        
        <Button 
          onClick={handleRefreshAll} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar Tudo
        </Button>
      </div>

      {/* Perfil do Usuário */}
      {userProfile && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Informações do Usuário</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-medium">{userProfile.name || 'Não informado'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{userProfile.email || 'Não informado'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Empresa</p>
                  <p className="font-medium">{userProfile.company || 'Não informado'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">WhatsApp</p>
                  <p className="font-medium">{userProfile.whatsapp || 'Não informado'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status do WhatsApp/Evolution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <span>Status WhatsApp Evolution</span>
              </div>
              <Badge className={`${getStatusColor()} text-white`}>
                {evolutionStatus?.connected ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <AlertCircle className="h-3 w-3 mr-1" />
                )}
                {getStatusText()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {evolutionStatus ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Instância:</span>
                  <span className="text-sm font-mono">{evolutionStatus.instanceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="text-sm">{evolutionStatus.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Última verificação:</span>
                  <span className="text-sm">{evolutionStatus.lastCheck.toLocaleTimeString()}</span>
                </div>
                {chatbotConfig?.phone_number && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Telefone:</span>
                    <span className="text-sm font-mono">{chatbotConfig.phone_number}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">Nenhuma instância configurada</p>
            )}
          </CardContent>
        </Card>

        {chatbotConfig?.evo_instance_id && !evolutionStatus?.connected && (
          <QRCodeConnection 
            instanceName={chatbotConfig.evo_instance_id}
            onConnectionSuccess={() => {
              toast({
                title: "Conectado com sucesso!",
                description: "WhatsApp conectado à Evolution API",
              });
              checkChatbotStatus();
            }}
          />
        )}

        {chatbotConfig && evolutionStatus?.connected && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Chatbot Ativo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
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
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ativo
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h3 className="text-2xl font-bold">{dashboardStats.totalContacts}</h3>
            <p className="text-sm text-gray-600">Contatos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h3 className="text-2xl font-bold">{dashboardStats.totalMessages}</h3>
            <p className="text-sm text-gray-600">Mensagens</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-3" />
            <h3 className="text-2xl font-bold">{dashboardStats.totalConsultas}</h3>
            <p className="text-sm text-gray-600">Consultas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Smartphone className="h-8 w-8 text-orange-500 mx-auto mb-3" />
            <h3 className="text-2xl font-bold">{dashboardStats.activeChats}</h3>
            <p className="text-sm text-gray-600">Chats Ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas - apenas as essenciais */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2"
              onClick={() => window.location.href = '/contacts'}
            >
              <Users className="h-6 w-6" />
              <span>Gerenciar Contatos</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2"
              onClick={() => window.location.href = '/messages'}
            >
              <MessageSquare className="h-6 w-6" />
              <span>Ver Mensagens</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2"
              onClick={() => window.location.href = '/chatbot-setup'}
            >
              <Smartphone className="h-6 w-6" />
              <span>Configurar Chatbot</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
