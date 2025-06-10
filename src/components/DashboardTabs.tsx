
import { MessageSquare, BarChart3, Users, Settings, Calendar, UserCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Chats from '../pages/Chats';
import Contacts from '../pages/Contacts';
import Messages from '../pages/Messages';
import Clientes from '../pages/Clientes';
import Consultas from '../pages/Consultas';

const DashboardTabs = () => {
  return (
    <Tabs defaultValue="chats" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="chats" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Conversas
        </TabsTrigger>
        <TabsTrigger value="contacts" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Contatos
        </TabsTrigger>
        <TabsTrigger value="clientes" className="flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          Clientes
        </TabsTrigger>
        <TabsTrigger value="consultas" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Consultas
        </TabsTrigger>
        <TabsTrigger value="messages" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Relatórios
        </TabsTrigger>
      </TabsList>

      <TabsContent value="chats" className="mt-6">
        <Chats />
      </TabsContent>

      <TabsContent value="contacts" className="mt-6">
        <Contacts />
      </TabsContent>

      <TabsContent value="clientes" className="mt-6">
        <Clientes />
      </TabsContent>

      <TabsContent value="consultas" className="mt-6">
        <Consultas />
      </TabsContent>

      <TabsContent value="messages" className="mt-6">
        <Messages />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
