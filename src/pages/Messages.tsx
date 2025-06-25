
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MessageCircle, Bot, User, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  message_type: string;
  status: string;
  created_at: string;
  contact: {
    name: string;
    phone: string;
  };
}

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      // Dados mock para demonstração
      setMessages([
        {
          id: '1',
          content: 'Olá! Gostaria de saber mais sobre seus serviços.',
          direction: 'inbound',
          message_type: 'text',
          status: 'delivered',
          created_at: new Date().toISOString(),
          contact: { name: 'Maria Silva', phone: '5511999999999' }
        },
        {
          id: '2',
          content: 'Olá Maria! Claro, ficarei feliz em ajudar. Trabalhamos com chatbots inteligentes para WhatsApp.',
          direction: 'outbound',
          message_type: 'text',
          status: 'sent',
          created_at: new Date(Date.now() - 300000).toISOString(),
          contact: { name: 'Maria Silva', phone: '5511999999999' }
        },
        {
          id: '3',
          content: 'Quais são os preços?',
          direction: 'inbound',
          message_type: 'text',
          status: 'delivered',
          created_at: new Date(Date.now() - 600000).toISOString(),
          contact: { name: 'João Santos', phone: '5511888888888' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.contact?.phone?.includes(searchTerm)
  );

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Agora';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF914C] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando mensagens...</p>
        </div>
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
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-8 w-8 text-[#FF914C]" />
                <h1 className="text-xl font-bold text-black">Todas as Mensagens</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Filtros */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar mensagens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-8 w-8 text-[#FF914C]" />
                <div>
                  <p className="text-2xl font-bold">{messages.length}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{messages.filter(m => m.direction === 'inbound').length}</p>
                  <p className="text-sm text-gray-600">Recebidas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bot className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{messages.filter(m => m.direction === 'outbound').length}</p>
                  <p className="text-sm text-gray-600">Enviadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {messages.filter(m => {
                      const today = new Date().toDateString();
                      const messageDate = new Date(m.created_at).toDateString();
                      return today === messageDate;
                    }).length}
                  </p>
                  <p className="text-sm text-gray-600">Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Mensagens */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Mensagens ({filteredMessages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredMessages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.direction === 'outbound'
                      ? 'bg-[#FF914C] text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      {message.direction === 'outbound' ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">
                        {message.direction === 'outbound' ? 'Chatbot' : message.contact?.name || 'Cliente'}
                      </span>
                      <Badge variant="outline" className={`text-xs ${
                        message.direction === 'outbound' 
                          ? 'border-orange-200 text-orange-100' 
                          : 'border-gray-300 text-gray-600'
                      }`}>
                        {message.contact?.phone}
                      </Badge>
                    </div>
                    
                    <p className="text-sm mb-2">{message.content}</p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className={
                        message.direction === 'outbound' 
                          ? 'text-orange-100' 
                          : 'text-gray-500'
                      }>
                        {formatTimestamp(message.created_at)}
                      </span>
                      
                      {message.direction === 'outbound' && (
                        <Badge variant="outline" className="border-orange-200 text-orange-100 text-xs">
                          {message.status === 'sent' ? '✓' : message.status === 'delivered' ? '✓✓' : '⏳'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredMessages.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Nenhuma mensagem encontrada
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Tente uma busca diferente' : 'As mensagens aparecerão aqui conforme chegarem'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Messages;
