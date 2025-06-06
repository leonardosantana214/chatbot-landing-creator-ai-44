
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Phone, MessageSquare, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  created_at: string;
  last_interaction?: string;
  messages: Tables<'messages'>[];
}

const Contacts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    if (user) {
      fetchContactsWithMessages();
    }
  }, [user]);

  const fetchContactsWithMessages = async () => {
    try {
      // Buscar contatos
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (contactsError) throw contactsError;

      // Buscar mensagens para cada contato
      const contactsWithMessages = await Promise.all(
        (contactsData || []).map(async (contact) => {
          const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('contact_id', contact.id)
            .order('created_at', { ascending: false })
            .limit(50);

          if (messagesError) {
            console.error('Erro ao buscar mensagens:', messagesError);
          }

          return {
            ...contact,
            messages: messagesData || []
          };
        })
      );

      setContacts(contactsWithMessages);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      toast({
        title: "Erro ao carregar contatos",
        description: "Não foi possível carregar os contatos e mensagens.",
        variant: "destructive",
      });
      
      // Dados mock para demonstração
      setContacts([
        {
          id: '1',
          name: 'Maria Silva',
          phone: '5511999999999',
          email: 'maria@email.com',
          created_at: new Date().toISOString(),
          last_interaction: new Date().toISOString(),
          messages: []
        },
        {
          id: '2',
          name: 'João Santos',
          phone: '5511888888888',
          created_at: new Date().toISOString(),
          last_interaction: new Date(Date.now() - 3600000).toISOString(),
          messages: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
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

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Contatos e Conversas</h1>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar contatos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lista de Contatos */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Contatos ({filteredContacts.length})</h2>
          {filteredContacts.map((contact) => {
            const lastMessage = contact.messages[0];
            return (
              <Card 
                key={contact.id} 
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  selectedContact?.id === contact.id ? 'border-[#FF914C] border-2' : ''
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-[#FF914C] rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{contact.name}</h3>
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <Phone className="h-4 w-4 mr-1" />
                          {contact.phone}
                        </div>
                        {lastMessage && (
                          <div className="text-sm text-gray-700">
                            <p className="truncate">
                              {lastMessage.direction === 'inbound' ? '👤 ' : '🤖 '}
                              {lastMessage.content}
                            </p>
                            <div className="flex items-center text-gray-500 text-xs mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimestamp(lastMessage.created_at)}
                            </div>
                          </div>
                        )}
                        {contact.messages.length > 0 && (
                          <div className="flex items-center mt-2">
                            <MessageSquare className="h-4 w-4 mr-1 text-blue-500" />
                            <span className="text-sm text-blue-600">
                              {contact.messages.length} mensagem{contact.messages.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredContacts.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Nenhum contato encontrado
                </h3>
                <p className="text-gray-500">
                  Os contatos aparecerão aqui quando receberem mensagens
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Conversa Selecionada */}
        <div>
          {selectedContact ? (
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Conversa com {selectedContact.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {selectedContact.messages.length > 0 ? (
                    selectedContact.messages.slice().reverse().map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.direction === 'outbound'
                              ? 'bg-[#FF914C] text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.direction === 'outbound' ? 'text-orange-100' : 'text-gray-500'
                          }`}>
                            {formatTimestamp(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      Nenhuma mensagem ainda
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Selecione um contato
                </h3>
                <p className="text-gray-500">
                  Clique em um contato à esquerda para ver a conversa
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contacts;
