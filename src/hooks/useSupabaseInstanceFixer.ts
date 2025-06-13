
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseInstanceFixer = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const API_KEY = '09d18f5a0aa248bebdb35893efeb170e';
  const EVOLUTION_BASE_URL = 'https://leoevo.techcorps.com.br';

  const getEvolutionInstanceData = async (instanceName: string): Promise<{instanceId: string, phone: string} | null> => {
    try {
      console.log('🔍 Buscando dados reais da instância Evolution:', instanceName);
      
      const response = await fetch(`${EVOLUTION_BASE_URL}/instance/fetch/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      console.log('📡 Status da resposta Evolution:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📡 DADOS COMPLETOS DA EVOLUTION:', JSON.stringify(data, null, 2));
        
        // Mostrar dados brutos na tela
        toast({
          title: "📡 DADOS BRUTOS DA EVOLUTION",
          description: `Dados: ${JSON.stringify(data).substring(0, 200)}...`,
          duration: 10000,
        });
        
        // Extrair instanceId - vamos tentar várias possibilidades
        let instanceId = '';
        
        if (data.instance?.instanceId) {
          instanceId = data.instance.instanceId;
        } else if (data.instanceId) {
          instanceId = data.instanceId;
        } else if (data.instance?.id) {
          instanceId = data.instance.id;
        } else if (data.id) {
          instanceId = data.id;
        } else if (data.instance?.key) {
          instanceId = data.instance.key;
        } else if (data.key) {
          instanceId = data.key;
        } else if (data.instance?.instanceName) {
          instanceId = data.instance.instanceName;
        } else if (data.instanceName) {
          instanceId = data.instanceName;
        } else {
          // Se não achou nada, usar o nome da instância mesmo
          instanceId = instanceName;
        }
        
        // Extrair telefone
        let evolutionPhone = '';
        if (data.instance?.phone) {
          evolutionPhone = data.instance.phone;
        } else if (data.phone) {
          evolutionPhone = data.phone;
        } else if (data.instance?.number) {
          evolutionPhone = data.instance.number;
        } else if (data.number) {
          evolutionPhone = data.number;
        } else if (data.instance?.phoneNumber) {
          evolutionPhone = data.instance.phoneNumber;
        } else if (data.phoneNumber) {
          evolutionPhone = data.phoneNumber;
        }
        
        const cleanPhone = evolutionPhone.replace(/\D/g, '');
        
        console.log('✅ Instance ID extraído:', instanceId);
        console.log('✅ Telefone extraído:', cleanPhone);
        
        // MOSTRAR NA TELA OS DADOS EXTRAÍDOS
        toast({
          title: "🎯 DADOS EXTRAÍDOS",
          description: `Instance ID: ${instanceId} | Telefone: ${cleanPhone}`,
          duration: 8000,
        });
        
        return {
          instanceId: instanceId,
          phone: cleanPhone
        };
      } else {
        console.error('❌ Erro na API Evolution:', response.status);
        const errorText = await response.text();
        console.error('❌ Erro detalhado:', errorText);
        
        toast({
          title: "❌ Erro na Evolution API",
          description: `Status: ${response.status} - ${errorText}`,
          variant: "destructive",
          duration: 8000,
        });
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar dados da Evolution:', error);
      toast({
        title: "❌ Erro de conexão",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
        duration: 8000,
      });
      return null;
    }
  };

  const fixCurrentUserData = async () => {
    if (!user?.id) {
      toast({
        title: "❌ Erro",
        description: "Usuário não está logado.",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log('🔧 Corrigindo dados do usuário logado:', user.id);
      
      // Buscar configurações do usuário logado
      const { data: userConfigs, error: fetchError } = await supabase
        .from('chatbot_configs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (fetchError) {
        console.error('❌ Erro ao buscar configurações:', fetchError);
        toast({
          title: "❌ Erro no Supabase",
          description: `Erro: ${fetchError.message}`,
          variant: "destructive",
        });
        return false;
      }

      if (!userConfigs || userConfigs.length === 0) {
        console.log('⚠️ Usuário não possui configurações ativas');
        toast({
          title: "⚠️ Aviso",
          description: "Você não possui configurações de chatbot ativas.",
        });
        return false;
      }

      console.log(`🔧 Encontradas ${userConfigs.length} configurações do usuário`);
      
      // MOSTRAR NA TELA AS CONFIGURAÇÕES ENCONTRADAS
      toast({
        title: "📋 Configurações encontradas",
        description: `${userConfigs.length} configurações ativas para o usuário`,
        duration: 5000,
      });
      
      let fixedCount = 0;
      
      for (const config of userConfigs) {
        const instanceName = config.evo_instance_id;
        
        if (!instanceName) {
          console.log('⚠️ Configuração sem evo_instance_id, pulando...');
          continue;
        }
        
        console.log(`🔧 Processando instância: ${instanceName}`);
        
        // MOSTRAR NA TELA QUAL INSTÂNCIA ESTÁ SENDO PROCESSADA
        toast({
          title: "🔧 Processando instância",
          description: `Instância: ${instanceName}`,
          duration: 3000,
        });
        
        // Buscar dados reais da Evolution
        const evolutionData = await getEvolutionInstanceData(instanceName);
        
        if (evolutionData) {
          const { instanceId, phone } = evolutionData;
          
          console.log(`🔄 Dados obtidos - ID: ${instanceId}, Tel: ${phone}`);
          
          // MOSTRAR OS DADOS QUE SERÃO SALVOS
          toast({
            title: "💾 Salvando dados",
            description: `Novo User ID: ${instanceId} | Tel: ${phone}`,
            duration: 5000,
          });
          
          // Atualizar configuração com o instance_id real como user_id
          const { error: updateError } = await supabase
            .from('chatbot_configs')
            .update({
              user_id: instanceId, // USAR INSTANCE_ID COMO USER_ID
              phone_number: phone || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', config.id);

          if (updateError) {
            console.error(`❌ Erro ao atualizar configuração ${config.id}:`, updateError);
            toast({
              title: "❌ Erro ao atualizar",
              description: `Erro: ${updateError.message}`,
              variant: "destructive",
            });
          } else {
            console.log(`✅ Configuração atualizada: user_id agora é ${instanceId}`);
            
            // Atualizar mensagens relacionadas
            const { error: msgUpdateError } = await supabase
              .from('mensagens')
              .update({
                user_id: instanceId,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', user.id);

            if (msgUpdateError) {
              console.error('❌ Erro ao atualizar mensagens:', msgUpdateError);
            } else {
              console.log('✅ Mensagens atualizadas com novo user_id');
            }
            
            fixedCount++;
            
            // Mostrar sucesso individual
            toast({
              title: "✅ Registro corrigido!",
              description: `Config ${config.id} atualizada com Instance ID: ${instanceId}`,
              duration: 5000,
            });
          }
        } else {
          console.log(`❌ Não foi possível obter dados para: ${instanceName}`);
          toast({
            title: "❌ Falha ao obter dados",
            description: `Instância: ${instanceName} - dados não encontrados`,
            variant: "destructive",
          });
        }
      }
      
      if (fixedCount > 0) {
        toast({
          title: "🔧 Correção aplicada!",
          description: `${fixedCount} registros foram corrigidos com Instance ID real.`,
        });
      } else {
        toast({
          title: "❌ Nenhuma correção aplicada",
          description: "Não foi possível corrigir nenhum registro.",
          variant: "destructive",
        });
      }
      
      console.log(`✅ Correção do usuário concluída: ${fixedCount} registros corrigidos`);
      return true;
    } catch (error) {
      console.error('💥 Erro ao corrigir dados do usuário:', error);
      toast({
        title: "❌ Erro na correção",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    fixCurrentUserData,
    getEvolutionInstanceData,
  };
};
