
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import PricingPlans from '../components/PricingPlans';
import Footer from '../components/Footer';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirecionar usuários autenticados para o dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handlePlanSelect = (planName: string) => {
    console.log('Plano selecionado:', planName);
    
    // Redirecionar para página de pagamento
    navigate('/payment', { 
      state: { 
        plan: {
          name: planName,
          price: planName === 'Básico' ? 'R$ 49' : planName === 'Profissional' ? 'R$ 99' : 'R$ 199',
          originalPrice: planName === 'Básico' ? 'R$ 39' : planName === 'Profissional' ? 'R$ 79' : 'R$ 159'
        }
      } 
    });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLoginClick = () => {
    navigate('/auth');
  };

  const handleDemoClick = () => {
    navigate('/demo');
  };

  const scrollToPricing = () => {
    const element = document.getElementById('pricing');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        onNavigate={scrollToSection} 
        onCTAClick={scrollToPricing} 
        onDemoClick={handleDemoClick}
        onLoginClick={handleLoginClick}
      />
      
      <main>
        <Hero onCTAClick={scrollToPricing} />
        <HowItWorks />
        
        {/* Aviso sobre necessidade de plano */}
        <section className="py-8 bg-yellow-50 border-y border-yellow-200">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-yellow-800 mb-2">
                ⚠️ É necessário adquirir um plano para criar sua conta e acessar o sistema
              </h3>
              <p className="text-yellow-700">
                Escolha o plano ideal para seu negócio abaixo e tenha acesso completo à plataforma após a confirmação do pagamento.
              </p>
            </div>
          </div>
        </section>
        
        <PricingPlans 
          onPlanSelect={handlePlanSelect}
          selectedPlan=""
          isVisible={true}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;
