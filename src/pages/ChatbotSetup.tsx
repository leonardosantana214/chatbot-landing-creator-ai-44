
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Bot, Zap, Users, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ChatbotSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [chatbotConfig, setChatbotConfig] = useState({
    nome_da_IA: '',
    empresa: '',
    nicho: '',
    identidade: '',
    personalidade: 'Profissional e amigável',
    objetivo: '',
    regras: '',
    fluxo: '',
    funcionalidades: [] as string[],
    nome_instancia: ''
  });

  const userData = location.state?.userData;
  const paymentConfirmed = location.state?.paymentConfirmed;

  useEffect(() => {
    if (!userData || !paymentConfirmed) {
      navigate('/payment');
      return;
    }

    // Preencher dados automáticos baseados nos dados do usuário
    setChatbotConfig(prev => ({
      ...prev,
      empresa: userData.company || '',
      nicho: userData.area || '',
      nome_instancia: `bot_${userData.company?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'empresa'}_${Date.now()}`
    }));
  }, [userData, paymentConfirmed, navigate]);

  const personalidadeOptions = [
    'Profissional e amigável',
    'Casual e descontraída',
    'Formal e educada',
    'Enérgica e motivadora',
    'Calma e paciente'
  ];

  const funcionalidadesOptions = [
    'Agendamento de consultas',
    'Informações sobre produtos',
    'Suporte técnico',
    'Vendas e orçamentos',
    'FAQ automatizado',
    'Coleta de dados',
    'Encaminhamento para humano'
  ];

  const handleInputChange = (field: string, value: string) => {
    setChatbotConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleFuncionalidadeToggle = (funcionalidade: string) => {
    setChatbotConfig(prev => ({
      ...prev,
      funcionalidades: prev.funcionalidades.includes(funcionalidade)
        ? prev.funcionalidades.filter(f => f !== funcionalidade)
        : [...prev.funcionalidades, funcionalidade]
    }));
  };

  const handleSubmit = async () => {
    if (!chatbotConfig.nome_da_IA || !chatbotConfig.identidade || !chatbotConfig.objetivo) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Configuração salva!",
      description: "Agora vamos conectar seu WhatsApp.",
    });

    // Enviar dados para o webhook
    try {
      const webhookData = {
        ...userData,
        ...chatbotConfig,
        webhook_url: `https://leowebhook.techcorps.com.br/webhook/${chatbotConfig.nome_instancia}`
      };

      await fetch('https://leowebhook.techcorps.com.br/webhook/receber-formulario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      console.log('Dados enviados para webhook:', webhookData);
    } catch (error) {
      console.error('Erro ao enviar para webhook:', error);
    }

    // Ir para integração WhatsApp
    navigate('/whatsapp-integration', {
      state: {
        userData,
        chatbotConfig,
        instanceName: chatbotConfig.nome_instancia
      }
    });
  };

  if (!userData || !paymentConfirmed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/payment')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/0cf142c2-da7d-452c-a8d8-0413cfb6c023.png" 
                  alt="Techcorps" 
                  className="h-8 w-auto"
                />
                <h1 className="text-xl font-bold text-black">Configuração do Chatbot</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Configure sua IA Personalizada
            </h2>
            <p className="text-gray-600">
              Vamos criar um chatbot único para {userData.company}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="h-5 w-5" />
                  <span>Identidade da IA</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nome_ia">Nome da IA *</Label>
                  <Input
                    id="nome_ia"
                    placeholder="Ex: Assistente Virtual Maria"
                    value={chatbotConfig.nome_da_IA}
                    onChange={(e) => handleInputChange('nome_da_IA', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="empresa">Empresa</Label>
                  <Input
                    id="empresa"
                    value={chatbotConfig.empresa}
                    onChange={(e) => handleInputChange('empresa', e.target.value)}
                    disabled
                  />
                </div>

                <div>
                  <Label htmlFor="nicho">Área de Atuação</Label>
                  <Input
                    id="nicho"
                    value={chatbotConfig.nicho}
                    onChange={(e) => handleInputChange('nicho', e.target.value)}
                    disabled
                  />
                </div>

                <div>
                  <Label htmlFor="identidade">Identidade da IA *</Label>
                  <Textarea
                    id="identidade"
                    placeholder="Ex: Sou a assistente virtual da Clínica ABC, especializada em agendar consultas e esclarecer dúvidas sobre nossos serviços."
                    value={chatbotConfig.identidade}
                    onChange={(e) => handleInputChange('identidade', e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="personalidade">Personalidade</Label>
                  <Select value={chatbotConfig.personalidade} onValueChange={(value) => handleInputChange('personalidade', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {personalidadeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Configurações Avançadas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="objetivo">Objetivo Principal *</Label>
                  <Textarea
                    id="objetivo"
                    placeholder="Ex: Agendar consultas, fornecer informações sobre tratamentos e capturar leads qualificados."
                    value={chatbotConfig.objetivo}
                    onChange={(e) => handleInputChange('objetivo', e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="regras">Regras de Atendimento</Label>
                  <Textarea
                    id="regras"
                    placeholder="Ex: Sempre ser educado, não fornecer diagnósticos médicos, sempre confirmar agendamentos."
                    value={chatbotConfig.regras}
                    onChange={(e) => handleInputChange('regras', e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="fluxo">Fluxo de Conversa</Label>
                  <Textarea
                    id="fluxo"
                    placeholder="Ex: Saudação → Identificar necessidade → Agendar ou informar → Finalizar"
                    value={chatbotConfig.fluxo}
                    onChange={(e) => handleInputChange('fluxo', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Funcionalidades</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {funcionalidadesOptions.map((funcionalidade) => (
                    <div
                      key={funcionalidade}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        chatbotConfig.funcionalidades.includes(funcionalidade)
                          ? 'border-[#FF914C] bg-orange-50'
                          : 'border-gray-200 hover:border-[#FF914C]'
                      }`}
                      onClick={() => handleFuncionalidadeToggle(funcionalidade)}
                    >
                      <span className="text-sm font-medium">{funcionalidade}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Button 
              onClick={handleSubmit}
              className="bg-[#FF914C] hover:bg-[#FF7A2B] text-white px-8 py-3"
              size="lg"
            >
              Configurar Chatbot e Conectar WhatsApp
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatbotSetup;
