
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Users, 
  Clock, 
  CheckCircle, 
  BarChart3, 
  Settings, 
  LogOut,
  Bot,
  Phone,
  Calendar,
  TrendingUp,
  Activity,
  DollarSign,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats] = useState({
    totalMessages: 1247,
    activeChats: 23,
    responseTime: '1.2s',
    satisfaction: 94,
    conversions: 156,
    revenue: 28750
  });

  const [recentChats] = useState([
    { id: 1, name: 'Maria Silva', lastMessage: 'Obrigada pelo atendimento!', time: '2 min', status: 'online', avatar: 'MS' },
    { id: 2, name: 'João Santos', lastMessage: 'Qual o horário de funcionamento?', time: '5 min', status: 'waiting', avatar: 'JS' },
    { id: 3, name: 'Ana Costa', lastMessage: 'Gostaria de agendar uma consulta', time: '10 min', status: 'resolved', avatar: 'AC' },
    { id: 4, name: 'Pedro Lima', lastMessage: 'Vocês trabalham aos sábados?', time: '15 min', status: 'online', avatar: 'PL' },
    { id: 5, name: 'Carla Mendes', lastMessage: 'Preciso alterar meu agendamento', time: '22 min', status: 'waiting', avatar: 'CM' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'waiting': return 'bg-yellow-500';
      case 'resolved': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'waiting': return 'Aguardando';
      case 'resolved': return 'Resolvido';
      default: return 'Offline';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Bot className="h-8 w-8 text-black" />
                <div>
                  <h1 className="text-2xl font-bold text-black">IA Secretary</h1>
                  <p className="text-sm text-gray-600">Dashboard de Controle</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800 border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Sistema Online
              </Badge>
              
              <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/')}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Mensagens Hoje</CardTitle>
              <MessageSquare className="h-4 w-4 text-black" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{stats.totalMessages.toLocaleString()}</div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% vs ontem
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Chats Ativos</CardTitle>
              <Users className="h-4 w-4 text-black" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{stats.activeChats}</div>
              <p className="text-xs text-yellow-600">
                3 aguardando resposta
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tempo Resposta</CardTitle>
              <Clock className="h-4 w-4 text-black" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{stats.responseTime}</div>
              <p className="text-xs text-gray-500">
                Média das últimas 24h
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Satisfação</CardTitle>
              <CheckCircle className="h-4 w-4 text-black" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{stats.satisfaction}%</div>
              <p className="text-xs text-gray-500">
                156 avaliações
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Conversões</CardTitle>
              <Activity className="h-4 w-4 text-black" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{stats.conversions}</div>
              <p className="text-xs text-green-600">
                +8% esta semana
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Receita</CardTitle>
              <DollarSign className="h-4 w-4 text-black" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">R$ {stats.revenue.toLocaleString()}</div>
              <p className="text-xs text-green-600">
                +15% este mês
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Chats */}
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-black">
                <MessageSquare className="h-5 w-5 mr-2" />
                Conversas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentChats.map((chat) => (
                  <div key={chat.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                        {chat.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-black">{chat.name}</p>
                        <p className="text-sm text-gray-600 truncate max-w-xs">{chat.lastMessage}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">{chat.time}</p>
                      <Badge 
                        className={`${getStatusColor(chat.status)} text-white text-xs`}
                      >
                        {getStatusText(chat.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Button className="w-full bg-black text-white hover:bg-gray-800">
                  Ver Todas as Conversas
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & System Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-black">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-black text-white hover:bg-gray-800">
                  <Download className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Agendamentos
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar IA
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Suporte
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-black">Status do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">WhatsApp API</span>
                    <Badge className="bg-green-100 text-green-800 text-xs">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Servidor IA</span>
                    <Badge className="bg-green-100 text-green-800 text-xs">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Banco de Dados</span>
                    <Badge className="bg-green-100 text-green-800 text-xs">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Evolution API</span>
                    <Badge className="bg-green-100 text-green-800 text-xs">Conectado</Badge>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">Última atualização: há 2 min</p>
                  <Button size="sm" variant="outline" className="text-xs">
                    Verificar Status
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Performance Today */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-black">Performance Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Taxa de Resposta</span>
                      <span className="font-medium text-black">98%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-black h-2 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Satisfação Cliente</span>
                      <span className="font-medium text-black">94%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Conversões</span>
                      <span className="font-medium text-black">87%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
