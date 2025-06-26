
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmailVerificationProps {
  email: string;
  onVerificationSuccess: () => void;
  onBack: () => void;
}

const EmailVerification = ({ email, onVerificationSuccess, onBack }: EmailVerificationProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const { toast } = useToast();

  const sendVerificationCode = async () => {
    setSendingCode(true);
    try {
      console.log('📧 Enviando código de verificação para:', email);
      
      // Usar o Supabase para enviar OTP por email
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false // Não criar usuário, apenas enviar código
        }
      });

      if (error) {
        console.error('❌ Erro ao enviar código:', error);
        toast({
          title: "❌ Erro ao enviar código",
          description: "Não foi possível enviar o código de verificação. Tente novamente.",
          variant: "destructive",
        });
      } else {
        setCodeSent(true);
        toast({
          title: "📧 Código enviado!",
          description: "Verifique seu email e digite o código de 6 dígitos.",
        });
      }
    } catch (error) {
      console.error('💥 Erro inesperado:', error);
      toast({
        title: "❌ Erro",
        description: "Erro inesperado ao enviar código.",
        variant: "destructive",
      });
    } finally {
      setSendingCode(false);
    }
  };

  const verifyCode = async () => {
    if (!code || code.length !== 6) {
      toast({
        title: "❌ Código inválido",
        description: "Digite o código de 6 dígitos enviado por email.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Verificando código:', code);
      
      // Verificar o OTP
      const { error } = await supabase.auth.verifyOtp({
        email: email,
        token: code,
        type: 'email'
      });

      if (error) {
        console.error('❌ Código inválido:', error);
        toast({
          title: "❌ Código inválido",
          description: "O código digitado está incorreto ou expirou. Tente novamente.",
          variant: "destructive",
        });
      } else {
        console.log('✅ Email verificado com sucesso!');
        toast({
          title: "✅ Email verificado!",
          description: "Redirecionando para o dashboard...",
        });
        onVerificationSuccess();
      }
    } catch (error) {
      console.error('💥 Erro na verificação:', error);
      toast({
        title: "❌ Erro na verificação",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader className="text-center bg-blue-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl font-bold flex items-center justify-center">
          <Mail className="h-6 w-6 mr-2" />
          Verificar Email
        </CardTitle>
        <p className="text-blue-100">
          Confirme seu email para continuar
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Enviamos um código de verificação para:
            </p>
            <p className="font-semibold text-lg">{email}</p>
          </div>

          {!codeSent ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Clique no botão abaixo para receber o código de verificação
              </p>
              <Button 
                onClick={sendVerificationCode}
                disabled={sendingCode}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {sendingCode ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando código...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Código de Verificação
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center text-green-800">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">Código enviado com sucesso!</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de verificação (6 dígitos)
                </label>
                <Input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>

              <Button 
                onClick={verifyCode}
                disabled={loading || code.length !== 6}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar Código'
                )}
              </Button>

              <Button 
                onClick={sendVerificationCode}
                disabled={sendingCode}
                variant="outline"
                className="w-full"
              >
                Reenviar Código
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            onClick={onBack}
            className="w-full"
            disabled={loading || sendingCode}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailVerification;
