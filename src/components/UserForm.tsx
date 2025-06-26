
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, User, Briefcase, Phone, Mail, Loader2, Server } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserFormData {
  name: string;
  email: string;
  company: string;
  area: string;
  whatsapp: string;
  instance_id: string;
  instance_name: string;
}

const UserForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    company: '',
    area: '',
    whatsapp: '',
    instance_id: '',
    instance_name: ''
  });

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4');
  };

  const validatePhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length >= 10 && numbers.length <= 13;
  };

  const validateInstanceId = (instanceId: string) => {
    // Instance ID deve ter pelo menos 3 caracteres e não conter espaços
    return instanceId.length >= 3 && !/\s/.test(instanceId);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, whatsapp: formatted }));
  };

  const handleInstanceIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remover espaços e caracteres especiais, manter apenas letras, números e underscores
    const cleanValue = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '');
    setFormData(prev => ({ 
      ...prev, 
      instance_id: cleanValue,
      instance_name: cleanValue // Usar o mesmo valor para instance_name
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhone(formData.whatsapp)) {
      toast({
        title: "Telefone inválido",
        description: "Por favor, insira um número de telefone válido.",
        variant: "destructive",
      });
      return;
    }

    if (!validateInstanceId(formData.instance_id)) {
      toast({
        title: "Instance ID inválido",
        description: "Instance ID deve ter pelo menos 3 caracteres e não conter espaços.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔄 Iniciando cadastro com dados:', formData);
      
      // Cadastrar usuário no Supabase Auth com TODOS os dados no metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: 'temp_password_123', // Senha temporária
        options: {
          data: {
            name: formData.name,
            company: formData.company,
            area: formData.area,
            whatsapp: formData.whatsapp,
            instance_id: formData.instance_id, // IMPORTANTE: Instance ID no metadata
            instance_name: formData.instance_name
          }
        }
      });

      if (authError) {
        console.error('❌ Erro no cadastro:', authError);
        toast({
          title: "Erro no cadastro",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Usuário cadastrado:', authData);
      console.log('🎯 Instance ID capturado:', formData.instance_id);

      // Verificar se o perfil foi criado automaticamente pelo trigger
      if (authData.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          console.warn('⚠️ Erro ao verificar perfil:', profileError);
        } else {
          console.log('✅ Perfil criado automaticamente:', profileData);
        }

        // Criar configuração inicial do chatbot com Instance ID
        const { error: configError } = await supabase
          .from('chatbot_configs')
          .insert({
            user_id: authData.user.id,
            bot_name: `Bot ${formData.company}`,
            service_type: 'WhatsApp',
            tone: 'Profissional',
            evo_instance_id: formData.instance_id,
            real_instance_id: formData.instance_id,
            instance_name: formData.instance_name,
            is_active: true,
            connection_status: 'pending',
            webhook_url: `https://leowebhook.techcorps.com.br/webhook/${formData.instance_id}`
          });

        if (configError) {
          console.error('❌ Erro ao criar config do chatbot:', configError);
        } else {
          console.log('✅ Configuração do chatbot criada com Instance ID:', formData.instance_id);
        }
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: `Instance ID ${formData.instance_id} capturado. Verifique seu email para ativar a conta.`,
        duration: 6000,
      });

      // Redirecionar para página de verificação de email
      navigate('/email-verification');

    } catch (error) {
      console.error('💥 Erro no processo de cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Complete seu Cadastro
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Preencha os dados abaixo para configurar sua conta e Instance ID
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Dados Pessoais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    required
                    value={formData.whatsapp}
                    onChange={handlePhoneChange}
                    placeholder="(11) 99999-9999"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Dados da Empresa */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Dados da Empresa
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Nome da Empresa *</Label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Nome da sua empresa"
                  />
                </div>
                
                <div>
                  <Label htmlFor="area">Área de Atuação *</Label>
                  <Input
                    id="area"
                    name="area"
                    type="text"
                    required
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="Ex: Saúde, Tecnologia, Vendas"
                  />
                </div>
              </div>
            </div>

            {/* Configuração da Instância */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Server className="h-5 w-5 mr-2" />
                Configuração da Instância WhatsApp
              </h3>
              
              <div>
                <Label htmlFor="instance_id">Instance ID *</Label>
                <div className="relative">
                  <Server className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="instance_id"
                    name="instance_id"
                    type="text"
                    required
                    value={formData.instance_id}
                    onChange={handleInstanceIdChange}
                    placeholder="ex: minha_empresa_bot"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Identificador único para sua instância WhatsApp. Use apenas letras, números, traços e underscores.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#FF914C] hover:bg-[#FF7A2B] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                'Finalizar Cadastro'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserForm;
