
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Contacts from '../pages/Contacts';
import Chats from '../pages/Chats';
import Messages from '../pages/Messages';
import { Users, MessageCircle, MessageSquare } from 'lucide-react';

const DashboardTabs = () => {
  return (
    <div className="w-full">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Contatos
          </TabsTrigger>
          <TabsTrigger value="chats" className="flex items-center">
            <MessageCircle className="h-4 w-4 mr-2" />
            Conversas
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Mensagens
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="text-center py-8">
            <p className="text-gray-600">
              Use as abas acima para navegar entre as diferentes seções do dashboard.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="contacts" className="mt-6">
          <Contacts />
        </TabsContent>
        
        <TabsContent value="chats" className="mt-6">
          <Chats />
        </TabsContent>
        
        <TabsContent value="messages" className="mt-6">
          <Messages />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardTabs;
