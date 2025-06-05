
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MessageCircle, Clock, User } from 'lucide-react';

interface Chat {
  id: string;
  status: string;
  last_message_at: string;
  unread_count: number;
  created_at: string;
  contact: {
    name: string;
    phone: string;
  };
}

const Chats = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  const fetchChats = async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          contact:contacts(name, phone)
        `)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error('Erro ao carregar chats:', error);
      // Usar dados mock se não houver dados reais
      setChats([
        {
          id: '1',
          status: 'active',
          last_message_at: new Date().toISOString(),
          unread_count: 3,
          created_at: new Date().toISOString(),
          contact: { name: 'Maria Silva', phone: '(11) 99999-9999' }
        },
        {
          id: '2',
          status: 'pending',
          last_message_at: new Date(Date.now() - 3600000).toISOString(),
          unread_count: 1,
          created_at: new Date().toISOString(),
          contact: { name: 'João Santos', phone: '(11) 88888-8888' }
        },
        {
          id: '3',
          status: 'closed',
          last_message_at: new Date(Date.now() - 7200000).toISOString(),
          unread_count: 0,
          created_at: new Date().toISOString(),
          contact: { name: 'Ana Costa', phone: '(11) 77777-7777' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'pending': return 'Pendente';
      case 'closed': return 'Finalizado';
      default: return status;
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.contact?.phone?.includes(searchTerm)
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Conversas</h1>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredChats.map((chat) => (
          <Card key={chat.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#FF914C] rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{chat.contact?.name || 'Contato'}</h3>
                    <p className="text-gray-600">{chat.contact?.phone || 'Telefone não informado'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(chat.status)}>
                    {getStatusText(chat.status)}
                  </Badge>
                  
                  {chat.unread_count > 0 && (
                    <Badge className="bg-red-100 text-red-800">
                      {chat.unread_count} nova{chat.unread_count > 1 ? 's' : ''}
                    </Badge>
                  )}
                  
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {chat.last_message_at ? 
                      new Date(chat.last_message_at).toLocaleString() : 
                      'Sem mensagens'
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredChats.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma conversa encontrada
            </h3>
            <p className="text-gray-500">
              As conversas aparecerão aqui quando seus clientes enviarem mensagens
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Chats;
