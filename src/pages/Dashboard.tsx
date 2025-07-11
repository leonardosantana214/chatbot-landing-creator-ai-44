
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Bot, Users, MessageCircle, BarChart3, LogOut, Building, Phone, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WhatsAppStatusSection from '@/components/dashboard/WhatsAppStatusSection';

interface DashboardStats {
  totalContacts: number;
  totalMessages: number;
  totalChats: number;
  activeChatbots: number;
  todayMessages: number;
  activeConversations: number;
}

interface ChatbotConfig {
  id: string;
  bot_name: string;
  service_type: string;
  tone: string;
  evo_instance_id: string | null;
  real_instance_id: string | null;
  is_active: boolean;
  phone_number: string | null;
  evolution_phone: string | null;
  connection_status: string | null;
  created_at: string;
  webhook_url: string | null;
}

interface RecentConversation {
  id: string;
  contact_name: string;
  contact_phone: string;
  last_message: string;
  last_message_time: string;
  status: 'active' | 'waiting' | 'closed';
  unread_count: number;
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
    activeChatbots: 0,
    todayMessages: 0,
    activeConversations: 0
  });
  
  const [chatbots, setChatbots] = useState<ChatbotConfig[]>([]);
  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>([]);
  const [loading, setLoading] = useState(false);

  // Função para formatar telefone brasileiro
  const formatPhoneBrazilian = (phone: string) => {
    if (!phone) return '';
    
    const numbers = phone.replace(/\D/g, '');
    
    if (numbers.length === 13 && numbers.startsWith('55')) {
      const ddd = numbers.substring(2, 4);
      const firstPart = numbers.substring(4, 9);
      const secondPart = numbers.substring(9, 13);
      return `+55 (${ddd}) ${firstPart}-${secondPart}`;
    }
    
    if (numbers.length === 11) {
      const ddd = numbers.substring(0, 2);
      const firstPart = numbers.substring(2, 7);
      const secondPart = numbers.substring(7, 11);
      return `+55 (${ddd}) ${firstPart}-${secondPart}`;
    }
    
    if (numbers.length === 10) {
      const ddd = numbers.substring(0, 2);
      const firstPart = numbers.substring(2, 6);
      const secondPart = numbers.substring(6, 10);
      return `+55 (${ddd}) ${firstPart}-${secondPart}`;
    }

    return phone;
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [contactsResult, messagesResult, chatsResult, chatbotsResult, todayMessagesResult] = await Promise.all([
        supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('messages').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('chats').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('chatbot_configs').select('*').eq('user_id', user.id),
        supabase.from('messages').select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00.000Z`)
      ]);

      const activeChats = await supabase
        .from('chats')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

      setStats({
        totalContacts: contactsResult.count || 0,
        totalMessages: messagesResult.count || 0,
        totalChats: chatsResult.count || 0,
        activeChatbots: chatbotsResult.data?.filter(bot => bot.is_active).length || 0,
        todayMessages: todayMessagesResult.count || 0,
        activeConversations: activeChats.count || 0
      });

      setChatbots(chatbotsResult.data || []);
      
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
    }
  };

  const fetchRecentConversations = async () => {
    if (!user) return;

    try {
      const { data: conversations } = await supabase
        .from('chats')
        .select(`
          id,
          status,
          last_message_at,
          unread_count,
          contact:contacts(name, phone),
          messages(content, created_at)
        `)
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false })
        .limit(5);

      if (conversations) {
        const formattedConversations: RecentConversation[] = conversations.map(conv => ({
          id: conv.id,
          contact_name: conv.contact?.name || 'Contato sem nome',
          contact_phone: conv.contact?.phone || '',
          last_message: conv.messages?.[0]?.content || 'Sem mensagens',
          last_message_time: conv.last_message_at || conv.messages?.[0]?.created_at || '',
          status: (conv.status as 'active' | 'waiting' | 'closed') || 'active',
          unread_count: conv.unread_count || 0
        }));
        
        setRecentConversations(formattedConversations);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchRecentConversations()
    ]);
    setLoading(false);
    
    toast({
      title: "Atualizado!",
      description: "Dados atualizados com informações reais da Evolution API.",
    });
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Agora';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
    return `${Math.floor(diffMinutes / 1440)}d`;
  };

  useEffect(() => {
    if (user && profile) {
      handleRefresh();
    }
  }, [user, profile]);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF914C] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Acesso Restrito</h3>
            <p className="text-gray-600 mb-4">Você precisa estar logado para acessar o dashboard.</p>
            <Button onClick={() => navigate('/auth')} className="w-full bg-[#FF914C] hover:bg-[#FF7A2B]">
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
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/0cf142c2-da7d-452c-a8d8-0413cfb6c023.png" 
                alt="Techcorps" 
                className="h-8 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-black">Dashboard</h1>
                <p className="text-sm text-gray-600">Bem-vindo, {profile?.name}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                onClick={handleRefresh} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              
              <Button 
                onClick={() => signOut()} 
                variant="outline" 
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Informações da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Informações da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm text-gray-600">Empresa:</span>
                <p className="font-semibold">{profile?.company}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Área:</span>
                <p className="font-semibold">{profile?.area}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <p className="font-semibold">{profile?.email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">WhatsApp:</span>
                <p className="font-semibold">{formatPhoneBrazilian(profile?.whatsapp || '')}</p>
              </div>
            </div>
            
            {/* Exibir dados da instância se disponíveis */}
            {(profile?.instance_id || profile?.instance_name) && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold text-gray-700 mb-2">Dados da Instância:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.instance_id && (
                    <div>
                      <span className="text-sm text-gray-600">Instance ID:</span>
                      <p className="font-mono text-sm bg-gray-100 p-1 rounded">{profile.instance_id}</p>
                    </div>
                  )}
                  {profile.instance_name && (
                    <div>
                      <span className="text-sm text-gray-600">Instance Name:</span>
                      <p className="font-mono text-sm bg-gray-100 p-1 rounded">{profile.instance_name}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status do WhatsApp - NOVO COMPONENTE CORRIGIDO */}
        <WhatsAppStatusSection 
          chatbots={chatbots}
          onRefresh={handleRefresh}
          loading={loading}
        />

        {/* Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contatos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#FF914C]">{stats.totalContacts}</div>
              <p className="text-xs text-muted-foreground">Total cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#FF914C]">{stats.totalMessages}</div>
              <p className="text-xs text-muted-foreground">Total enviadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoje</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.todayMessages}</div>
              <p className="text-xs text-muted-foreground">Mensagens hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversas</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#FF914C]">{stats.totalChats}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativas</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.activeConversations}</div>
              <p className="text-xs text-muted-foreground">Em andamento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chatbots</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#FF914C]">{stats.activeChatbots}</div>
              <p className="text-xs text-muted-foreference">Ativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Conversas Recentes e Ações Rápidas */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Conversas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentConversations.length > 0 ? (
                <div className="space-y-3">
                  {recentConversations.map((conv) => (
                    <div 
                      key={conv.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      onClick={() => navigate('/contacts')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#FF914C] rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{conv.contact_name}</h4>
                          <p className="text-xs text-gray-600 truncate">{conv.last_message}</p>
                          <p className="text-xs text-gray-500">{formatTime(conv.last_message_time)}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={`text-xs ${
                          conv.status === 'active' ? 'bg-green-100 text-green-800' :
                          conv.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {conv.status === 'active' ? 'Ativo' :
                           conv.status === 'waiting' ? 'Aguardando' : 'Finalizado'}
                        </Badge>
                        {conv.unread_count > 0 && (
                          <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-1 ml-auto">
                            {conv.unread_count}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma conversa ainda</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bot className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Configurações do Chatbot</h4>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Precisa fazer alterações no seu chatbot? Nossa equipe está pronta para ajudar!
                  </p>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => window.open('https://wa.me/5511933120908?text=Olá! Preciso de ajuda para configurar meu chatbot.', '_blank')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Falar com Suporte
                  </Button>
                </div>
                
                <Button 
                  onClick={() => navigate('/contacts')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Gerenciar Contatos ({stats.totalContacts})
                </Button>
                
                <Button 
                  onClick={() => navigate('/chats')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Ver Todas as Conversas
                </Button>
                
                <Button 
                  onClick={() => navigate('/clientes')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Gerenciar Clientes
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
