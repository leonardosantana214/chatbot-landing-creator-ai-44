
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserData } from '../pages/LandingPage';
import { Shield, CheckCircle, Users } from 'lucide-react';

interface UserFormProps {
  onSubmit: (data: UserData) => void;
  initialData: UserData;
  isVisible: boolean;
}

const UserForm = ({ onSubmit, initialData, isVisible }: UserFormProps) => {
  const [formData, setFormData] = useState<UserData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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

  const sendToWebhook = async (data: UserData) => {
    try {
      const webhookUrl = 'https://webhook.site/your-webhook-url';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          source: 'IA Secretary Landing Page'
        }),
      });

      if (response.ok) {
        console.log('Dados enviados para webhook com sucesso:', data);
        toast({
          title: "Sucesso!",
          description: "Seus dados foram enviados com sucesso.",
        });
        return true;
      } else {
        throw new Error('Falha ao enviar dados para o webhook');
      }
    } catch (error) {
      console.error('Erro ao enviar para webhook:', error);
      toast({
        title: "Dados salvos!",
        description: "Continuando com o processo de configuração...",
      });
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.company || !formData.area || !formData.email || !formData.whatsapp) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const webhookSuccess = await sendToWebhook(formData);
    
    if (webhookSuccess) {
      onSubmit(formData);
    }

    setIsSubmitting(false);
  };

  const handleInputChange = (field: keyof UserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isVisible) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Benefits sidebar */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-black mb-6">Por que escolher nossa IA?</h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-6 w-6 text-black mt-1" />
              <div>
                <h4 className="font-semibold text-black">100% Seguro</h4>
                <p className="text-sm text-gray-600">Seus dados protegidos com criptografia</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-black mt-1" />
              <div>
                <h4 className="font-semibold text-black">Setup Rápido</h4>
                <p className="text-sm text-gray-600">Em funcionamento em menos de 5 minutos</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Users className="h-6 w-6 text-black mt-1" />
              <div>
                <h4 className="font-semibold text-black">Suporte 24/7</h4>
                <p className="text-sm text-gray-600">Nossa equipe está sempre disponível</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-sm text-gray-600 mb-2">💡 <strong>Dica:</strong></p>
            <p className="text-sm text-gray-600">
              Empresas que automatizam o atendimento aumentam as vendas em até 40%
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center bg-black text-white rounded-t-lg">
              <CardTitle className="text-3xl font-bold mb-2">
                Configure sua IA agora!
              </CardTitle>
              <p className="text-gray-300">
                Preencha seus dados para personalizar sua secretária virtual
              </p>
            </CardHeader>

            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-black">Nome Completo *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="border-gray-300 focus:border-black focus:ring-black"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-semibold text-black">Nome da Empresa *</Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="Nome da sua empresa"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="border-gray-300 focus:border-black focus:ring-black"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area" className="text-sm font-semibold text-black">Área de Atuação *</Label>
                  <Select value={formData.area} onValueChange={(value) => handleInputChange('area', value)}>
                    <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black">
                      <SelectValue placeholder="Selecione sua área de atuação" />
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

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-black">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="border-gray-300 focus:border-black focus:ring-black"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-sm font-semibold text-black">WhatsApp *</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                      className="border-gray-300 focus:border-black focus:ring-black"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-black hover:bg-gray-800 text-white text-lg py-6 font-semibold transition-all duration-200 transform hover:scale-105"
                    disabled={!formData.name || !formData.company || !formData.area || !formData.email || !formData.whatsapp || isSubmitting}
                  >
                    {isSubmitting ? 'Processando...' : 'Continuar para Planos →'}
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Ao continuar, você concorda com nossos termos de uso e política de privacidade
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
