
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CreditCard, Shield, Check, QrCode, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  
  const selectedPlan = location.state?.plan || {
    name: 'Profissional',
    price: 'R$ 79',
    originalPrice: 'R$ 99',
    features: [
      'Até 2.000 mensagens/mês',
      'IA avançada com contexto',
      'Agendamento automatizado',
      'Suporte prioritário',
      'Relatórios detalhados',
      'Múltiplos operadores'
    ]
  };

  const [customerData, setCustomerData] = useState({
    email: '',
    cpf: '',
    name: '',
    phone: ''
  });

  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    holderName: ''
  });

  const handlePixPayment = async () => {
    setLoading(true);
    
    try {
      // Simular criação de pagamento PIX no Mercado Pago
      toast({
        title: "PIX gerado com sucesso!",
        description: "Escaneie o QR Code ou copie o código PIX para finalizar o pagamento.",
      });
      
      // Em produção, aqui seria feita a integração real com o MP
      // e o usuário seria redirecionado após confirmação do pagamento
      setTimeout(() => {
        setLoading(false);
        toast({
          title: "Pagamento confirmado!",
          description: "Redirecionando para criação da conta...",
        });
        
        setTimeout(() => {
          navigate('/chatbot-setup', { 
            state: { paymentConfirmed: true, plan: selectedPlan.name } 
          });
        }, 2000);
      }, 3000);
    } catch (error) {
      setLoading(false);
      toast({
        title: "Erro no pagamento",
        description: "Tente novamente ou escolha outra forma de pagamento.",
        variant: "destructive"
      });
    }
  };

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simular processamento de cartão no Mercado Pago
      toast({
        title: "Processando pagamento...",
        description: "Aguarde a confirmação da transação.",
      });
      
      setTimeout(() => {
        setLoading(false);
        toast({
          title: "Pagamento aprovado!",
          description: "Redirecionando para criação da conta...",
        });
        
        setTimeout(() => {
          navigate('/chatbot-setup', { 
            state: { paymentConfirmed: true, plan: selectedPlan.name } 
          });
        }, 2000);
      }, 4000);
    } catch (error) {
      setLoading(false);
      toast({
        title: "Pagamento recusado",
        description: "Verifique os dados do cartão e tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleBoletoPayment = async () => {
    setLoading(true);
    
    try {
      toast({
        title: "Boleto gerado!",
        description: "O boleto será exibido em uma nova aba. O acesso será liberado em até 2 dias úteis após o pagamento.",
      });
      
      // Simular geração de boleto
      setTimeout(() => {
        setLoading(false);
        // Em produção, abriria o PDF do boleto em nova aba
        window.open('data:text/plain;charset=utf-8,Boleto%20Banc%C3%A1rio%20-%20Mercado%20Pago', '_blank');
      }, 2000);
    } catch (error) {
      setLoading(false);
      toast({
        title: "Erro ao gerar boleto",
        description: "Tente novamente ou escolha outra forma de pagamento.",
        variant: "destructive"
      });
    }
  };

  const planPrice = selectedPlan.originalPrice || selectedPlan.price;
  const planValue = parseInt(planPrice.replace(/[^\d]/g, ''));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
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
                    {planPrice}/mês
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
                    <span className="text-[#FF914C]">{planPrice}/mês</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Cobrança mensal • Cancele a qualquer momento
                  </p>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">
                    🔒 Pagamento 100% seguro via Mercado Pago
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Dados protegidos com criptografia SSL
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
                  Pagamento via Mercado Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pix">PIX (Recomendado)</TabsTrigger>
                    <TabsTrigger value="credit">Cartão de Crédito</TabsTrigger>
                    <TabsTrigger value="boleto">Boleto</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pix" className="space-y-6">
                    <div className="text-center space-y-6">
                      <div className="flex items-center justify-center space-x-2">
                        <QrCode className="h-6 w-6 text-[#FF914C]" />
                        <h3 className="text-lg font-semibold">Pagamento via PIX</h3>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">✅ Aprovação Instantânea</h4>
                        <p className="text-sm text-green-700">
                          Pagamento processado e aprovado automaticamente. 
                          Acesso liberado em até 5 minutos.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="email">Email para recebimento do comprovante</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={customerData.email}
                            onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="cpf">CPF</Label>
                          <Input
                            id="cpf"
                            placeholder="000.000.000-00"
                            value={customerData.cpf}
                            onChange={(e) => setCustomerData({...customerData, cpf: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <Button 
                        onClick={handlePixPayment}
                        className="w-full bg-[#FF914C] hover:bg-[#FF7A2B] text-white py-3"
                        disabled={loading || !customerData.email || !customerData.cpf}
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Gerando PIX...
                          </>
                        ) : (
                          <>
                            <QrCode className="mr-2 h-4 w-4" />
                            Gerar PIX - {planPrice}
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="credit" className="space-y-6">
                    <form onSubmit={handleCardPayment} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={customerData.email}
                            onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cpf">CPF</Label>
                          <Input
                            id="cpf"
                            placeholder="000.000.000-00"
                            value={customerData.cpf}
                            onChange={(e) => setCustomerData({...customerData, cpf: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="cardNumber">Número do Cartão</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardData.number}
                          onChange={(e) => setCardData({...cardData, number: e.target.value})}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="holderName">Nome no Cartão</Label>
                          <Input
                            id="holderName"
                            placeholder="João Silva"
                            value={cardData.holderName}
                            onChange={(e) => setCardData({...cardData, holderName: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Validade</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/AA"
                            value={cardData.expiry}
                            onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={cardData.cvv}
                            onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          🔐 <strong>Autenticação 3DS:</strong> Seu banco pode solicitar confirmação adicional para maior segurança.
                        </p>
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
                            Pagar {planPrice} no Cartão
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="boleto" className="space-y-6">
                    <div className="text-center space-y-6">
                      <div className="flex items-center justify-center space-x-2">
                        <FileText className="h-6 w-6 text-[#FF914C]" />
                        <h3 className="text-lg font-semibold">Boleto Bancário</h3>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-2">⏰ Prazo para Pagamento</h4>
                        <p className="text-sm text-yellow-700">
                          Boleto com vencimento em 3 dias úteis. 
                          Acesso liberado em até 2 dias úteis após confirmação do pagamento.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={customerData.email}
                            onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="cpf">CPF</Label>
                          <Input
                            id="cpf"
                            placeholder="000.000.000-00"
                            value={customerData.cpf}
                            onChange={(e) => setCustomerData({...customerData, cpf: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <Button 
                        onClick={handleBoletoPayment}
                        className="w-full bg-[#FF914C] hover:bg-[#FF7A2B] text-white py-3"
                        disabled={loading || !customerData.email || !customerData.cpf}
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Gerando Boleto...
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            Gerar Boleto - {planPrice}
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="bg-blue-50 p-4 rounded-lg mt-6">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Pagamento Seguro - Mercado Pago</h4>
                      <p className="text-sm text-blue-800">
                        Seus dados são protegidos com criptografia SSL e tecnologia anti-fraude. 
                        Acesso ao sistema liberado automaticamente após confirmação.
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
