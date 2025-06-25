
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CreditCard, User, Mail, Phone, Building, FileText, CheckCircle, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    area: '',
    whatsapp: ''
  });

  const businessAreas = [
    'Saúde e Medicina',
    'Educação',
    'Tecnologia',
    'Varejo e Comércio',
    'Alimentação',
    'Beleza e Estética',
    'Consultoria',
    'Imobiliário',
    'Advocacia',
    'Contabilidade',
    'Marketing',
    'Outros'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.company || !formData.area || !formData.whatsapp) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos obrigatórios.",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    }
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast({
        title: "Método de pagamento",
        description: "Selecione um método de pagamento.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simular processamento do pagamento
    setTimeout(() => {
      setLoading(false);
      setStep(3);
      
      toast({
        title: "Pagamento aprovado!",
        description: "Agora vamos configurar seu chatbot.",
      });

      // Após pagamento aprovado, vai direto para configuração do chatbot
      setTimeout(() => {
        navigate('/chatbot-setup', {
          state: {
            userData: formData,
            paymentConfirmed: true,
            paymentMethod: paymentMethod
          }
        });
      }, 2000);
    }, 2000);
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
                onClick={() => step === 1 ? navigate('/') : setStep(step - 1)}
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
                <h1 className="text-xl font-bold text-black">
                  {step === 1 && 'Seus Dados'}
                  {step === 2 && 'Pagamento'}
                  {step === 3 && 'Confirmação'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-[#FF914C] text-white' : 'bg-gray-200'
              }`}>1</div>
              <div className={`w-8 h-1 ${step >= 2 ? 'bg-[#FF914C]' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-[#FF914C] text-white' : 'bg-gray-200'
              }`}>2</div>
              <div className={`w-8 h-1 ${step >= 3 ? 'bg-[#FF914C]' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-[#FF914C] text-white' : 'bg-gray-200'
              }`}>3</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {step === 1 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Chatbot WhatsApp + IA</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#FF914C] text-white p-6 rounded-lg">
                    <h3 className="text-2xl font-bold">R$ 75/mês</h3>
                    <p className="text-orange-100 mt-2">
                      ✅ Chatbot IA personalizado • ✅ WhatsApp Business • ✅ Dashboard completo • ✅ Suporte
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dados da Empresa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        placeholder="Seu nome completo"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company">Empresa *</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="company"
                        placeholder="Nome da sua empresa"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="area">Área de Atuação *</Label>
                    <Select value={formData.area} onValueChange={(value) => handleInputChange('area', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione sua área" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessAreas.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="whatsapp">WhatsApp *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="whatsapp"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={formData.whatsapp}
                        onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleNextStep}
                    className="w-full bg-[#FF914C] hover:bg-[#FF7A2B] text-white py-3"
                  >
                    Continuar para Pagamento
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Escolha a forma de pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'pix' ? 'border-[#FF914C] bg-orange-50' : 'border-gray-200 hover:border-[#FF914C]'
                  }`}
                  onClick={() => setPaymentMethod('pix')}
                >
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-8 w-8 text-[#FF914C]" />
                    <div>
                      <h4 className="font-semibold">PIX</h4>
                      <p className="text-sm text-gray-600">Aprovação instantânea</p>
                    </div>
                    <div className="ml-auto">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        Recomendado
                      </span>
                    </div>
                  </div>
                </div>

                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'boleto' ? 'border-[#FF914C] bg-orange-50' : 'border-gray-200 hover:border-[#FF914C]'
                  }`}
                  onClick={() => setPaymentMethod('boleto')}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-[#FF914C]" />
                    <div>
                      <h4 className="font-semibold">Boleto Bancário</h4>
                      <p className="text-sm text-gray-600">Vencimento em 3 dias úteis</p>
                    </div>
                  </div>
                </div>

                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'cartao' ? 'border-[#FF914C] bg-orange-50' : 'border-gray-200 hover:border-[#FF914C]'
                  }`}
                  onClick={() => setPaymentMethod('cartao')}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-8 w-8 text-[#FF914C]" />
                    <div>
                      <h4 className="font-semibold">Cartão de Crédito</h4>
                      <p className="text-sm text-gray-600">Até 12x sem juros</p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handlePayment}
                  disabled={!paymentMethod || loading}
                  className="w-full bg-[#FF914C] hover:bg-[#FF7A2B] text-white py-3"
                >
                  {loading ? 'Processando...' : 'Finalizar Pagamento - R$ 75'}
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="border-green-200">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-800 mb-4">
                  Pagamento Aprovado!
                </h3>
                <p className="text-gray-600 mb-6">
                  Agora vamos configurar seu chatbot personalizado...
                </p>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800 font-medium">
                    Redirecionando para configuração do chatbot
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Payment;
