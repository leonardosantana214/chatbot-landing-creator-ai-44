
import { Bot, MessageCircle, Sparkles, CheckCircle, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroProps {
  onCTAClick: () => void;
}

const Hero = ({ onCTAClick }: HeroProps) => {
  return (
    <section className="pt-20 pb-16 bg-white min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-800 mb-4">
                <Bot className="h-4 w-4 mr-2" />
                Revolucione seu atendimento com IA
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-black leading-tight">
                Transforme seu{' '}
                <span className="relative">
                  WhatsApp
                  <div className="absolute -bottom-2 left-0 w-full h-3 bg-gray-200 -z-10"></div>
                </span> em uma{' '}
                <span className="relative">
                  secretária com IA
                  <div className="absolute -bottom-2 left-0 w-full h-3 bg-black -z-10"></div>
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Automatize 90% do seu atendimento, agende compromissos e responda perguntas 
                24/7 com nossa inteligência artificial avançada integrada ao WhatsApp Business.
              </p>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center gap-8 py-4">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-gray-400 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-gray-500 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-sm text-gray-600">+500 empresas confiam</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="flex text-black">
                  ★★★★★
                </div>
                <span className="text-sm text-gray-600">4.9/5 (127 avaliações)</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={onCTAClick}
                className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg font-semibold transition-all duration-200 transform hover:scale-105"
                size="lg"
              >
                <Bot className="mr-2 h-5 w-5" />
                Criar minha IA GRÁTIS
              </Button>
              
              <Button 
                variant="outline" 
                className="border-2 border-black text-black hover:bg-black hover:text-white px-8 py-4 text-lg font-semibold transition-all duration-200"
                size="lg"
              >
                Ver Demonstração
              </Button>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-6 pt-8">
              <div className="text-center sm:text-left">
                <MessageCircle className="h-10 w-10 text-black mx-auto sm:mx-0 mb-3" />
                <h3 className="font-bold text-black mb-2">WhatsApp Integrado</h3>
                <p className="text-sm text-gray-600">Conecta direto ao seu WhatsApp Business</p>
              </div>
              
              <div className="text-center sm:text-left">
                <Clock className="h-10 w-10 text-black mx-auto sm:mx-0 mb-3" />
                <h3 className="font-bold text-black mb-2">24/7 Disponível</h3>
                <p className="text-sm text-gray-600">Atende seus clientes a qualquer hora</p>
              </div>
              
              <div className="text-center sm:text-left">
                <Users className="h-10 w-10 text-black mx-auto sm:mx-0 mb-3" />
                <h3 className="font-bold text-black mb-2">+90% Conversão</h3>
                <p className="text-sm text-gray-600">Resposta instantânea aumenta vendas</p>
              </div>
            </div>
          </div>

          {/* Visual/Image */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
              {/* Phone mockup */}
              <div className="bg-gray-100 rounded-xl p-4 max-w-sm mx-auto">
                <div className="bg-black text-white p-3 rounded-lg mb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <span className="font-medium">IA Secretary</span>
                      <div className="flex items-center text-xs text-gray-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                        Online
                      </div>
                    </div>
                  </div>
                  <p className="text-sm">Olá! Como posso ajudá-lo hoje? 😊</p>
                  <span className="text-xs text-gray-300">14:30</span>
                </div>
                
                <div className="bg-white p-3 rounded-lg mb-3 ml-8">
                  <p className="text-sm text-gray-700">Gostaria de agendar uma consulta</p>
                  <span className="text-xs text-gray-400">14:31</span>
                </div>
                
                <div className="bg-black text-white p-3 rounded-lg">
                  <p className="text-sm">
                    Perfeito! Tenho disponibilidade para amanhã às 14h ou quinta-feira às 10h. 
                    Qual horário prefere? 📅
                  </p>
                  <span className="text-xs text-gray-300">14:31</span>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-black text-white p-2 rounded-lg shadow-lg">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white border border-gray-200 p-2 rounded-lg shadow-lg">
              <span className="text-xs font-medium">98% Satisfação</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
