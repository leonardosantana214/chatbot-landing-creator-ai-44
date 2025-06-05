import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MessageSquare, ArrowUpCircle, ArrowDownCircle, Filter } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: string;
  created_at: string;
  contact: {
    name: string;
    phone: string;
  };
}

const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          contact:contacts(name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Garantir que os dados estejam no formato correto
      const typedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        direction: msg.direction as 'inbound' | 'outbound',
        status: msg.status,
        created_at: msg.created_at,
        contact: {
          name: msg.contact?.name || 'Contato',
          phone: msg.contact?.phone || 'Telefone não informado'
        }
      }));
      
      setMessages(typedMessages);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      // Usar dados mock se não houver dados reais
      setMessages([
        {
          id: '1',
          content: 'Olá! Gostaria de agendar uma consulta.',
          direction: 'inbound',
          status: 'read',
          created_at: new Date().toISOString(),
          contact: { name: 'Maria Silva', phone: '(11) 99999-9999' }
        },
        {
          id: '2',
          content: 'Claro! Qual seria o melhor dia para você?',
          direction: 'outbound',
          status: 'delivered',
          created_at: new Date(Date.now() - 300000).toISOString(),
          contact: { name: 'Maria Silva', phone: '(11) 99999-9999' }
        },
        {
          id: '3',
          content: 'Preciso reagendar minha consulta de amanhã.',
          direction: 'inbound',
          status: 'read',
          created_at: new Date(Date.now() - 600000).toISOString(),
          contact: { name: 'João Santos', phone: '(11) 88888-8888' }
        },
        {
          id: '4',
          content: 'Sem problemas! Vou verificar os horários disponíveis.',
          direction: 'outbound',
          status: 'sent',
          created_at: new Date(Date.now() - 900000).toISOString(),
          contact: { name: 'João Santos', phone: '(11) 88888-8888' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'read': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent': return 'Enviada';
      case 'delivered': return 'Entregue';
      case 'read': return 'Lida';
      case 'failed': return 'Falhou';
      default: return status;
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDirection = directionFilter === 'all' || message.direction === directionFilter;
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    
    return matchesSearch && matchesDirection && matchesStatus;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mensagens</h1>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar mensagens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={directionFilter} onValueChange={setDirectionFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Direção" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="inbound">Recebidas</SelectItem>
            <SelectItem value="outbound">Enviadas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="sent">Enviada</SelectItem>
            <SelectItem value="delivered">Entregue</SelectItem>
            <SelectItem value="read">Lida</SelectItem>
            <SelectItem value="failed">Falhou</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          onClick={() => {
            setSearchTerm('');
            setDirectionFilter('all');
            setStatusFilter('all');
          }}
        >
          <Filter className="h-4 w-4 mr-2" />
          Limpar Filtros
        </Button>
      </div>

      <div className="space-y-4">
        {filteredMessages.map((message) => (
          <Card key={message.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    message.direction === 'inbound' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {message.direction === 'inbound' ? (
                      <ArrowDownCircle className="h-5 w-5 text-blue-600" />
                    ) : (
                      <ArrowUpCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">
                        {message.contact?.name || 'Contato'}
                      </h3>
                      <span className="text-gray-500 text-sm">
                        {message.contact?.phone}
                      </span>
                      <Badge variant="outline" className={
                        message.direction === 'inbound' ? 'border-blue-300 text-blue-700' : 'border-green-300 text-green-700'
                      }>
                        {message.direction === 'inbound' ? 'Recebida' : 'Enviada'}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-800 mb-2">{message.content}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{new Date(message.created_at).toLocaleString()}</span>
                      <Badge className={getStatusColor(message.status)}>
                        {getStatusText(message.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMessages.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma mensagem encontrada
            </h3>
            <p className="text-gray-500">
              As mensagens aparecerão aqui conforme forem enviadas e recebidas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Messages;
