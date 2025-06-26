
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Bot, QrCode, Phone, RefreshCw, Smartphone } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import QRCodeConnection from '@/components/QRCodeConnection';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatbotConfig {
  id: string;
  bot_name: string;
  service_type: string;
  tone: string;
  evo_instance_id: string | null;
  real_instance_id: string | null;
  phone_number: string | null;
  evolution_phone: string | null;
  connection_status: string | null;
  is_active: boolean;
}

interface WhatsAppStatusSectionProps {
  chatbots: ChatbotConfig[];
  onRefresh: () => void;
  loading: boolean;
}

interface InstanceStatus {
  instanceName: string;
  isConnected: boolean;
  phone: string | null;
  lastCheck: Date | null;
  isLoading: boolean;
}

const WhatsAppStatusSection = ({ chatbots, onRefresh, loading }: WhatsAppStatusSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedInstanceName, setSelectedInstanceName] = useState<string>('');
  const [instanceStatuses, setInstanceStatuses] = useState<Record<string, InstanceStatus>>({});

  const API_KEY = '09d18f5a0aa248bebdb35893efeb170e';
  const EVOLUTION_BASE_URL = 'https://leoevo.techcorps.com.br';

  // Get unique instance names from chatbots
  const instanceNames = useMemo(() => {
    const names = chatbots
      .map(bot => bot.evo_instance_id || bot.real_instance_id)
      .filter((name): name is string => !!name);
    return [...new Set(names)];
  }, [chatbots]);

  const checkEvolutionConnection = async (instanceName: string): Promise<{isConnected: boolean, phone?: string}> => {
    try {
      console.log('🔍 Verificando conexão da instância:', instanceName);
      
      const response = await fetch(`${EVOLUTION_BASE_URL}/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Status da conexão recebido:', data);
        
        const connectionState = data.state || data.instance?.state;
        const isConnected = connectionState === 'open';
        const phone = data.instance?.phone || data.phone || null;
        
        console.log('✅ Estado da conexão:', {
          connectionState,
          isConnected,
          phone,
          instanceName
        });
        
        return { isConnected, phone };
      } else {
        console.warn('⚠️ Erro na resposta da API:', response.status);
        return { isConnected: false };
      }
      
    } catch (error) {
      console.warn('⚠️ Erro ao verificar conexão Evolution:', error);
      return { isConnected: false };
    }
  };

  const updateConnectionStatus = async (instanceName: string, isConnected: boolean, phone?: string) => {
    if (!user) return;

    try {
      console.log('💾 Atualizando status no Supabase:', { instanceName, isConnected, phone });
      
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          connection_status: isConnected ? 'connected' : 'pending',
          instance_name: instanceName,
          instance_id: instanceName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.warn('⚠️ Erro ao atualizar perfil:', profileError);
      }

      const { error: configError } = await supabase
        .from('chatbot_configs')
        .update({
          connection_status: isConnected ? 'connected' : 'pending',
          evolution_phone: phone || null,
          evo_instance_id: instanceName,
          real_instance_id: instanceName,
          instance_name: instanceName,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (configError) {
        console.warn('⚠️ Erro ao atualizar config:', configError);
      }
      
      console.log('✅ Status atualizado no Supabase com sucesso');
    } catch (error) {
      console.error('💥 Erro ao atualizar status:', error);
    }
  };

  const refreshInstanceStatus = async (instanceName: string) => {
    setInstanceStatuses(prev => ({
      ...prev,
      [instanceName]: { 
        ...prev[instanceName], 
        instanceName,
        isConnected: false,
        phone: null,
        lastCheck: null,
        isLoading: true 
      }
    }));

    try {
      const evolutionStatus = await checkEvolutionConnection(instanceName);
      
      // Get current status from Supabase
      const { data: configData } = await supabase
        .from('chatbot_configs')
        .select('*')
        .eq('user_id', user.id)
        .eq('evo_instance_id', instanceName)
        .single();

      const currentlyConnected = configData?.connection_status === 'connected';
      const nowConnected = evolutionStatus.isConnected;

      // Update Supabase if status changed
      if (currentlyConnected !== nowConnected) {
        await updateConnectionStatus(instanceName, nowConnected, evolutionStatus.phone);
        
        if (nowConnected && evolutionStatus.phone && !currentlyConnected) {
          toast({
            title: "🎉 WhatsApp conectado automaticamente!",
            description: `Número: ${evolutionStatus.phone}`,
            duration: 5000,
          });
        }
      }

      setInstanceStatuses(prev => ({
        ...prev,
        [instanceName]: {
          instanceName,
          isConnected: evolutionStatus.isConnected,
          phone: evolutionStatus.phone || null,
          lastCheck: new Date(),
          isLoading: false
        }
      }));

    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      setInstanceStatuses(prev => ({
        ...prev,
        [instanceName]: {
          instanceName,
          isConnected: false,
          phone: null,
          lastCheck: new Date(),
          isLoading: false
        }
      }));
    }
  };

  const refreshAllStatuses = async () => {
    await Promise.all(instanceNames.map(name => refreshInstanceStatus(name)));
  };

  useEffect(() => {
    if (instanceNames.length > 0 && user) {
      refreshAllStatuses();
    }
  }, [instanceNames, user]);

  const formatPhoneBrazilian = (phone: string) => {
    if (!phone) return '';
    
    const numbers = phone.replace(/\D/g, '');
    
    if (numbers.length === 13 && numbers.startsWith('55')) {
      const ddd = numbers.substring(2, 4);
      const firstPart = numbers.substring(4, 9);
      const secondPart = numbers.substring(9, 13);
      return `+55 (${ddd}) ${firstPart}-${secondPart}`;
    }
    
    if (numbers.length === 11) {
      const ddd = numbers.substring(0, 2);
      const firstPart = numbers.substring(2, 7);
      const secondPart = numbers.substring(7, 11);
      return `+55 (${ddd}) ${firstPart}-${secondPart}`;
    }
    
    return phone;
  };

  const handleGenerateQRCode = (instanceName: string) => {
    setSelectedInstanceName(instanceName);
    setShowQRCode(true);
  };

  const handleConnectionSuccess = () => {
    setShowQRCode(false);
    refreshAllStatuses();
    onRefresh();
  };

  if (showQRCode && selectedInstanceName) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <QrCode className="h-5 w-5 mr-2" />
              Conectar WhatsApp
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setShowQRCode(false)}
            >
              Voltar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QRCodeConnection 
            instanceName={selectedInstanceName}
            onConnectionSuccess={handleConnectionSuccess}
            onSkip={() => setShowQRCode(false)}
          />
        </CardContent>
      </Card>
    );
  }

  if (chatbots.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            Status dos Chatbots
          </div>
          <Button 
            onClick={() => {
              refreshAllStatuses();
              onRefresh();
            }} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {chatbots.map((bot) => {
            const instanceName = bot.evo_instance_id || bot.real_instance_id;
            const status = instanceName ? instanceStatuses[instanceName] : null;
            
            const isReallyConnected = status?.isConnected || false;
            const evolutionPhone = status?.phone;
            
            return (
              <div key={bot.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#FF914C] rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{bot.bot_name}</h4>
                    <p className="text-sm text-gray-600">{bot.service_type} • {bot.tone}</p>
                    
                    {(evolutionPhone || bot.evolution_phone) && (
                      <p className="text-xs text-green-600 flex items-center font-semibold">
                        <Phone className="h-3 w-3 mr-1" />
                        {formatPhoneBrazilian(evolutionPhone || bot.evolution_phone || '')}
                      </p>
                    )}
                    
                    {instanceName && (
                      <div className="text-xs text-gray-400 mt-1">
                        <p className="font-mono">Instância: {instanceName}</p>
                        {status && status.lastCheck && (
                          <p className="text-xs">
                            Verificado: {status.lastCheck.toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right space-y-2">
                  <Badge className={`${
                    isReallyConnected 
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {isReallyConnected ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Conectado
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Desconectado
                      </>
                    )}
                  </Badge>
                  
                  {!isReallyConnected && instanceName && (
                    <div className="space-y-1">
                      <Button 
                        onClick={() => handleGenerateQRCode(instanceName)}
                        disabled={loading || status?.isLoading}
                        size="sm"
                        className="w-full bg-[#FF914C] hover:bg-[#FF7A2B]"
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        Conectar WhatsApp
                      </Button>
                    </div>
                  )}
                  
                  {isReallyConnected && (
                    <div className="bg-green-50 p-2 rounded text-xs text-green-800">
                      <div className="flex items-center">
                        <Smartphone className="h-3 w-3 mr-1" />
                        <span className="font-semibold">WhatsApp Ativo</span>
                      </div>
                      {evolutionPhone && (
                        <p className="mt-1 font-mono text-xs">
                          {formatPhoneBrazilian(evolutionPhone)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppStatusSection;
