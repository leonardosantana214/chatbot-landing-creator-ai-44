
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Código inválido",
        description: "Digite um código de 6 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('🔐 Verificando email com código:', verificationCode);
      
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'email'
      });

      if (error) {
        console.error('❌ Erro na verificação:', error);
        toast({
          title: "❌ Código inválido",
          description: "Verifique o código e tente novamente.",
          variant: "destructive",
        });
      } else {
        console.log('✅ Email verificado com sucesso:', data);
        toast({
          title: "✅ Email verificado!",
          description: "Sua conta foi ativada com sucesso.",
        });
        onVerificationSuccess();
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

  const handleResendCode = async () => {
    setResendLoading(true);
    
    try {
      console.log('📧 Reenviando código para:', email);
      
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
        console.log('✅ Código reenviado');
        toast({
          title: "📧 Código reenviado",
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
      <CardHeader className="text-center bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center justify-center mb-2">
          <Mail className="h-8 w-8" />
        </div>
        <CardTitle className="text-xl font-bold">
          Verificar Email
        </CardTitle>
        <p className="text-blue-100 text-sm">
          Enviamos um código de verificação para {email}
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleVerifyEmail} className="space-y-6">
          <div className="text-center">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-800">
                Digite o código de 6 dígitos que você recebeu no seu email
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Código de Verificação</Label>
            <Input
              id="code"
              type="text"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-lg tracking-widest"
              maxLength={6}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            disabled={loading || verificationCode.length !== 6}
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
        </form>

        <div className="mt-6 space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Não recebeu o código?
            </p>
            <Button
              variant="outline"
              onClick={handleResendCode}
              disabled={resendLoading || resendCooldown > 0}
              className="w-full"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : resendCooldown > 0 ? (
                `Aguarde ${resendCooldown}s para reenviar`
              ) : (
                'Reenviar Código'
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

        <div className="mt-4 text-center">
          <div className="bg-yellow-50 p-3 rounded border">
            <p className="text-xs text-yellow-700">
              <strong>Dica:</strong> Verifique também a pasta de spam do seu email.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailVerification;
