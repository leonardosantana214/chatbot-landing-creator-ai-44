
import { Bot, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroProps {
  onCTAClick: () => void;
}

const Hero = ({ onCTAClick }: HeroProps) => {
  return (
    <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Transforme seu{' '}
                <span className="text-blue-600">WhatsApp</span> em uma{' '}
                <span className="text-green-600">secretária com IA</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Automatize o atendimento ao cliente, agende compromissos e responda perguntas 
                frequentes 24/7 com nossa inteligência artificial avançada integrada ao WhatsApp Business.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={onCTAClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                size="lg"
              >
                <Bot className="mr-2 h-5 w-5" />
                Criar minha IA
              </Button>
              
              <Button 
                variant="outline" 
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
                size="lg"
              >
                Ver Demonstração
              </Button>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-6 pt-8">
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">WhatsApp Integrado</h3>
                  <p className="text-sm text-gray-600">Conecta direto ao seu WhatsApp Business</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Bot className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">IA Avançada</h3>
                  <p className="text-sm text-gray-600">Entende contexto e personaliza respostas</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Sparkles className="h-8 w-8 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">24/7 Disponível</h3>
                  <p className="text-sm text-gray-600">Atende seus clientes a qualquer hora</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual/Image */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="bg-green-500 text-white p-4 rounded-xl mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="font-medium">IA Secretary</span>
                </div>
                <p className="text-sm">Olá! Como posso ajudá-lo hoje? 😊</p>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-xl mb-4">
                <p className="text-sm text-gray-700">Gostaria de agendar uma consulta</p>
              </div>
              
              <div className="bg-green-500 text-white p-4 rounded-xl">
                <p className="text-sm">
                  Perfeito! Tenho disponibilidade para amanhã às 14h ou quinta-feira às 10h. 
                  Qual horário prefere?
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
