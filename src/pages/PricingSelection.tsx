
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, ArrowLeft, MessageCircle } from 'lucide-react';

const PricingSelection = () => {
  const navigate = useNavigate();

  const handlePlanSelect = () => {
    navigate('/payment', { 
      state: { 
        plan: {
          name: 'Mensal',
          price: 'R$ 150',
          features: [
            'Mensagens ilimitadas',
            'IA avançada com contexto',
            'Respostas automáticas 24/7',
            'Integração WhatsApp Business',
            'Dashboard completo',
            'Suporte técnico'
          ]
        }
      } 
    });
  };

  const handleCustomPlan = () => {
    const message = encodeURIComponent('quero personalizar a minha IA');
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
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
            Plano simples e acessível para automatizar seu atendimento
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plano Mensal */}
          <Card className="relative border-[#FF914C] border-2 shadow-xl scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-[#FF914C] text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                <Star className="h-4 w-4 mr-1" />
                Recomendado
              </span>
            </div>
            
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Plano Mensal
              </CardTitle>
              <p className="text-gray-600 mb-4">Ideal para a maioria dos negócios</p>
              
              <div className="space-y-2">
                <div className="text-4xl font-bold text-gray-900">
                  R$ 150
                  <span className="text-base font-normal text-gray-600">/mês</span>
                </div>
                <p className="text-sm text-gray-500">
                  Sem taxa de setup • Cancele quando quiser
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {[
                  'Mensagens ilimitadas',
                  'IA avançada com contexto',
                  'Respostas automáticas 24/7',
                  'Integração WhatsApp Business',
                  'Dashboard completo',
                  'Suporte técnico incluído',
                  'Webhook para integrações',
                  'Relatórios de conversas'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={handlePlanSelect}
                className="w-full bg-[#FF914C] hover:bg-[#FF7A2B]"
              >
                Selecionar Plano Mensal
              </Button>
            </CardContent>
          </Card>

          {/* Plano Personalizado */}
          <Card className="relative border-gray-200">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Plano Personalizado
              </CardTitle>
              <p className="text-gray-600 mb-4">Para necessidades específicas</p>
              
              <div className="space-y-2">
                <div className="text-4xl font-bold text-gray-900">
                  Sob consulta
                </div>
                <p className="text-sm text-gray-500">
                  Desenvolvido especialmente para você
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {[
                  'Tudo do plano mensal',
                  'IA treinada especificamente para seu negócio',
                  'Integração com sistemas próprios',
                  'CRM personalizado',
                  'Múltiplas instâncias WhatsApp',
                  'API personalizada',
                  'Suporte prioritário',
                  'Gerente de conta dedicado'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={handleCustomPlan}
                variant="outline"
                className="w-full border-[#FF914C] text-[#FF914C] hover:bg-[#FF914C] hover:text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Fale Conosco
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            Todas as opções incluem teste gratuito de 7 dias
          </p>
        </div>
      </main>
    </div>
  );
};

export default PricingSelection;
