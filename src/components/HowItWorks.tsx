
import { User, CreditCard, Smartphone } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: User,
      title: 'Preencha seus dados',
      description: 'Informe seus dados pessoais e da empresa para personalizar sua IA',
      step: '01'
    },
    {
      icon: CreditCard,
      title: 'Escolha seu plano',
      description: 'Selecione o plano que melhor se adapta às suas necessidades',
      step: '02'
    },
    {
      icon: Smartphone,
      title: 'Conecte sua IA ao WhatsApp',
      description: 'Escaneie o QR Code e sua secretária virtual estará funcionando',
      step: '03'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Como Funciona
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Em apenas 3 passos simples, você terá sua secretária virtual com IA 
            funcionando no seu WhatsApp Business
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-8">
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {step.step}
                </div>
                
                {/* Icon Container */}
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-600 transition-colors duration-300">
                  <step.icon className="h-12 w-12 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {step.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Connection Line */}
        <div className="hidden md:block relative mt-16">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-200 transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-0 w-1/3 h-0.5 bg-blue-600 transform -translate-y-1/2"></div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
