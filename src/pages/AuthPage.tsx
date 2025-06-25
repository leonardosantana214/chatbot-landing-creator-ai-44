
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false); // Padrão: mostrar cadastro primeiro
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: '',
    area: '',
    whatsapp: ''
  });
  
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const businessAreas = [
    'Saúde e Medicina',
    'Educação', 
    'Tecnologia',
    'Varejo e Comércio',
    'Alimentação',
    'Beleza e Estética',
    'Consultoria',
    'Imobiliário',
    'Advocacia',
    'Contabilidade',
    'Marketing',
    'Outros'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        console.log('🔐 Tentando fazer login...');
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          console.error('❌ Erro no login:', error);
          toast({
            title: "Erro no login",
            description: error.message,
            variant: "destructive",
          });
        } else {
          console.log('✅ Login realizado com sucesso!');
          toast({
            title: "Login realizado!",
            description: "Bem-vindo de volta.",
          });
          navigate('/dashboard');
        }
      } else {
        console.log('📝 Tentando criar conta...');
        
        // Validações básicas
        if (!formData.name || !formData.company || !formData.area || !formData.whatsapp) {
          toast({
            title: "Dados incompletos",
            description: "Preencha todos os campos obrigatórios.",
            variant: "destructive",
          });
          return;
        }

        const { error } = await signUp(formData.email, formData.password, {
          name: formData.name,
          company: formData.company,
          area: formData.area,
          whatsapp: formData.whatsapp
        });
        
        if (error) {
          console.error('❌ Erro no cadastro:', error);
          if (error.message.includes('User already registered')) {
            toast({
              title: "Email já cadastrado",
              description: "Este email já está registrado. Tente fazer login.",
              variant: "destructive",
            });
            setIsLogin(true); // Muda para modo login
          } else {
            toast({
              title: "Erro no cadastro", 
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          console.log('✅ Cadastro realizado com sucesso!');
          toast({
            title: "Conta criada com sucesso!",
            description: "Você já pode acessar o sistema.",
          });
          
          // Tentar fazer login automático
          setTimeout(async () => {
            const { error: loginError } = await signIn(formData.email, formData.password);
            if (!loginError) {
              navigate('/dashboard');
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error('💥 Erro geral:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
          <CardHeader className="text-center bg-black text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">
              {isLogin ? 'Entrar na Techcorps' : 'Criar Conta na Techcorps'}
            </CardTitle>
            <p className="text-gray-300">
              {isLogin ? 'Acesse seu painel de controle' : 'Configure sua IA em poucos minutos'}
            </p>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa *</Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="Nome da sua empresa"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Área de Atuação *</Label>
                    <Select value={formData.area} onValueChange={(value) => handleInputChange('area', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione sua área" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessAreas.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp *</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

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
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-black hover:bg-gray-800 text-white py-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? 'Entrando...' : 'Criando conta...'}
                  </>
                ) : (
                  isLogin ? 'Entrar' : 'Criar Conta'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              </p>
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-black hover:text-gray-700"
              >
                {isLogin ? 'Criar conta agora' : 'Fazer login'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
