
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Calendar, Clock, User, Plus, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Consulta {
  id: number;
  created_at: string;
  profissional: string;
  protocolo: string;
  horario: string;
  tipo_atendimento: string;
  nome_cliente: string;
  telefone: string;
  email: string | null;
  id_evento: string | null;
  updated_at: string;
}

interface Cliente {
  id: number;
  user_nome: string;
  telefone: string;
  email: string | null;
}

const Consultas = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newConsulta, setNewConsulta] = useState({
    profissional: '',
    horario: '',
    tipo_atendimento: '',
    telefone: '',
    nome_cliente: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      fetchConsultas();
      fetchClientes();
    }
  }, [user]);

  const fetchConsultas = async () => {
    try {
      const { data, error } = await supabase
        .from('consulta')
        .select('*')
        .order('horario', { ascending: false });

      if (error) throw error;
      setConsultas(data || []);
    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
      toast({
        title: "Erro ao carregar consultas",
        description: "Não foi possível carregar a lista de consultas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, user_nome, telefone, email');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const handleClienteSelect = (telefone: string) => {
    const cliente = clientes.find(c => c.telefone === telefone);
    if (cliente) {
      setNewConsulta({
        ...newConsulta,
        telefone: cliente.telefone,
        nome_cliente: cliente.user_nome,
        email: cliente.email || ''
      });
    }
  };

  const generateProtocolo = () => {
    return `PROT-${Date.now()}`;
  };

  const handleCreateConsulta = async () => {
    if (!newConsulta.horario || !newConsulta.tipo_atendimento || !newConsulta.telefone) {
      toast({
        title: "Campos obrigatórios",
        description: "Horário, tipo de atendimento e telefone são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const protocolo = generateProtocolo();
      
      const { error } = await supabase
        .from('consulta')
        .insert([{
          user_id: user?.id,
          profissional: newConsulta.profissional || 'Não especificado',
          protocolo: protocolo,
          horario: newConsulta.horario,
          tipo_atendimento: newConsulta.tipo_atendimento,
          nome_cliente: newConsulta.nome_cliente,
          telefone: newConsulta.telefone,
          email: newConsulta.email || null
        }]);

      if (error) throw error;

      toast({
        title: "Consulta agendada",
        description: `Consulta agendada com protocolo ${protocolo}`,
      });

      setNewConsulta({
        profissional: '',
        horario: '',
        tipo_atendimento: '',
        telefone: '',
        nome_cliente: '',
        email: ''
      });
      setIsDialogOpen(false);
      fetchConsultas();
    } catch (error) {
      console.error('Erro ao criar consulta:', error);
      toast({
        title: "Erro ao agendar consulta",
        description: "Não foi possível agendar a consulta. Verifique se o cliente está cadastrado.",
        variant: "destructive",
      });
    }
  };

  const filteredConsultas = consultas.filter(consulta =>
    consulta.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consulta.protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consulta.tipo_atendimento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consulta.telefone.includes(searchTerm)
  );

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
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
        <h1 className="text-3xl font-bold">Consultas</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#FF914C] hover:bg-[#FF7A2B]">
              <Plus className="h-4 w-4 mr-2" />
              Nova Consulta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Agendar Nova Consulta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cliente">Cliente *</Label>
                <Select onValueChange={handleClienteSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.telefone}>
                        {cliente.user_nome} - {cliente.telefone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="horario">Data e Hora *</Label>
                <Input
                  id="horario"
                  type="datetime-local"
                  value={newConsulta.horario}
                  onChange={(e) => setNewConsulta({...newConsulta, horario: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="tipo">Tipo de Atendimento *</Label>
                <Input
                  id="tipo"
                  value={newConsulta.tipo_atendimento}
                  onChange={(e) => setNewConsulta({...newConsulta, tipo_atendimento: e.target.value})}
                  placeholder="Ex: Limpeza de pele, Consulta médica"
                />
              </div>
              
              <div>
                <Label htmlFor="profissional">Profissional</Label>
                <Input
                  id="profissional"
                  value={newConsulta.profissional}
                  onChange={(e) => setNewConsulta({...newConsulta, profissional: e.target.value})}
                  placeholder="Nome do profissional"
                />
              </div>
              
              <Button onClick={handleCreateConsulta} className="w-full bg-[#FF914C] hover:bg-[#FF7A2B]">
                Agendar Consulta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar consultas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredConsultas.map((consulta) => (
          <Card key={consulta.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#FF914C] rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{consulta.nome_cliente}</h3>
                      <Badge variant="outline">{consulta.protocolo}</Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDateTime(consulta.horario)}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {consulta.telefone}
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        {consulta.profissional}
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Badge className="bg-blue-100 text-blue-800">
                        {consulta.tipo_atendimento}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredConsultas.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma consulta encontrada
            </h3>
            <p className="text-gray-500">
              Agende suas primeiras consultas para começar
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Consultas;
