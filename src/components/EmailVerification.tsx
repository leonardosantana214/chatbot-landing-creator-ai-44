
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
  onVerificationSuccess: () => void;
  onBack: () => void;
}

const EmailVerification = ({ email, onVerificationSuccess, onBack }: EmailVerificationProps) => {
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Verificar automaticamente se o usuário já confirmou o email
  useEffect(() => {
    const checkEmailConfirmation = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        console.log('✅ Email já confirmado!');
        onVerificationSuccess();
      }
    };

    // Verificar a cada 3 segundos se o email foi confirmado
    const interval = setInterval(checkEmailConfirmation, 3000);
    
    // Limpar o interval quando o componente for desmontado
    return () => clearInterval(interval);
  }, [onVerificationSuccess]);

  const handleResendEmail = async () => {
    setResendLoading(true);
    
    try {
      console.log('📧 Reenviando email de confirmação para:', email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        console.error('❌ Erro ao reenviar:', error);
        toast({
          title: "❌ Erro ao reenviar",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('✅ Email reenviado');
        toast({
          title: "📧 Email reenviado",
          description: "Verifique sua caixa de entrada.",
        });
        setResendCooldown(60);
      }
    } catch (error) {
      console.error('💥 Erro geral no reenvio:', error);
      toast({
        title: "❌ Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader className="text-center bg-[#FF914C] text-white rounded-t-lg">
        <div className="flex items-center justify-center mb-2">
          <Mail className="h-8 w-8" />
        </div>
        <CardTitle className="text-xl font-bold">
          Confirme seu Email
        </CardTitle>
        <p className="text-orange-100 text-sm">
          Enviamos um link de confirmação para {email}
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <div className="text-center">
          <div className="bg-orange-50 p-6 rounded-lg mb-6">
            <CheckCircle className="h-12 w-12 text-[#FF914C] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Verifique seu email
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Clique no link que enviamos para <strong>{email}</strong> para confirmar sua conta.
            </p>
            <div className="bg-yellow-100 p-3 rounded border border-yellow-300">
              <p className="text-xs text-yellow-700">
                <strong>Dica:</strong> Verifique também a pasta de spam do seu email.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-800">
              🔄 Verificando automaticamente... Assim que você clicar no link do email, será redirecionado automaticamente.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Não recebeu o email?
            </p>
            <Button
              variant="outline"
              onClick={handleResendEmail}
              disabled={resendLoading || resendCooldown > 0}
              className="w-full border-[#FF914C] text-[#FF914C] hover:bg-[#FF914C] hover:text-white"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : resendCooldown > 0 ? (
                `Aguarde ${resendCooldown}s para reenviar`
              ) : (
                'Reenviar Email'
              )}
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={onBack}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailVerification;
