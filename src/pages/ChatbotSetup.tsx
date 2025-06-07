import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Bot, CheckCircle, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useN8nWebhook } from '@/hooks/useN8nWebhook';

interface ChatbotConfig {
  nome_da_IA: string;
  empresa: string;
  nicho: string;
  identidade: string;
  personalidade: string;
  objetivo: string;
  regras: string;
  fluxo: string;
  funcionalidades: string[];
  nome_instancia: string;
}

const ChatbotSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { sendToWebhook, sendInstanceData } = useN8nWebhook();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Verificar se o pagamento foi confirmado
  const paymentConfirmed = location.state?.paymentConfirmed || false;
  
  const [config, setConfig] = useState<ChatbotConfig>({
    nome_da_IA: '',
    empresa: '',
    nicho: '',
    identidade: 'Secretária virtual',
    personalidade: '',
    objetivo: '',
    regras: '',
    fluxo: '',
    funcionalidades: [],
    nome_instancia: ''
  });

  // Gerar nome da instância automaticamente (sem espaços)
  useEffect(() => {
    if (config.nome_da_IA && config.empresa) {
      const nomeInstancia = `${config.nome_da_IA}-${config.empresa}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      setConfig(prev => ({ ...prev, nome_instancia: nomeInstancia }));
    }
  }, [config.nome_da_IA, config.empresa]);

  useEffect(() => {
    if (!paymentConfirmed) {
      toast({
        title: "Pagamento necessário",
        description: "Você precisa confirmar o pagamento antes de criar sua conta.",
        variant: "destructive",
      });
      navigate('/pricing-selection');
    }
  }, [paymentConfirmed, navigate, toast]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    if (!paymentConfirmed) {
      toast({
        title: "Erro",
        description: "Pagamento não confirmado.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Enviar dados para o webhook usando o novo formato
      await sendInstanceData(config.nome_instancia, config);

      toast({
        title: "Chatbot criado com sucesso!",
        description: `Instância "${config.nome_instancia}" criada! Prosseguindo para integração WhatsApp...`,
      });
      
      setTimeout(() => {
        navigate('/whatsapp-integration', {
          state: {
            instanceName: config.nome_instancia,
            chatbotData: config
          }
        });
      }, 2000);
    } catch (error) {
      console.error('Erro ao criar chatbot:', error);
      toast({
        title: "Chatbot criado!",
        description: "Prosseguindo para integração WhatsApp...",
      });
      navigate('/whatsapp-integration', {
        state: {
          instanceName: config.nome_instancia,
          chatbotData: config
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (!paymentConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Pagamento Necessário</h3>
            <p className="text-gray-600 mb-4">
              Você precisa confirmar o pagamento antes de acessar esta área.
            </p>
            <Button onClick={() => navigate('/pricing-selection')}>
              Voltar aos Planos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="nome_da_IA">Nome da sua IA</Label>
              <Input
                id="nome_da_IA"
                value={config.nome_da_IA}
                onChange={(e) => setConfig({ ...config, nome_da_IA: e.target.value })}
                placeholder="Ex: Assistente Nina, Agatha, Sofia"
                required
              />
            </div>

            <div>
              <Label htmlFor="empresa">Nome da empresa</Label>
              <Input
                id="empresa"
                value={config.empresa}
                onChange={(e) => setConfig({ ...config, empresa: e.target.value })}
                placeholder="Ex: Clínica São Paulo, TechCorps"
                required
              />
            </div>

            {config.nome_instancia && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-blue-800">Nome da Instância (Gerado Automaticamente)</Label>
                <p className="text-blue-700 font-mono text-sm mt-1">{config.nome_instancia}</p>
                <p className="text-xs text-blue-600 mt-1">
                  Este será o identificador único da sua IA no WhatsApp
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="nicho">Nicho/Área de atuação</Label>
              <Select onValueChange={(value) => setConfig({ ...config, nicho: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua área de atuação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clinica">Clínica Médica</SelectItem>
                  <SelectItem value="estetica">Estética</SelectItem>
                  <SelectItem value="advocacia">Advocacia</SelectItem>
                  <SelectItem value="consultoria">Consultoria</SelectItem>
                  <SelectItem value="restaurante">Restaurante</SelectItem>
                  <SelectItem value="loja">Loja/E-commerce</SelectItem>
                  <SelectItem value="servicos">Prestação de Serviços</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="personalidade">Personalidade da IA</Label>
              <Select onValueChange={(value) => setConfig({ ...config, personalidade: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Como sua IA deve se comportar?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal e profissional</SelectItem>
                  <SelectItem value="amigavel">Amigável e descontraído</SelectItem>
                  <SelectItem value="divertida">Descontraída e divertida, com emojis</SelectItem>
                  <SelectItem value="tecnico">Técnico e detalhado</SelectItem>
                  <SelectItem value="caloroso">Caloroso e acolhedor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="objetivo">Objetivo principal da IA</Label>
              <Textarea
                id="objetivo"
                value={config.objetivo}
                onChange={(e) => setConfig({ ...config, objetivo: e.target.value })}
                placeholder="Ex: Atender clientes, agendar consultas, fornecer informações sobre serviços..."
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="regras">Regras e restrições</Label>
              <Textarea
                id="regras"
                value={config.regras}
                onChange={(e) => setConfig({ ...config, regras: e.target.value })}
                placeholder="Ex: Não dar conselhos médicos, sempre solicitar confirmação para agendamentos..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="fluxo">Fluxo de atendimento</Label>
              <Textarea
                id="fluxo"
                value={config.fluxo}
                onChange={(e) => setConfig({ ...config, fluxo: e.target.value })}
                placeholder="Ex: Saudação → Identificar necessidade → Agendar → Confirmar dados..."
                rows={3}
              />
            </div>

            <div>
              <Label>Funcionalidades (selecione as que deseja)</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {[
                  'Planilha de dados',
                  'Agendamentos',
                  'Cadastro de clientes',
                  'Lembretes automáticos',
                  'Relatórios',
                  'Integração CRM'
                ].map((func) => (
                  <label key={func} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.funcionalidades.includes(func)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setConfig({
                            ...config,
                            funcionalidades: [...config.funcionalidades, func]
                          });
                        } else {
                          setConfig({
                            ...config,
                            funcionalidades: config.funcionalidades.filter(f => f !== func)
                          });
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{func}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Configuração Concluída!</h3>
              <p className="text-gray-600 mb-6">
                Seu chatbot está pronto. Aqui está um resumo das configurações:
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div><span className="font-medium">Nome da IA:</span> {config.nome_da_IA || 'Não informado'}</div>
              <div><span className="font-medium">Empresa:</span> {config.empresa || 'Não informado'}</div>
              <div><span className="font-medium">Instância:</span> <code className="bg-gray-200 px-2 py-1 rounded text-sm">{config.nome_instancia}</code></div>
              <div><span className="font-medium">Nicho:</span> {config.nicho || 'Não informado'}</div>
              <div><span className="font-medium">Personalidade:</span> {config.personalidade || 'Não informado'}</div>
              <div><span className="font-medium">Funcionalidades:</span> {config.funcionalidades.join(', ') || 'Nenhuma selecionada'}</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/pricing-selection')}
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
                <h1 className="text-xl font-bold text-black">Configurar Chatbot</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? 'bg-[#FF914C] text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-[#FF914C]' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span>
                  {currentStep === 1 && 'Informações Básicas'}
                  {currentStep === 2 && 'Configuração Avançada'}
                  {currentStep === 3 && 'Resumo e Finalização'}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {renderStep()}

              <div className="flex justify-between pt-6">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    Anterior
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  disabled={loading}
                  className="bg-[#FF914C] hover:bg-[#FF7A2B] text-white px-8 ml-auto"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Criando...
                    </>
                  ) : (
                    currentStep === 3 ? 'Criar Chatbot' : 'Próximo'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ChatbotSetup;
