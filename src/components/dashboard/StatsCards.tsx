
import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageSquare, Calendar } from 'lucide-react';

interface DashboardStats {
  totalContacts: number;
  totalMessages: number;
  totalConsultas: number;
  activeChats: number;
}

interface StatsCardsProps {
  stats: DashboardStats;
}

const StatsCards = ({ stats }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 text-center">
          <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <h3 className="text-xl font-bold">{stats.totalContacts}</h3>
          <p className="text-xs text-gray-600">Contatos</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <MessageSquare className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <h3 className="text-xl font-bold">{stats.totalMessages}</h3>
          <p className="text-xs text-gray-600">Mensagens</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <Calendar className="h-6 w-6 text-purple-500 mx-auto mb-2" />
          <h3 className="text-xl font-bold">{stats.totalConsultas}</h3>
          <p className="text-xs text-gray-600">Consultas</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <MessageSquare className="h-6 w-6 text-orange-500 mx-auto mb-2" />
          <h3 className="text-xl font-bold">{stats.activeChats}</h3>
          <p className="text-xs text-gray-600">Chats Ativos</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
