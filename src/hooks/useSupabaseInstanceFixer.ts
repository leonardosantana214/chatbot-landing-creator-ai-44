
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
      
      // USAR O ENDPOINT CORRETO QUE JÁ FUNCIONA - fetchInstances
      const response = await fetch(`${EVOLUTION_BASE_URL}/instance/fetchInstances?instanceName=${instanceName}`, {
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
          description: `Resposta: ${JSON.stringify(data).substring(0, 200)}...`,
          duration: 15000,
        });
        
        // CAPTURAR O ID REAL - baseado no endpoint fetchInstances
        let instanceId = '';
        let evolutionPhone = '';
        
        // Verificar se é array (resposta do fetchInstances)
        if (Array.isArray(data) && data.length > 0) {
          const instanceData = data[0];
          instanceId = instanceData.id || instanceData.instanceId || instanceData.instanceName || instanceName;
          evolutionPhone = instanceData.number || instanceData.phone || instanceData.phoneNumber || '';
        }
        // Se não é array, verificar estrutura direta
        else if (data.id) {
          instanceId = data.id;
          evolutionPhone = data.number || data.phone || data.phoneNumber || '';
        }
        // Fallback para outras estruturas
        else if (data.instance?.id) {
          instanceId = data.instance.id;
          evolutionPhone = data.instance.phone || data.instance.number || '';
        } else if (data.instanceId) {
          instanceId = data.instanceId;
          evolutionPhone = data.phone || data.number || '';
        } else {
          // Último recurso - usar o nome da instância
          instanceId = instanceName;
        }
        
        const cleanPhone = evolutionPhone.replace(/\D/g, '');
        
        console.log('✅ Instance ID REAL extraído:', instanceId);
        console.log('✅ Telefone extraído:', cleanPhone);
        
        // MOSTRAR NA TELA OS DADOS EXTRAÍDOS COM DESTAQUE
        toast({
          title: "🎯 ID REAL CAPTURADO!",
          description: `Instance ID: ${instanceId} | Telefone: ${cleanPhone}`,
          duration: 12000,
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
          description: `Status: ${response.status} - Tentando endpoint alternativo...`,
          variant: "destructive",
          duration: 8000,
        });

        // TENTAR ENDPOINT ALTERNATIVO - connectionState
        try {
          console.log('🔄 Tentando endpoint alternativo connectionState...');
          const altResponse = await fetch(`${EVOLUTION_BASE_URL}/instance/connectionState/${instanceName}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'apikey': API_KEY,
            },
          });

          if (altResponse.ok) {
            const altData = await altResponse.json();
            console.log('📡 Dados do endpoint alternativo:', altData);
            
            toast({
              title: "📡 ENDPOINT ALTERNATIVO FUNCIONOU",
              description: `Dados: ${JSON.stringify(altData).substring(0, 200)}...`,
              duration: 10000,
            });

            // Extrair dados do endpoint connectionState
            const instanceData = altData.instance || altData;
            const instanceId = instanceData.instanceName || instanceData.id || instanceName;
            
            // Para este endpoint, o telefone pode não estar disponível
            return {
              instanceId: instanceId,
              phone: '' // Deixar vazio se não encontrar
            };
          }
        } catch (altError) {
          console.error('❌ Erro no endpoint alternativo:', altError);
        }
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
        
        toast({
          title: "🔧 Buscando dados reais da instância",
          description: `Instância: ${instanceName}`,
          duration: 3000,
        });
        
        // Buscar dados reais da Evolution
        const evolutionData = await getEvolutionInstanceData(instanceName);
        
        if (evolutionData) {
          const { instanceId, phone } = evolutionData;
          
          console.log(`🔄 Dados obtidos - ID REAL: ${instanceId}, Tel: ${phone}`);
          
          // Verificar se o ID é válido (não é o nome da instância nem vazio)
          if (instanceId && instanceId !== instanceName && instanceId.length > 10) {
            toast({
              title: "💾 Atualizando registro no Supabase",
              description: `Atualizando com Instance ID: ${instanceId} | Tel: ${phone}`,
              duration: 5000,
            });
            
            // CORRIGIR: Atualizar apenas o phone_number, mantendo o user_id como está
            // Não podemos alterar o user_id pois isso violaria as políticas RLS
            const { error: updateError } = await supabase
              .from('chatbot_configs')
              .update({
                phone_number: phone || null,
                // Adicionar o instance_id real como um campo separado se necessário
                // ou armazenar em um campo de metadados
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
              console.log(`✅ Configuração atualizada: phone_number agora é ${phone}`);
              
              // Atualizar mensagens relacionadas mantendo o user_id original
              const { error: msgUpdateError } = await supabase
                .from('mensagens')
                .update({
                  updated_at: new Date().toISOString(),
                })
                .eq('user_id', user.id);

              if (msgUpdateError) {
                console.error('❌ Erro ao atualizar mensagens:', msgUpdateError);
              } else {
                console.log('✅ Mensagens atualizadas');
              }
              
              fixedCount++;
              
              toast({
                title: "✅ Registro corrigido!",
                description: `Config ${config.id} atualizada com telefone: ${phone}`,
                duration: 8000,
              });
            }
          } else {
            toast({
              title: "⚠️ ID inválido encontrado",
              description: `ID retornado: ${instanceId} - não é um ID válido`,
              variant: "destructive",
              duration: 8000,
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
          title: "🎉 Correção aplicada com sucesso!",
          description: `${fixedCount} registros foram corrigidos.`,
          duration: 10000,
        });
      } else {
        toast({
          title: "❌ Nenhuma correção aplicada",
          description: "Não foi possível corrigir nenhum registro.",
          variant: "destructive",
          duration: 8000,
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
