
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogOut, MessageCircle, Settings, User, BarChart3, Calendar, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DashboardTabs from '../components/DashboardTabs';

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
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalMessages: 1247,
    activeConversations: 23,
    responseTime: '2.3s',
    satisfaction: 4.8,
    appointmentsToday: 8,
    messagesTrend: 15.2
  });

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
              <h1 className="text-xl font-bold text-black">Dashboard - Techcorps</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/company-info')}
              >
                Sobre a Empresa
              </Button>
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

        {/* Chatbot Status */}
        <Card className="mb-8">
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

        {/* Dashboard Tabs */}
        <DashboardTabs />
      </main>
    </div>
  );
};

export default Dashboard;
