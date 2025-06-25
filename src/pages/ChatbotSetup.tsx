
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import BackButton from '@/components/BackButton';
import QRCodeConnection from '@/components/QRCodeConnection';

interface ChatbotConfig {
  nome_da_IA: string;
  empresa: string;
  nicho: string;
  identidade: string;
  personalidade: string;
  objetivo: string;
  regras: string;
  fluxo: string;
  funcionalidades: string[];
  nome_instancia: string;
}

const ChatbotSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  
  const userData = location.state?.userData;
  const isNewRegistration = location.state?.paymentConfirmed;
  
  const [config, setConfig] = useState<ChatbotConfig>({
    nome_da_IA: '',
    empresa: '',
    nicho: '',
    identidade: 'Secretária virtual',
    personalidade: '',
    objetivo: '',
    regras: '',
    fluxo: '',
    funcionalidades: [],
    nome_instancia: ''
  });

  // Determinar se é edição baseado no usuário logado
  useEffect(() => {
    if (user && !isNewRegistration) {
      setIsEditing(true);
      console.log('🔄 Usuário logado acessando para editar chatbot...');
    }
  }, [user, isNewRegistration]);

  // Carregar configuração existente se usuário estiver editando
  useEffect(() => {
    const loadExistingConfig = async () => {
      if (isEditing && user) {
        try {
          console.log('🔍 Buscando configuração existente para usuário:', user.id);
          
          const { data: configs, error } = await supabase
            .from('chatbot_configs')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .limit(1);

          if (error) {
            console.error('❌ Erro ao buscar configuração:', error);
            return;
          }

          if (configs && configs.length > 0) {
            const existingConfig = configs[0];
            console.log('📋 Configuração existente encontrada:', existingConfig);
            
            setConfig({
              nome_da_IA: existingConfig.bot_name || '',
              empresa: existingConfig.service_type || '',
              nicho: existingConfig.service_type || '',
              identidade: 'Secretária virtual',
              personalidade: existingConfig.tone || '',
              objetivo: '',
              regras: '',
              fluxo: '',
              funcionalidades: [],
              nome_instancia: existingConfig.evo_instance_id || ''
            });
          } else {
            console.log('📝 Nenhuma configuração encontrada, iniciando nova configuração');
          }
        } catch (error) {
          console.error('❌ Erro ao carregar configuração:', error);
        }
      }
    };

    loadExistingConfig();
  }, [isEditing, user]);

  // Verificar se é novo registro SEM dados (apenas para novos registros)
  useEffect(() => {
    if (isNewRegistration && !userData) {
      toast({
        title: "Dados necessários",
        description: "Você precisa preencher os dados pessoais primeiro.",
        variant: "destructive",
      });
      navigate('/payment');
    }
  }, [isNewRegistration, userData, navigate, toast]);

  // Gerar nome da instância automaticamente (sem espaços)
  useEffect(() => {
    if (config.nome_da_IA && config.empresa) {
      const nomeInstancia = `${config.nome_da_IA}-${config.empresa}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      setConfig(prev => ({ ...prev, nome_instancia: nomeInstancia }));
    }
  }, [config.nome_da_IA, config.empresa]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    if (isEditing) {
      await updateExistingConfig();
    } else {
      await createNewConfig();
    }
  };

  const updateExistingConfig = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('🔄 Atualizando configuração existente para usuário:', user.id);

      const { error } = await supabase
        .from('chatbot_configs')
        .update({
          bot_name: config.nome_da_IA,
          service_type: config.nicho,
          tone: config.personalidade,
          evo_instance_id: config.nome_instancia,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('❌ Erro ao atualizar configuração:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a configuração.",
          variant: "destructive",
        });
        return;
      }

      // Atualizar também o perfil do usuário com a instância
      await supabase
        .from('user_profiles')
        .update({
          instance_id: config.nome_instancia,
          instance_name: config.nome_instancia,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      console.log('✅ Configuração atualizada com sucesso');

      toast({
        title: "Sucesso!",
        description: "Configuração do chatbot atualizada com sucesso.",
      });

      // Mostrar QR Code se tiver nome da instância
      if (config.nome_instancia) {
        setShowQRCode(true);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar configuração:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewConfig = async () => {
    if (!user) {
      console.error('❌ Usuário não encontrado');
      toast({
        title: "Erro",
        description: "Usuário não logado.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log('🚀 Iniciando criação de nova configuração...');
      console.log('👤 User ID:', user.id);
      console.log('🤖 Config dados:', config);

      // Validar dados obrigatórios
      if (!config.nome_da_IA || !config.empresa || !config.nicho || !config.personalidade) {
        console.error('❌ Dados obrigatórios faltando');
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios.",
          variant: "destructive",
        });
        return;
      }

      // Primeiro: Criar configuração do chatbot
      console.log('💾 Salvando configuração do chatbot...');
      const chatbotData = {
        user_id: user.id,
        bot_name: config.nome_da_IA,
        service_type: config.nicho,
        tone: config.personalidade,
        evo_instance_id: config.nome_instancia,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📤 Dados sendo enviados para chatbot_configs:', chatbotData);

      const { data: chatbotResult, error: chatbotError } = await supabase
        .from('chatbot_configs')
        .insert(chatbotData)
        .select()
        .single();

      if (chatbotError) {
        console.error('❌ Erro detalhado ao criar chatbot:', chatbotError);
        toast({
          title: "Erro ao salvar chatbot",
          description: `Erro: ${chatbotError.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Chatbot salvo com sucesso:', chatbotResult);

      // Segundo: Atualizar perfil do usuário
      console.log('👤 Atualizando perfil do usuário...');
      const profileData = {
        instance_id: config.nome_instancia,
        instance_name: config.nome_instancia,
        updated_at: new Date().toISOString()
      };

      console.log('📤 Dados sendo enviados para user_profiles:', profileData);

      const { error: profileError } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('id', user.id);

      if (profileError) {
        console.error('⚠️ Erro ao atualizar perfil:', profileError);
        // Não falha se der erro no perfil, pois o chatbot foi criado
      } else {
        console.log('✅ Perfil do usuário atualizado com sucesso');
      }

      // Terceiro: Verificar se dados foram salvos
      console.log('🔍 Verificando dados salvos...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('chatbot_configs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (verifyError) {
        console.error('❌ Erro ao verificar dados:', verifyError);
      } else {
        console.log('✅ Dados verificados no banco:', verifyData);
      }

      toast({
        title: "Sucesso!",
        description: "Chatbot criado e salvo com sucesso!",
      });

      // Mostrar QR Code para conectar WhatsApp
      if (config.nome_instancia) {
        setShowQRCode(true);
      } else {
        navigate('/dashboard');
      }

    } catch (error) {
      console.error('❌ Erro geral ao criar configuração:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao criar o chatbot.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQRConnectionSuccess = () => {
    toast({
      title: "WhatsApp conectado!",
      description: "Seu chatbot está pronto para uso.",
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BackButton />
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/0cf142c2-da7d-452c-a8d8-0413cfb6c023.png" 
                  alt="Techcorps" 
                  className="h-8 w-auto"
                />
                <h1 className="text-xl font-bold text-black">
                  {isEditing ? 'Editar Chatbot' : 'Configurar Chatbot'}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Debug Info para desenvolvimento */}
          {user && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">🔧 Info de Debug:</h3>
              <div className="text-xs text-blue-700 space-y-1">
                <div><strong>User ID:</strong> {user.id}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Is Editing:</strong> {isEditing ? 'Sim' : 'Não'}</div>
                <div><strong>Is New Registration:</strong> {isNewRegistration ? 'Sim' : 'Não'}</div>
                <div><strong>Nome da IA:</strong> {config.nome_da_IA || 'Vazio'}</div>
                <div><strong>Empresa:</strong> {config.empresa || 'Vazio'}</div>
                <div><strong>Instance Name:</strong> {config.nome_instancia || 'Vazio'}</div>
              </div>
            </div>
          )}

          {/* Mostrar QR Code se solicitado */}
          {showQRCode && config.nome_instancia && (
            <div className="mb-8">
              <QRCodeConnection 
                instanceName={config.nome_instancia}
                onConnectionSuccess={handleQRConnectionSuccess}
              />
            </div>
          )}

          {/* Progress Steps - apenas para novos registros */}
          {!isEditing && !showQRCode && (
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep ? 'bg-[#FF914C] text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-[#FF914C]' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {!showQRCode && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="h-5 w-5" />
                  <span>
                    {isEditing ? 'Editar Configurações' : (
                      currentStep === 1 ? 'Informações Básicas' :
                      currentStep === 2 ? 'Configuração Avançada' :
                      'Resumo e Finalização'
                    )}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Renderizar formulário baseado no step atual ou modo de edição */}
                {(currentStep === 1 || isEditing) && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="nome_da_IA">Nome da sua IA *</Label>
                      <Input
                        id="nome_da_IA"
                        value={config.nome_da_IA}
                        onChange={(e) => setConfig({ ...config, nome_da_IA: e.target.value })}
                        placeholder="Ex: Assistente Nina, Agatha, Sofia"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="empresa">Nome da empresa *</Label>
                      <Input
                        id="empresa"
                        value={config.empresa}
                        onChange={(e) => setConfig({ ...config, empresa: e.target.value })}
                        placeholder="Ex: Clínica São Paulo, TechCorps"
                        required
                      />
                    </div>

                    {config.nome_instancia && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <Label className="text-sm font-medium text-blue-800">Nome da Instância (Gerado Automaticamente)</Label>
                        <p className="text-blue-700 font-mono text-sm mt-1">{config.nome_instancia}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          Este será o identificador único da sua IA no WhatsApp
                        </p>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="nicho">Nicho/Área de atuação *</Label>
                      <Select value={config.nicho} onValueChange={(value) => setConfig({ ...config, nicho: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione sua área de atuação" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clinica">Clínica Médica</SelectItem>
                          <SelectItem value="estetica">Estética</SelectItem>
                          <SelectItem value="advocacia">Advocacia</SelectItem>
                          <SelectItem value="consultoria">Consultoria</SelectItem>
                          <SelectItem value="restaurante">Restaurante</SelectItem>
                          <SelectItem value="loja">Loja/E-commerce</SelectItem>
                          <SelectItem value="servicos">Prestação de Serviços</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="personalidade">Personalidade da IA *</Label>
                      <Select value={config.personalidade} onValueChange={(value) => setConfig({ ...config, personalidade: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Como sua IA deve se comportar?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="formal">Formal e profissional</SelectItem>
                          <SelectItem value="amigavel">Amigável e descontraído</SelectItem>
                          <SelectItem value="divertida">Descontraída e divertida, com emojis</SelectItem>
                          <SelectItem value="tecnico">Técnico e detalhado</SelectItem>
                          <SelectItem value="caloroso">Caloroso e acolhedor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {currentStep === 2 && !isEditing && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="objetivo">Objetivo principal da IA</Label>
                      <Textarea
                        id="objetivo"
                        value={config.objetivo}
                        onChange={(e) => setConfig({ ...config, objetivo: e.target.value })}
                        placeholder="Ex: Atender clientes, agendar consultas, fornecer informações sobre serviços..."
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="regras">Regras e restrições</Label>
                      <Textarea
                        id="regras"
                        value={config.regras}
                        onChange={(e) => setConfig({ ...config, regras: e.target.value })}
                        placeholder="Ex: Não dar conselhos médicos, sempre solicitar confirmação para agendamentos..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="fluxo">Fluxo de atendimento</Label>
                      <Textarea
                        id="fluxo"
                        value={config.fluxo}
                        onChange={(e) => setConfig({ ...config, fluxo: e.target.value })}
                        placeholder="Ex: Saudação → Identificar necessidade → Agendar → Confirmar dados..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Funcionalidades (selecione as que deseja)</Label>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {[
                          'Planilha de dados',
                          'Agendamentos',
                          'Cadastro de clientes',
                          'Lembretes automáticos',
                          'Relatórios',
                          'Integração CRM'
                        ].map((func) => (
                          <label key={func} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={config.funcionalidades.includes(func)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setConfig({
                                    ...config,
                                    funcionalidades: [...config.funcionalidades, func]
                                  });
                                } else {
                                  setConfig({
                                    ...config,
                                    funcionalidades: config.funcionalidades.filter(f => f !== func)
                                  });
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">{func}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && !isEditing && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Configuração Concluída!</h3>
                      <p className="text-gray-600 mb-6">
                        Seu chatbot está pronto. Aqui está um resumo das configurações:
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div><span className="font-medium">Nome da IA:</span> {config.nome_da_IA || 'Não informado'}</div>
                      <div><span className="font-medium">Empresa:</span> {config.empresa || 'Não informado'}</div>
                      <div><span className="font-medium">Instância:</span> <code className="bg-gray-200 px-2 py-1 rounded text-sm">{config.nome_instancia}</code></div>
                      <div><span className="font-medium">Nicho:</span> {config.nicho || 'Não informado'}</div>
                      <div><span className="font-medium">Personalidade:</span> {config.personalidade || 'Não informado'}</div>
                      <div><span className="font-medium">Funcionalidades:</span> {config.funcionalidades.join(', ') || 'Nenhuma selecionada'}</div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  {!isEditing && currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      Anterior
                    </Button>
                  )}

                  <Button
                    onClick={handleFinish}
                    disabled={loading || !config.nome_da_IA || !config.empresa || !config.nicho || !config.personalidade}
                    className="bg-[#FF914C] hover:bg-[#FF7A2B] text-white px-8 ml-auto"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isEditing ? 'Salvando...' : 'Criando chatbot...'}
                      </>
                    ) : (
                      isEditing ? 'Salvar e Conectar WhatsApp' : 
                      currentStep === 3 ? 'Criar Chatbot' : 'Próximo'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChatbotSetup;
