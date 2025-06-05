import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogOut, MessageCircle, Settings, User, BarChart3, Calendar, Phone, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  name: string;
  company: string;
  area: string;
  whatsapp: string;
}

interface DashboardStats {
  totalMessages: number;
  activeConversations: number;
  responseTime: string;
  satisfaction: number;
  appointmentsToday: number;
  messagesTrend: number;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalMessages: 1247,
    activeConversations: 23,
    responseTime: '2.3s',
    satisfaction: 4.8,
    appointmentsToday: 8,
    messagesTrend: 15.2
  });

  const recentMessages = [
    {
      id: 1,
      customer: 'Maria Silva',
      message: 'Gostaria de agendar uma consulta',
      time: '10:30',
      status: 'responded'
    },
    {
      id: 2,
      customer: 'João Santos',
      message: 'Qual o valor da consulta?',
      time: '10:15',
      status: 'responded'
    },
    {
      id: 3,
      customer: 'Ana Costa',
      message: 'Preciso reagendar minha consulta',
      time: '09:45',
      status: 'pending'
    },
    {
      id: 4,
      customer: 'Pedro Lima',
      message: 'Obrigado pelo atendimento!',
      time: '09:30',
      status: 'closed'
    }
  ];

  const upcomingAppointments = [
    {
      id: 1,
      customer: 'Maria Silva',
      service: 'Consulta Médica',
      time: '14:00',
      phone: '(11) 99999-9999'
    },
    {
      id: 2,
      customer: 'Carlos Oliveira',
      service: 'Retorno',
      time: '15:30',
      phone: '(11) 88888-8888'
    },
    {
      id: 3,
      customer: 'Ana Santos',
      service: 'Exame',
      time: '16:00',
      phone: '(11) 77777-7777'
    }
  ];

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, company, area, whatsapp')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao fazer logout.",
        variant: "destructive",
      });
    }
  };

  const handleConfigureChatbot = () => {
    navigate('/chatbot-setup');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/0cf142c2-da7d-452c-a8d8-0413cfb6c023.png" 
                alt="Techcorps" 
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-bold text-black">Dashboard - IA Secretary</h1>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mensagens Hoje</p>
                  <p className="text-2xl font-bold">{stats.totalMessages}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{stats.messagesTrend}% vs ontem
                  </p>
                </div>
                <MessageCircle className="h-8 w-8 text-[#FF914C]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversas Ativas</p>
                  <p className="text-2xl font-bold">{stats.activeConversations}</p>
                  <p className="text-xs text-gray-500 mt-1">Em andamento agora</p>
                </div>
                <User className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tempo de Resposta</p>
                  <p className="text-2xl font-bold">{stats.responseTime}</p>
                  <p className="text-xs text-green-600 mt-1">Excelente performance</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Satisfação</p>
                  <p className="text-2xl font-bold">{stats.satisfaction}/5</p>
                  <p className="text-xs text-yellow-600 mt-1">⭐⭐⭐⭐⭐</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Meu Perfil</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-medium">{profile?.name || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Empresa</p>
                  <p className="font-medium">{profile?.company || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Área de Atuação</p>
                  <p className="font-medium">{profile?.area || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">WhatsApp</p>
                  <p className="font-medium">{profile?.whatsapp || 'Não informado'}</p>
                </div>
                <Button className="w-full" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Próximos Agendamentos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{appointment.customer}</p>
                        <p className="text-xs text-gray-600">{appointment.service}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{appointment.time}</p>
                        <p className="text-xs text-gray-600">{appointment.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Mensagens Recentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMessages.map((message) => (
                    <div key={message.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium">{message.customer}</p>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            message.status === 'responded' ? 'bg-green-100 text-green-800' :
                            message.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {message.status === 'responded' ? 'Respondido' :
                             message.status === 'pending' ? 'Pendente' : 'Finalizado'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{message.message}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{message.time}</p>
                        {message.status === 'pending' && (
                          <Button size="sm" className="mt-2 bg-[#FF914C] hover:bg-[#FF7A2B]">
                            Responder
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chatbot Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Status do Chatbot</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-green-800">Chatbot Ativo</p>
                      <p className="text-sm text-green-600">Funcionando perfeitamente • Última atividade: há 2 minutos</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleConfigureChatbot}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
