
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CreditCard, Shield, Check, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCodeGenerator from '../components/QRCodeGenerator';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit');
  
  // Usar valor padrão de R$ 75
  const selectedPlan = location.state?.plan || {
    name: 'Mensal',
    price: 'R$ 75',
    features: [
      'Mensagens ilimitadas',
      'IA avançada com contexto',
      'Respostas automáticas 24/7',
      'Integração WhatsApp Business',
      'Dashboard completo',
      'Suporte técnico',
      '1 chatbot incluído'
    ]
  };

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    email: '',
    cpf: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simular processamento de pagamento
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Pagamento processado com sucesso!",
        description: "Seu plano foi ativado. Redirecionando para criação da conta...",
      });
      
      setTimeout(() => {
        navigate('/chatbot-setup', { 
          state: { paymentConfirmed: true, plan: selectedPlan.name } 
        });
      }, 2000);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/pricing-selection')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/0cf142c2-da7d-452c-a8d8-0413cfb6c023.png" 
                  alt="Techcorps" 
                  className="h-8 w-auto"
                />
                <h1 className="text-xl font-bold text-black">Finalizar Pagamento</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-[#FF914C]/10 rounded-lg">
                  <h3 className="font-semibold text-lg">{selectedPlan.name}</h3>
                  <p className="text-2xl font-bold text-[#FF914C] mt-2">
                    R$ 75/mês
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Incluído no plano:</h4>
                  <ul className="space-y-1">
                    {selectedPlan.features?.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span className="text-[#FF914C]">R$ 75/mês</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Cobrança mensal • Cancele a qualquer momento
                  </p>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    🎉 Teste gratuito de 7 dias incluído!
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Sua primeira cobrança será apenas em 7 dias
                  </p>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium">
                    ⚠️ Acesso ao dashboard após pagamento
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Você só poderá criar sua conta após confirmar o pagamento
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulário de Pagamento */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Dados de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="credit">Cartão de Crédito</TabsTrigger>
                    <TabsTrigger value="debit">Cartão de Débito</TabsTrigger>
                    <TabsTrigger value="pix">PIX</TabsTrigger>
                  </TabsList>

                  <TabsContent value="credit" className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <Label htmlFor="cardNumber">Número do Cartão</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={paymentData.cardNumber}
                          onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Validade</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/AA"
                            value={paymentData.expiryDate}
                            onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={paymentData.cvv}
                            onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="cardName">Nome no Cartão</Label>
                        <Input
                          id="cardName"
                          placeholder="João Silva"
                          value={paymentData.cardName}
                          onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={paymentData.email}
                          onChange={(e) => setPaymentData({...paymentData, email: e.target.value})}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="cpf">CPF</Label>
                        <Input
                          id="cpf"
                          placeholder="000.000.000-00"
                          value={paymentData.cpf}
                          onChange={(e) => setPaymentData({...paymentData, cpf: e.target.value})}
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
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processando...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pagar R$ 75 e Criar Conta
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="debit" className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* ... keep existing code (mesmo formulário do cartão de crédito) */}
                      <Button 
                        type="submit" 
                        className="w-full bg-[#FF914C] hover:bg-[#FF7A2B] text-white py-3"
                        disabled={loading}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pagar R$ 75 com Débito
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="pix" className="space-y-6">
                    <div className="text-center space-y-6">
                      <div className="flex items-center justify-center space-x-2">
                        <QrCode className="h-6 w-6 text-[#FF914C]" />
                        <h3 className="text-lg font-semibold">Pagamento via PIX</h3>
                      </div>
                      
                      <QRCodeGenerator
                        type="pix"
                        value="techcorps@pix.com"
                        amount={75}
                        recipientName="Techcorps"
                        description="Assinatura chatbot R$ 75/mês"
                      />
                      
                      <div className="bg-blue-50 p-4 rounded-lg text-sm">
                        <p className="font-medium text-blue-900 mb-2">Teste gratuito de 7 dias:</p>
                        <p className="text-blue-800 mb-2">
                          Você pode testar gratuitamente por 7 dias e só será cobrado após esse período.
                        </p>
                        <p className="text-blue-800">
                          O PIX de R$ 75 será processado apenas no 8º dia.
                        </p>
                      </div>

                      <Button 
                        onClick={() => {
                          toast({
                            title: "Pagamento confirmado!",
                            description: "Redirecionando para criação da conta...",
                          });
                          setTimeout(() => navigate('/chatbot-setup', { 
                            state: { paymentConfirmed: true } 
                          }), 2000);
                        }}
                        className="w-full bg-[#FF914C] hover:bg-[#FF7A2B] text-white py-3"
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        Confirmar Pagamento PIX
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="bg-blue-50 p-4 rounded-lg mt-6">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Pagamento Seguro</h4>
                      <p className="text-sm text-blue-800">
                        Seus dados são protegidos com criptografia SSL. 
                        Acesso ao dashboard apenas após confirmação do pagamento.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payment;
