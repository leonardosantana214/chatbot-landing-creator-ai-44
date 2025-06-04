
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PricingPlansProps {
  onPlanSelect: (planName: string) => void;
  selectedPlan: string;
  isVisible: boolean;
}

const PricingPlans = ({ onPlanSelect, selectedPlan, isVisible }: PricingPlansProps) => {
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

  if (!isVisible) return null;

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
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
            <span className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md">
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
                  ? 'border-blue-500 border-2 shadow-xl scale-105' 
                  : 'border-gray-200'
              } ${
                selectedPlan === plan.name ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
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
                  onClick={() => onPlanSelect(plan.name)}
                  className={`w-full ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  } ${
                    selectedPlan === plan.name
                      ? 'bg-green-600 hover:bg-green-700'
                      : ''
                  }`}
                >
                  {selectedPlan === plan.name ? 'Selecionado' : 'Selecionar Plano'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;
