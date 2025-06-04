
import { User, CreditCard, Smartphone, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: User,
      title: 'Preencha seus dados',
      description: 'Informe seus dados pessoais e da empresa para personalizar sua IA',
      step: '01',
      time: '2 min'
    },
    {
      icon: CreditCard,
      title: 'Escolha seu plano',
      description: 'Selecione o plano que melhor se adapta às suas necessidades',
      step: '02',
      time: '1 min'
    },
    {
      icon: Smartphone,
      title: 'Conecte sua IA ao WhatsApp',
      description: 'Escaneie o QR Code e sua secretária virtual estará funcionando',
      step: '03',
      time: '30 seg'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Como Funciona
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Em apenas 3 passos simples, você terá sua secretária virtual com IA 
            funcionando no seu WhatsApp Business
          </p>
          <div className="mt-6 inline-flex items-center bg-white px-4 py-2 rounded-full border border-gray-200">
            <span className="text-sm font-medium text-gray-700">⏱️ Setup completo em menos de 4 minutos</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center group relative">
              {/* Connection Arrow */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 -right-4 z-10">
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                </div>
              )}
              
              <div className="relative mb-8">
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg z-20">
                  {step.step}
                </div>
                
                {/* Icon Container */}
                <div className="w-24 h-24 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center mx-auto group-hover:border-black group-hover:bg-black transition-all duration-300 shadow-lg">
                  <step.icon className="h-12 w-12 text-black group-hover:text-white transition-colors duration-300" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="flex items-center justify-center mb-4">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    {step.time}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-black mb-4">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-black text-white p-8 rounded-2xl max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Pronto para começar?</h3>
            <p className="text-gray-300 mb-6">Junte-se a mais de 500 empresas que já automatizaram seu atendimento</p>
            <button className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
              Iniciar Configuração Gratuita
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
