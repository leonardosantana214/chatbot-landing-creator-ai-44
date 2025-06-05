
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Bot, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatbotConfig {
  name: string;
  businessType: string;
  tone: string;
  greeting: string;
  specialties: string;
  workingHours: string;
}

const ChatbotSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<ChatbotConfig>({
    name: '',
    businessType: '',
    tone: '',
    greeting: '',
    specialties: '',
    workingHours: ''
  });

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    navigate('/pricing-selection');
  };

  const handleFinish = () => {
    toast({
      title: "Configuração salva!",
      description: "Seu chatbot foi configurado com sucesso.",
    });
    navigate('/pricing-selection');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Nome do seu chatbot</Label>
              <Input
                id="name"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="Ex: Assistente da Clínica São Paulo"
              />
            </div>

            <div>
              <Label htmlFor="businessType">Tipo de negócio</Label>
              <Select onValueChange={(value) => setConfig({ ...config, businessType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu ramo de atividade" />
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
              <Label htmlFor="tone">Tom de voz</Label>
              <Select onValueChange={(value) => setConfig({ ...config, tone: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Como seu chatbot deve falar?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal e profissional</SelectItem>
                  <SelectItem value="amigavel">Amigável e descontraído</SelectItem>
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
              <Label htmlFor="greeting">Mensagem de boas-vindas</Label>
              <Textarea
                id="greeting"
                value={config.greeting}
                onChange={(e) => setConfig({ ...config, greeting: e.target.value })}
                placeholder="Ex: Olá! Sou a assistente virtual da Clínica São Paulo. Como posso ajudá-lo hoje?"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="specialties">Especialidades/Serviços oferecidos</Label>
              <Textarea
                id="specialties"
                value={config.specialties}
                onChange={(e) => setConfig({ ...config, specialties: e.target.value })}
                placeholder="Ex: Consultas médicas, exames, procedimentos estéticos, fisioterapia..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="workingHours">Horário de funcionamento</Label>
              <Input
                id="workingHours"
                value={config.workingHours}
                onChange={(e) => setConfig({ ...config, workingHours: e.target.value })}
                placeholder="Ex: Segunda a sexta: 8h às 18h, Sábado: 8h às 12h"
              />
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
              <div>
                <span className="font-medium">Nome:</span> {config.name || 'Não informado'}
              </div>
              <div>
                <span className="font-medium">Tipo de negócio:</span> {config.businessType || 'Não informado'}
              </div>
              <div>
                <span className="font-medium">Tom de voz:</span> {config.tone || 'Não informado'}
              </div>
              <div>
                <span className="font-medium">Horário:</span> {config.workingHours || 'Não informado'}
              </div>
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
                onClick={() => navigate('/dashboard')}
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
                  {currentStep === 2 && 'Personalização'}
                  {currentStep === 3 && 'Resumo'}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {renderStep()}

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="px-8"
                >
                  Pular Configuração
                </Button>

                <div className="space-x-2">
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
                    className="bg-[#FF914C] hover:bg-[#FF7A2B] text-white px-8"
                  >
                    {currentStep === 3 ? 'Finalizar' : 'Próximo'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ChatbotSetup;
