
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserData } from '../pages/LandingPage';

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
      // URL do webhook - você pode configurar isso
      const webhookUrl = 'https://webhook.site/your-webhook-url'; // Substitua pela sua URL
      
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
        title: "Aviso",
        description: "Dados salvos localmente. Continuando com o processo...",
      });
      // Continua o processo mesmo se o webhook falhar
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.company || !formData.area || !formData.email || !formData.whatsapp) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Enviar para webhook
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
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Vamos começar!
          </CardTitle>
          <p className="text-gray-600">
            Preencha seus dados para configurar sua secretária virtual com IA
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
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
                <Label htmlFor="company">Nome da Empresa *</Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Nome da sua empresa"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Área de Atuação *</Label>
              <Select value={formData.area} onValueChange={(value) => handleInputChange('area', value)}>
                <SelectTrigger>
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
                <Label htmlFor="email">E-mail *</Label>
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
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
              disabled={!formData.name || !formData.company || !formData.area || !formData.email || !formData.whatsapp || isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Continuar para Planos'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserForm;
