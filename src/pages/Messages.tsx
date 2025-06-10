
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MessageCircle, Clock, Phone, Bot, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Mensagem {
  id: number;
  telefone: string;
  message_type: string;
  user_message: string;
  bot_message: string;
  ativo: boolean;
  created_at: string;
}

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMensagem, setSelectedMensagem] = useState<Mensagem | null>(null);

  useEffect(() => {
    if (user) {
      fetchMensagens();
    }
  }, [user]);

  const fetchMensagens = async () => {
    try {
      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMensagens(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Não foi possível carregar as mensagens do chatbot.",
        variant: "destructive",
      });
      
      // Dados mock para demonstração
      setMensagens([
        {
          id: 1,
          telefone: '5511933120908',
          message_type: 'text',
          user_message: 'Ola tudo bem?? É salão??',
          bot_message: 'Olá, seja muito bem-vindo(a) ao Salão de Beleza Floratta 💇✨! Somos especializados em cuidar de você com carinho e excelência.',
          ativo: false,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          telefone: '5511941179868',
          message_type: 'text',
          user_message: 'Terça às 20h',
          bot_message: '🎉 Agendamento Confirmado, Ivan! 💖',
          ativo: false,
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMensagens = mensagens.filter(mensagem =>
    mensagem.telefone.includes(searchTerm) ||
    mensagem.user_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mensagem.bot_message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPhone = (phone: string) => {
    if (phone.length === 13 && phone.startsWith('55')) {
      return `+${phone.slice(0, 2)} (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}`;
    }
    return phone;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mensagens do Chatbot</h1>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por telefone ou conteúdo da mensagem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lista de Mensagens */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Conversas ({filteredMensagens.length})</h2>
          {filteredMensagens.map((mensagem) => (
            <Card 
              key={mensagem.id} 
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                selectedMensagem?.id === mensagem.id ? 'border-[#FF914C] border-2' : ''
              }`}
              onClick={() => setSelectedMensagem(mensagem)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#FF914C] rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{formatPhone(mensagem.telefone)}</h3>
                      <div className="flex items-center text-gray-500 text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimestamp(mensagem.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge variant={mensagem.ativo ? "default" : "secondary"}>
                      {mensagem.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge variant="outline">
                      {mensagem.message_type}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="bg-gray-50 p-2 rounded text-sm">
                    <div className="flex items-center mb-1">
                      <User className="h-3 w-3 mr-1 text-blue-600" />
                      <span className="text-blue-600 font-medium">Cliente:</span>
                    </div>
                    <p className="text-gray-700 truncate">{mensagem.user_message}</p>
                  </div>
                  
                  <div className="bg-orange-50 p-2 rounded text-sm">
                    <div className="flex items-center mb-1">
                      <Bot className="h-3 w-3 mr-1 text-[#FF914C]" />
                      <span className="text-[#FF914C] font-medium">Bot:</span>
                    </div>
                    <p className="text-gray-700 truncate">{mensagem.bot_message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredMensagens.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Nenhuma mensagem encontrada
                </h3>
                <p className="text-gray-500">
                  As mensagens do chatbot aparecerão aqui
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Conversa Detalhada */}
        <div>
          {selectedMensagem ? (
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Conversa com {formatPhone(selectedMensagem.telefone)}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant={selectedMensagem.ativo ? "default" : "secondary"}>
                    {selectedMensagem.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <Badge variant="outline">
                    {selectedMensagem.message_type}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {formatTimestamp(selectedMensagem.created_at)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mensagem do Cliente */}
                  <div className="flex justify-start">
                    <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100 text-gray-800">
                      <div className="flex items-center mb-1">
                        <User className="h-3 w-3 mr-1 text-blue-600" />
                        <span className="text-blue-600 font-medium text-xs">Cliente</span>
                      </div>
                      <p className="text-sm">{selectedMensagem.user_message}</p>
                    </div>
                  </div>

                  {/* Resposta do Bot */}
                  <div className="flex justify-end">
                    <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-[#FF914C] text-white">
                      <div className="flex items-center mb-1">
                        <Bot className="h-3 w-3 mr-1 text-orange-100" />
                        <span className="text-orange-100 font-medium text-xs">Bot Floratta</span>
                      </div>
                      <p className="text-sm">{selectedMensagem.bot_message}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Selecione uma conversa
                </h3>
                <p className="text-gray-500">
                  Clique em uma mensagem à esquerda para ver os detalhes
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
