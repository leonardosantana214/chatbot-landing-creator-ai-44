
import { useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import PricingPlans from '../components/PricingPlans';
import UserForm from '../components/UserForm';
import WhatsAppConnection from '../components/WhatsAppConnection';
import Footer from '../components/Footer';

export interface UserData {
  name: string;
  company: string;
  area: string;
  email: string;
  whatsapp: string;
}

const LandingPage = () => {
  const [currentStep, setCurrentStep] = useState<'hero' | 'form' | 'plans' | 'connection'>('hero');
  const [userData, setUserData] = useState<UserData>({
    name: '',
    company: '',
    area: '',
    email: '',
    whatsapp: ''
  });
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const handleFormSubmit = (data: UserData) => {
    setUserData(data);
    console.log('Dados do usuário:', data);
    
    if (selectedPlan) {
      setCurrentStep('connection');
    } else {
      setCurrentStep('plans');
    }
  };

  const handlePlanSelect = (planName: string) => {
    setSelectedPlan(planName);
    console.log('Plano selecionado:', planName);
    
    if (userData.name && userData.email) {
      setCurrentStep('connection');
    } else {
      setCurrentStep('form');
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const showForm = () => {
    setCurrentStep('form');
    scrollToSection('form-section');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={scrollToSection} onCTAClick={showForm} />
      
      <main>
        <Hero onCTAClick={showForm} />
        <HowItWorks />
        
        {currentStep !== 'hero' && (
          <>
            <section id="form-section" className="py-16 bg-gray-50">
              <div className="container mx-auto px-4">
                <UserForm
                  onSubmit={handleFormSubmit}
                  initialData={userData}
                  isVisible={currentStep === 'form' || (currentStep === 'plans' && !userData.name)}
                />
              </div>
            </section>
            
            <PricingPlans 
              onPlanSelect={handlePlanSelect}
              selectedPlan={selectedPlan}
              isVisible={currentStep === 'plans' || currentStep === 'form'}
            />
            
            {currentStep === 'connection' && (
              <WhatsAppConnection userData={userData} selectedPlan={selectedPlan} />
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;
