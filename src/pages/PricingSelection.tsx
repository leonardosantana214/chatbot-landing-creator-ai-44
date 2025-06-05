
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, ArrowLeft } from 'lucide-react';

const PricingSelection = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const plans = [
    {
      name: 'Básico',
      monthlyPrice: 'R$ 49',
      annualPrice: 'R$ 39',
      description: 'Ideal para pequenos negócios',
      features: [
        'Até 500 mensagens/mês',
        'Respostas automáticas básicas',
        'Suporte por email',
        'Integração WhatsApp Business'
      ],
      popular: false
    },
    {
      name: 'Profissional',
      monthlyPrice: 'R$ 99',
      annualPrice: 'R$ 79',
      description: 'Perfeito para empresas em crescimento',
      features: [
        'Até 2.000 mensagens/mês',
        'IA avançada com contexto',
        'Agendamento automatizado',
        'Suporte prioritário',
        'Relatórios detalhados',
        'Múltiplos operadores'
      ],
      popular: true
    },
    {
      name: 'Empresarial',
      monthlyPrice: 'R$ 199',
      annualPrice: 'R$ 159',
      description: 'Solução completa para grandes empresas',
      features: [
        'Mensagens ilimitadas',
        'IA personalizada para seu negócio',
        'Integração com CRM',
        'Suporte 24/7',
        'API personalizada',
        'Treinamento da equipe',
        'Gerente de conta dedicado'
      ],
      popular: false
    }
  ];

  const handlePlanSelect = (planName: string) => {
    setSelectedPlan(planName);
    // Simular processo de pagamento/ativação
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
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
                onClick={() => navigate('/chatbot-setup')}
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
                <h1 className="text-xl font-bold text-black">Escolher Plano</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu Plano
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Planos flexíveis que crescem com seu negócio
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-md">
            <span className="px-4 py-2 text-sm font-medium text-gray-600">Mensal</span>
            <span className="px-4 py-2 text-sm font-medium bg-[#FF914C] text-white rounded-md">
              Anual (20% OFF)
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${
                plan.popular 
                  ? 'border-[#FF914C] border-2 shadow-xl scale-105' 
                  : 'border-gray-200'
              } ${
                selectedPlan === plan.name ? 'ring-2 ring-[#FF914C]' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#FF914C] text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Mais Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-gray-900">
                    {plan.annualPrice}
                    <span className="text-base font-normal text-gray-600">/mês</span>
                  </div>
                  <p className="text-sm text-gray-500 line-through">
                    {plan.monthlyPrice}/mês no plano mensal
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handlePlanSelect(plan.name)}
                  className={`w-full ${
                    plan.popular
                      ? 'bg-[#FF914C] hover:bg-[#FF7A2B]'
                      : 'bg-gray-900 hover:bg-gray-800'
                  } ${
                    selectedPlan === plan.name
                      ? 'bg-green-600 hover:bg-green-700'
                      : ''
                  }`}
                  disabled={selectedPlan === plan.name}
                >
                  {selectedPlan === plan.name ? 'Ativando...' : 'Selecionar Plano'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PricingSelection;
