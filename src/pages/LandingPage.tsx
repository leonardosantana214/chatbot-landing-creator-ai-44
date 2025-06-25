
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star, MessageCircle, BarChart3, Users, Bot, Zap, Shield } from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Se usuário já está logado, vai para dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleStartNow = () => {
    // Sempre vai para pagamento primeiro - só tem conta quem pagou!
    navigate('/payment');
  };

  const handleLogin = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/0cf142c2-da7d-452c-a8d8-0413cfb6c023.png" 
                alt="Techcorps" 
                className="h-10 w-auto"
              />
              <h1 className="text-2xl font-bold text-black">Techcorps</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={handleLogin}
                className="border-[#FF914C] text-[#FF914C] hover:bg-[#FF914C] hover:text-white"
              >
                Já sou cliente
              </Button>
              <Button 
                onClick={handleStartNow}
                className="bg-[#FF914C] hover:bg-[#FF7A2B] text-white px-6"
              >
                Começar Agora
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Automatize seu <span className="text-[#FF914C]">WhatsApp</span> com IA Avançada
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Responda seus clientes 24/7 com inteligência artificial. Aumente suas vendas, 
            melhore o atendimento e nunca mais perca um lead.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={handleStartNow}
              size="lg"
              className="bg-[#FF914C] hover:bg-[#FF7A2B] text-white px-8 py-4 text-lg"
            >
              <Zap className="h-5 w-5 mr-2" />
              Começar Agora - R$ 75/mês
            </Button>
          </div>

          {/* Social Proof */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
            </div>
            <p className="text-green-800 font-semibold">
              Mais de 500 empresas já confiam na Techcorps
            </p>
            <p className="text-green-600 text-sm">
              "Aumentamos nossas vendas em 300% com o chatbot da Techcorps"
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 bg-gray-50">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Por que escolher a Techcorps?
          </h3>
          <p className="text-xl text-gray-600">
            A solução mais completa para automatizar seu atendimento
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-[#FF914C] border-l-4 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Bot className="h-12 w-12 text-[#FF914C] mb-4" />
              <CardTitle>IA Personalizada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Chatbot treinado especificamente para seu negócio, 
                com respostas inteligentes e contextualizadas.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#FF914C] border-l-4 hover:shadow-lg transition-shadow">
            <CardHeader>
              <MessageCircle className="h-12 w-12 text-[#FF914C] mb-4" />
              <CardTitle>WhatsApp Business</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Integração completa com WhatsApp Business API. 
                Configure em minutos e comece a atender hoje mesmo.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#FF914C] border-l-4 hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-[#FF914C] mb-4" />
              <CardTitle>Dashboard Completo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Acompanhe todas as conversas, métricas de atendimento 
                e performance do seu chatbot em tempo real.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#FF914C] py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Pronto para revolucionar seu atendimento?
          </h3>
          <p className="text-xl text-orange-100 mb-8">
            Configure seu chatbot em minutos e comece a vender mais hoje mesmo
          </p>
          
          <Button 
            onClick={handleStartNow}
            size="lg"
            className="bg-white text-[#FF914C] hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
          >
            Começar Agora - R$ 75/mês
          </Button>
          
          <p className="text-orange-200 text-sm mt-4">
            ✅ Setup completo • ✅ Suporte incluído • ✅ Cancele quando quiser
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/lovable-uploads/0cf142c2-da7d-452c-a8d8-0413cfb6c023.png" 
              alt="Techcorps" 
              className="h-8 w-auto"
            />
            <h4 className="text-xl font-bold">Techcorps</h4>
          </div>
          <p className="text-gray-400 mb-4">
            Automatize seu WhatsApp com inteligência artificial
          </p>
          <p className="text-gray-500 mt-6">
            © 2024 Techcorps. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
