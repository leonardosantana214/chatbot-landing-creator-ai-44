
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Contacts from '../pages/Contacts';
import { Users, BarChart3 } from 'lucide-react';

const DashboardTabs = () => {
  return (
    <div className="w-full">
      <Tabs defaultValue="contacts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Contatos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="text-center py-8">
            <p className="text-gray-600">
              Use a aba "Contatos" para ver todas as conversas e interações com clientes.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="contacts" className="mt-6">
          <Contacts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardTabs;
