
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Bot, Users, MessageCircle, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalContacts: number;
  totalMessages: number;
  totalChats: number;
  activeChatbots: number;
}

interface ChatbotConfig {
  id: string;
  bot_name: string;
  service_type: string;
  tone: string;
  evo_instance_id: string | null;
  is_active: boolean;
  created_at: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    totalMessages: 0,
    totalChats: 0,
    activeChatbots: 0
  });
  const [chatbots, setChatbots] = useState<ChatbotConfig[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    if (!user) return;

    try {
      console.log('📊 Buscando estatísticas do dashboard...');
      
      const [contactsResult, messagesResult, chatsResult, chatbotsResult] = await Promise.all([
        supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('messages').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('chats').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('chatbot_configs').select('*').eq('user_id', user.id).eq('is_active', true)
      ]);

      setStats({
        totalContacts: contactsResult.count || 0,
        totalMessages: messagesResult.count || 0,
        totalChats: chatsResult.count || 0,
        activeChatbots: chatbotsResult.data?.length || 0
      });

      setChatbots(chatbotsResult.data || []);
      
      console.log('✅ Estatísticas carregadas:', {
        contacts: contactsResult.count,
        messages: messagesResult.count,
        chats: chatsResult.count,
        chatbots: chatbotsResult.data?.length
      });
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchStats();
    setLoading(false);
    
    toast({
      title: "Atualizado!",
      description: "Dados atualizados com sucesso.",
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Acesso Restrito</h3>
            <p className="text-gray-600 mb-4">Você precisa estar logado para acessar o dashboard.</p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/0cf142c2-da7d-452c-a8d8-0413cfb6c023.png" 
                alt="Techcorps" 
                className="h-8 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-black">Dashboard</h1>
                <p className="text-sm text-gray-600">Olá, {profile.name}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handleRefresh} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Informações do Perfil */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div>
                <span className="text-gray-600">Empresa:</span>
                <p className="font-medium">{profile.company}</p>
              </div>
              <div>
                <span className="text-gray-600">Área:</span>
                <p className="font-medium">{profile.area}</p>
              </div>
              <div>
                <span className="text-gray-600">WhatsApp:</span>
                <p className="font-medium">{profile.whatsapp}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contatos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalContacts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Mensagens</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMessages}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chats Ativos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChats}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chatbots Ativos</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeChatbots}</div>
            </CardContent>
          </Card>
        </div>

        {/* Chatbots */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Meus Chatbots</CardTitle>
            </CardHeader>
            <CardContent>
              {chatbots.length > 0 ? (
                <div className="space-y-3">
                  {chatbots.map((bot) => (
                    <div key={bot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{bot.bot_name}</h4>
                        <p className="text-sm text-gray-600">{bot.service_type}</p>
                        <p className="text-xs text-gray-500">Tom: {bot.tone}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          bot.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {bot.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Nenhum chatbot configurado</p>
                  <Button onClick={() => navigate('/chatbot-setup')}>
                    Criar Primeiro Chatbot
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/chatbot-setup')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  {chatbots.length > 0 ? 'Editar Chatbot' : 'Configurar Chatbot'}
                </Button>
                
                <Button 
                  onClick={() => navigate('/contacts')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Gerenciar Contatos
                </Button>
                
                <Button 
                  onClick={() => navigate('/messages')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Ver Mensagens
                </Button>
                
                <Button 
                  onClick={() => navigate('/chats')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Histórico de Chats
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
