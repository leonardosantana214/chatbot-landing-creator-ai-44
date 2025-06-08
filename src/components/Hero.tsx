
import { Button } from '@/components/ui/button';
import { Bot, MessageCircle, Zap, Users } from 'lucide-react';

interface HeroProps {
  onCTAClick: () => void;
}

const Hero = ({ onCTAClick }: HeroProps) => {
  return (
    <section className="pt-24 pb-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Transforme seu
                  <span className="text-[#FF914C] block">
                    WhatsApp Business
                  </span>
                  em uma máquina de vendas
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Automatize 100% do seu atendimento no WhatsApp com IA avançada. 
                  Aumente suas vendas, reduza custos e ofereça atendimento 24h sem contratar mais funcionários.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={onCTAClick}
                  className="bg-[#FF914C] hover:bg-[#FF7A2B] text-white px-8 py-4 text-lg font-semibold"
                >
                  <Bot className="mr-2 h-5 w-5" />
                  Ver Planos e Preços
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Empresas atendidas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Satisfação</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">24h</div>
                  <div className="text-sm text-gray-600">Atendimento</div>
                </div>
              </div>
            </div>

            {/* Right Column - Features */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-[#FF914C] rounded-full p-3">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Respostas Inteligentes</h3>
                      <p className="text-gray-600 text-sm">IA treinada para seu negócio</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-500 rounded-full p-3">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Automação Completa</h3>
                      <p className="text-gray-600 text-sm">Agendamentos e lembretes automáticos</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="bg-green-500 rounded-full p-3">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Gestão de Clientes</h3>
                      <p className="text-gray-600 text-sm">CRM integrado e relatórios detalhados</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demo Preview */}
              <div className="bg-gray-900 rounded-2xl p-6 text-white">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-400 ml-4">WhatsApp Business</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-800 rounded-lg p-3 text-sm">
                      <span className="text-gray-400">Cliente:</span> Olá, gostaria de agendar uma consulta
                    </div>
                    <div className="bg-[#FF914C] rounded-lg p-3 text-sm ml-8">
                      <span className="text-white">IA:</span> Olá! Claro, posso ajudar. Qual seria o melhor horário para você?
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
