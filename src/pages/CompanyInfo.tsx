
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Phone, Mail, MapPin, Target, Eye, Heart } from 'lucide-react';

const CompanyInfo = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/0cf142c2-da7d-452c-a8d8-0413cfb6c023.png" 
              alt="Techcorps" 
              className="h-8 w-auto"
            />
            <h1 className="text-xl font-bold text-black">Sobre a Techcorps</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Techcorps
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transformamos a comunicação empresarial com soluções inteligentes de atendimento automatizado, 
              proporcionando eficiência e excelência no relacionamento com clientes.
            </p>
          </div>

          {/* Cards de Informações */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-[#FF914C]" />
                  Nossa Missão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Democratizar o acesso a tecnologias de inteligência artificial para empresas de todos os tamanhos, 
                  oferecendo soluções de atendimento automatizado que aumentam a produtividade e melhoram a 
                  experiência do cliente.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-[#FF914C]" />
                  Nossa Visão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Ser a principal referência em soluções de atendimento inteligente no Brasil, 
                  revolucionando a forma como empresas se comunicam com seus clientes através da 
                  tecnologia de ponta.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-[#FF914C]" />
                  Nossos Valores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-700 space-y-2">
                  <li>• <strong>Inovação:</strong> Busca constante por soluções criativas</li>
                  <li>• <strong>Excelência:</strong> Compromisso com a qualidade</li>
                  <li>• <strong>Transparência:</strong> Relacionamentos baseados na confiança</li>
                  <li>• <strong>Eficiência:</strong> Otimização de processos e resultados</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Serviços */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-[#FF914C]" />
                Nossos Serviços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Assistente Virtual com IA</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Atendimento automatizado 24/7</li>
                    <li>• Respostas inteligentes e contextualizadas</li>
                    <li>• Integração com WhatsApp Business</li>
                    <li>• Agendamento automatizado</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Soluções Personalizadas</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Treinamento de IA para seu negócio</li>
                    <li>• Integração com sistemas existentes</li>
                    <li>• Relatórios e análises detalhadas</li>
                    <li>• Suporte técnico especializado</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-[#FF914C]" />
                Entre em Contato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-[#FF914C]" />
                  <div>
                    <p className="font-medium">Telefone</p>
                    <p className="text-gray-600">+55 11 94117-9868</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-[#FF914C]" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">contato@techcorps.com.br</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-[#FF914C]" />
                  <div>
                    <p className="font-medium">Localização</p>
                    <p className="text-gray-600">São Paulo, SP</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CompanyInfo;
