
import { Check, MessageCircle } from 'lucide-react';
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
      name: 'Plano Principal',
      price: 'R$ 75',
      description: 'Solução completa para seu negócio',
      features: [
        'Chatbot com IA avançada',
        'Respostas automáticas inteligentes',
        'Integração WhatsApp Business',
        'Agendamento automatizado',
        'Relatórios detalhados',
        'Suporte prioritário',
        'Treinamento da equipe',
        'Configuração personalizada'
      ],
      highlighted: true
    },
    {
      name: 'Plano Empresarial',
      price: 'Personalizado',
      description: 'Soluções customizadas para grandes empresas',
      features: [
        'Tudo do Plano Principal',
        'Múltiplas instâncias',
        'Integração CRM personalizada',
        'API exclusiva',
        'Suporte 24/7 dedicado',
        'Treinamento presencial',
        'Consultoria especializada',
        'SLA garantido'
      ],
      highlighted: false,
      isCustom: true
    }
  ];

  if (!isVisible) return null;

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Nossos Planos de Chatbot
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Escolha a solução ideal para automatizar seu atendimento no WhatsApp
          </p>
        </div>

        {/* Planos */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {plans.map((plan) => (
            <Card key={plan.name} className={`${plan.highlighted ? 'border-2 border-[#FF914C] shadow-xl' : 'border shadow-lg'}`}>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="space-y-2">
                  <div className={`text-5xl font-bold ${plan.highlighted ? 'text-[#FF914C]' : 'text-gray-800'}`}>
                    {plan.price}
                    {!plan.isCustom && <span className="text-base font-normal text-gray-600">/mês</span>}
                  </div>
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

                {plan.isCustom ? (
                  <Button
                    onClick={() => window.open('https://wa.me/5511941179868', '_blank')}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 text-lg"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Fale Conosco no WhatsApp
                  </Button>
                ) : (
                  <Button
                    onClick={() => onPlanSelect(plan.name)}
                    className="w-full bg-[#FF914C] hover:bg-[#FF7A2B] text-white py-3 text-lg"
                  >
                    Escolher Plano - {plan.price}/mês
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Aviso sobre planos personalizados */}
        <div className="text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Precisa de um plano personalizado?
            </h3>
            <p className="text-blue-800 mb-4">
              Para planos individuais, personalizados ou com funcionalidades específicas para seu negócio, 
              entre em contato conosco via WhatsApp.
            </p>
            <Button
              variant="outline"
              className="border-blue-500 text-blue-700 hover:bg-blue-100"
              onClick={() => window.open('https://wa.me/5511941179868', '_blank')}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Falar no WhatsApp: +55 11 94117-9868
            </Button>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              💳 Pagamento Seguro via Mercado Pago
            </h3>
            <p className="text-green-800 mb-4">
              Aceitamos PIX (confirmação automática), cartão de crédito com autenticação 3DS e boleto bancário.
            </p>
            <p className="text-sm text-green-700">
              Seu acesso será liberado automaticamente após a confirmação do pagamento.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;
