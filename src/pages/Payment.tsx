
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CreditCard, User, Mail, Phone, Building, Lock } from 'lucide-react';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPlan = location.state?.plan;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simular pagamento aprovado e prosseguir para configuração do chatbot
    console.log('💳 Dados coletados (sem criar conta ainda):', formData);
    
    // Navegar para configuração do chatbot passando os dados do usuário
    navigate('/chatbot-setup', {
      state: {
        userData: formData,
        paymentConfirmed: true
      }
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
                onClick={() => navigate('/')}
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
                <h1 className="text-xl font-bold text-black">Cadastro e Pagamento</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="grid gap-8">
            {/* Plano Selecionado */}
            {selectedPlan && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Plano Selecionado</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#FF914C] text-white p-4 rounded-lg">
                    <h3 className="text-xl font-bold">{selectedPlan.name}</h3>
                    <p className="text-2xl font-bold mt-2">{selectedPlan.price}/mês</p>
                    <div className="mt-4 space-y-1">
                      {selectedPlan.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <span>✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Formulário de Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
                <p className="text-sm text-gray-600">
                  Preencha seus dados para criar sua conta. O pagamento será processado após a configuração do chatbot.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="pl-10"
                        required
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
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password">Senha *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Crie uma senha segura"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company">Empresa *</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="company"
                        type="text"
                        placeholder="Nome da sua empresa"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="pl-10"
                        required
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
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">🎯 Próximos Passos:</h4>
                    <ol className="text-sm text-blue-700 space-y-1">
                      <li>1. Configure seu chatbot personalizado</li>
                      <li>2. Sua conta será criada automaticamente</li>
                      <li>3. Conecte seu WhatsApp</li>
                      <li>4. Comece a usar sua IA!</li>
                    </ol>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#FF914C] hover:bg-[#FF7A2B] text-white py-3"
                  >
                    Continuar para Configuração do Chatbot
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payment;
