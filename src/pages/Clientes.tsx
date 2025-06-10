
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Phone, Mail, User, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Cliente {
  id: number;
  user_nome: string;
  email: string | null;
  telefone: string;
  created_at: string;
  updated_at: string;
}

const Clientes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCliente, setNewCliente] = useState({
    user_nome: '',
    email: '',
    telefone: ''
  });

  useEffect(() => {
    if (user) {
      fetchClientes();
    }
  }, [user]);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar a lista de clientes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCliente = async () => {
    if (!newCliente.user_nome || !newCliente.telefone) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e telefone são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('clientes')
        .insert([{
          user_id: user?.id,
          user_nome: newCliente.user_nome,
          email: newCliente.email || null,
          telefone: newCliente.telefone
        }]);

      if (error) throw error;

      toast({
        title: "Cliente cadastrado",
        description: "Cliente foi cadastrado com sucesso.",
      });

      setNewCliente({ user_nome: '', email: '', telefone: '' });
      setIsDialogOpen(false);
      fetchClientes();
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      toast({
        title: "Erro ao cadastrar cliente",
        description: "Não foi possível cadastrar o cliente.",
        variant: "destructive",
      });
    }
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.user_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone.includes(searchTerm) ||
    (cliente.email && cliente.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#FF914C] hover:bg-[#FF7A2B]">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={newCliente.user_nome}
                  onChange={(e) => setNewCliente({...newCliente, user_nome: e.target.value})}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={newCliente.telefone}
                  onChange={(e) => setNewCliente({...newCliente, telefone: e.target.value})}
                  placeholder="5511999999999"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCliente.email}
                  onChange={(e) => setNewCliente({...newCliente, email: e.target.value})}
                  placeholder="cliente@email.com"
                />
              </div>
              <Button onClick={handleCreateCliente} className="w-full bg-[#FF914C] hover:bg-[#FF7A2B]">
                Cadastrar Cliente
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredClientes.map((cliente) => (
          <Card key={cliente.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#FF914C] rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{cliente.user_nome}</h3>
                    <div className="flex items-center text-gray-600 text-sm mb-1">
                      <Phone className="h-4 w-4 mr-1" />
                      {cliente.telefone}
                    </div>
                    {cliente.email && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <Mail className="h-4 w-4 mr-1" />
                        {cliente.email}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Cadastrado em: {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClientes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhum cliente encontrado
            </h3>
            <p className="text-gray-500">
              Cadastre seus primeiros clientes para começar
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Clientes;
