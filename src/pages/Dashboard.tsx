
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WhatsAppStatusCard from '@/components/WhatsAppStatusCard';
import UserProfileCard from '@/components/dashboard/UserProfileCard';
import ChatbotStatusCard from '@/components/dashboard/ChatbotStatusCard';
import StatsCards from '@/components/dashboard/StatsCards';
import QuickActions from '@/components/dashboard/QuickActions';

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
  const navigate = useNavigate();
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalContacts: 0,
    totalMessages: 0,
    totalConsultas: 0,
    activeChats: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

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
      const [contactsResult, messagesResult, consultasResult, chatsResult] = await Promise.all([
        supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('messages').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('consulta').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('chats').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active')
      ]);

      setDashboardStats({
        totalContacts: contactsResult.count || 0,
        totalMessages: messagesResult.count || 0,
        totalConsultas: consultasResult.count || 0,
        activeChats: chatsResult.count || 0
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const fetchChatbotConfig = async () => {
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
        if (!initialLoad) {
          toast({
            title: "Chatbot não encontrado",
            description: "Redirecionando para criação do chatbot...",
          });
          setTimeout(() => navigate('/chatbot-setup'), 2000);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar configuração do chatbot:', error);
    }
  };

  const handleRefreshAll = async () => {
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

  const handleConnectionSuccess = () => {
    toast({
      title: "WhatsApp Conectado!",
      description: "Conexão estabelecida com sucesso",
    });
    fetchChatbotConfig();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleNavigateToSetup = () => {
    navigate('/chatbot-setup');
  };

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchUserProfile(),
        fetchDashboardStats(),
        fetchChatbotConfig()
      ]).finally(() => {
        setInitialLoad(false);
      });
    }
  }, [user]);

  useEffect(() => {
    if (!initialLoad && user && !chatbotConfig) {
      const timer = setTimeout(() => {
        navigate('/chatbot-setup');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [initialLoad, user, chatbotConfig, navigate]);

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

      {/* Perfil do Usuário */}
      <UserProfileCard userProfile={userProfile} userId={user.id} />

      {/* Status WhatsApp e Chatbot lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <WhatsAppStatusCard 
          instanceName={chatbotConfig?.evo_instance_id || undefined}
          onConnectionSuccess={handleConnectionSuccess}
        />

        <ChatbotStatusCard 
          chatbotConfig={chatbotConfig}
          onNavigateToSetup={handleNavigateToSetup}
        />
      </div>

      {/* Estatísticas */}
      <StatsCards stats={dashboardStats} />

      {/* Ações Rápidas */}
      <QuickActions onNavigate={handleNavigate} />
    </div>
  );
};

export default Dashboard;
