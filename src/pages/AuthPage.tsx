
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';
import EmailVerification from '@/components/EmailVerification';

const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔐 Tentando fazer login...');
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        console.error('❌ Erro no login:', error);
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "❌ Credenciais inválidas",
            description: "Email ou senha incorretos. Verifique se você já criou sua conta através do pagamento.",
            variant: "destructive",
          });
        } else if (error.message.includes('Email not confirmed')) {
          console.log('📧 Email não confirmado, iniciando verificação...');
          setShowEmailVerification(true);
          toast({
            title: "📧 Email não verificado",
            description: "Você precisa confirmar seu email antes de fazer login.",
          });
        } else {
          toast({
            title: "❌ Erro no login",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        console.log('✅ Login realizado com sucesso!');
        toast({
          title: "✅ Login realizado!",
          description: "Bem-vindo de volta ao seu dashboard.",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('💥 Erro geral:', error);
      toast({
        title: "❌ Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerificationSuccess = () => {
    console.log('✅ Email verificado, redirecionando...');
    navigate('/dashboard');
  };

  const handleBackFromVerification = () => {
    setShowEmailVerification(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (showEmailVerification) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <EmailVerification 
            email={formData.email}
            onVerificationSuccess={handleEmailVerificationSuccess}
            onBack={handleBackFromVerification}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao início
          </Button>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center bg-[#FF914C] text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">
              Entrar na Techcorps
            </CardTitle>
            <p className="text-orange-100">
              Acesse seu painel de controle
            </p>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#FF914C] hover:bg-[#FF7A2B] text-white py-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">Ainda não tem uma conta?</h4>
                <p className="text-sm text-orange-700 mb-3">
                  Para criar uma conta, você precisa fazer o pagamento primeiro na nossa página inicial.
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/payment')}
                  className="w-full border-[#FF914C] text-[#FF914C] hover:bg-[#FF914C] hover:text-white"
                >
                  Ir para Pagamento
                </Button>
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className="bg-yellow-50 p-3 rounded border border-yellow-300">
                <p className="text-xs text-yellow-700">
                  <strong>Importante:</strong> Se você acabou de criar sua conta, 
                  confirme o cadastro clicando no link enviado para seu email.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
