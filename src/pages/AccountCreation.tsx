
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, User, Bot, Smartphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AccountCreation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  
  const userData = location.state?.userData;
  const paymentConfirmed = location.state?.paymentConfirmed;

  useEffect(() => {
    if (!userData || !paymentConfirmed) {
      navigate('/payment');
      return;
    }

    createAccount();
  }, [userData, paymentConfirmed]);

  const createAccount = async () => {
    try {
      setStep(1);
      
      // Gerar senha automática
      const password = `Tech${Math.random().toString(36).slice(-8)}!`;
      
      console.log('🚀 Criando conta automaticamente...', userData);
      
      const { error } = await signUp(userData.email, password, {
        name: userData.name,
        company: userData.company,
        area: userData.area,
        whatsapp: userData.whatsapp
      });
      
      if (error) {
        if (error.message.includes('User already registered')) {
          setStep(4); // Conta já existe
          setTimeout(() => {
            navigate('/auth');
          }, 3000);
        } else {
          throw error;
        }
        return;
      }

      setStep(2);
      
      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo, ${userData.name}!`,
      });

      // Aguardar e ir para configuração do chatbot
      setTimeout(() => {
        setStep(3);
        setTimeout(() => {
          navigate('/chatbot-setup', {
            state: {
              userData: userData,
              accountCreated: true,
              credentials: {
                email: userData.email,
                password: password
              }
            }
          });
        }, 2000);
      }, 2000);

    } catch (error) {
      console.error('❌ Erro ao criar conta:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      setStep(5); // Erro
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF914C] mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Criando sua conta...</h3>
            <p className="text-gray-600">Configurando seu perfil no sistema</p>
          </div>
        );
      
      case 2:
        return (
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">Conta criada com sucesso!</h3>
            <p className="text-gray-600">Bem-vindo à Techcorps, {userData?.name}!</p>
          </div>
        );
      
      case 3:
        return (
          <div className="text-center">
            <Bot className="h-12 w-12 text-[#FF914C] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Configurando seu chatbot...</h3>
            <p className="text-gray-600">Você será redirecionado para personalizar sua IA</p>
          </div>
        );
      
      case 4:
        return (
          <div className="text-center">
            <User className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-blue-800 mb-2">Conta já existe!</h3>
            <p className="text-gray-600">Você já tem uma conta. Redirecionando para login...</p>
          </div>
        );
      
      case 5:
        return (
          <div className="text-center">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">!</span>
            </div>
            <h3 className="text-xl font-semibold text-red-800 mb-2">Erro na criação</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecionando para tentar novamente...</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <img 
              src="/lovable-uploads/0cf142c2-da7d-452c-a8d8-0413cfb6c023.png" 
              alt="Techcorps" 
              className="h-12 w-auto mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-900">Configurando sua conta</h2>
          </div>

          <Card>
            <CardContent className="p-8">
              {renderStep()}
              
              {userData && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Dados da conta:</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Nome:</strong> {userData.name}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <p><strong>Empresa:</strong> {userData.company}</p>
                    <p><strong>Área:</strong> {userData.area}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span>Pagamento aprovado</span>
              </div>
              <div className="flex items-center">
                <div className={`h-4 w-4 rounded-full mr-1 ${
                  step >= 2 ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span>Conta criada</span>
              </div>
              <div className="flex items-center">
                <div className={`h-4 w-4 rounded-full mr-1 ${
                  step >= 3 ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span>Chatbot</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountCreation;
