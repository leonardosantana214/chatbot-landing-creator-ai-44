
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseInstanceFixer = () => {
  const { toast } = useToast();
  
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

      if (response.ok) {
        const data = await response.json();
        console.log('📡 Dados completos da Evolution:', data);
        
        // Extrair o instance_id real
        const instanceId = data.instance?.instanceId || 
                          data.instanceId || 
                          data.instance?.id ||
                          data.id ||
                          data.instance?.key ||
                          instanceName;
        
        // Extrair o telefone
        const evolutionPhone = data.instance?.phone || 
                              data.phone || 
                              data.instance?.number || 
                              data.number ||
                              data.instance?.phoneNumber ||
                              '';
        
        const cleanPhone = evolutionPhone.replace(/\D/g, '');
        
        console.log('✅ Instance ID real encontrado:', instanceId);
        console.log('✅ Telefone encontrado:', cleanPhone);
        
        return {
          instanceId: instanceId,
          phone: cleanPhone
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar dados da Evolution:', error);
      return null;
    }
  };

  const fixInvalidUserIds = async () => {
    try {
      console.log('🔧 Iniciando correção dos user_ids inválidos...');
      
      // Buscar todos os registros com user_id inválido
      const { data: invalidConfigs, error: fetchError } = await supabase
        .from('chatbot_configs')
        .select('*')
        .or('user_id.eq.00000000,user_id.is.null,user_id.eq.');

      if (fetchError) {
        console.error('❌ Erro ao buscar configurações inválidas:', fetchError);
        return false;
      }

      if (!invalidConfigs || invalidConfigs.length === 0) {
        console.log('✅ Nenhuma configuração inválida encontrada');
        toast({
          title: "✅ Tudo ok!",
          description: "Não há registros com instance_id inválido para corrigir.",
        });
        return true;
      }

      console.log(`🔧 Encontradas ${invalidConfigs.length} configurações para corrigir`);
      
      let fixedCount = 0;
      
      for (const config of invalidConfigs) {
        const instanceName = config.evo_instance_id;
        
        if (!instanceName) {
          console.log('⚠️ Configuração sem evo_instance_id, pulando...');
          continue;
        }
        
        console.log(`🔧 Corrigindo configuração para instância: ${instanceName}`);
        
        // Buscar dados reais da Evolution
        const evolutionData = await getEvolutionInstanceData(instanceName);
        
        if (evolutionData && evolutionData.instanceId && evolutionData.instanceId !== instanceName) {
          const { instanceId, phone } = evolutionData;
          
          // Atualizar a configuração com o instance_id real
          const { error: updateError } = await supabase
            .from('chatbot_configs')
            .update({
              user_id: instanceId, // USAR O INSTANCE_ID REAL COMO USER_ID
              phone_number: phone,
              updated_at: new Date().toISOString(),
            })
            .eq('id', config.id);

          if (updateError) {
            console.error(`❌ Erro ao atualizar configuração ${config.id}:`, updateError);
          } else {
            console.log(`✅ Configuração ${config.id} corrigida: ${instanceName} -> ${instanceId}`);
            fixedCount++;
          }
        } else {
          console.log(`⚠️ Não foi possível obter instance_id real para: ${instanceName}`);
        }
      }
      
      if (fixedCount > 0) {
        toast({
          title: "🔧 Correções aplicadas!",
          description: `${fixedCount} registros foram corrigidos com instance_id real.`,
        });
      }
      
      console.log(`✅ Correção concluída: ${fixedCount}/${invalidConfigs.length} registros corrigidos`);
      return true;
    } catch (error) {
      console.error('💥 Erro ao corrigir user_ids inválidos:', error);
      toast({
        title: "❌ Erro na correção",
        description: "Erro ao corrigir registros inválidos no Supabase.",
        variant: "destructive",
      });
      return false;
    }
  };

  const fixInvalidMessages = async () => {
    try {
      console.log('🔧 Iniciando correção das mensagens com user_id inválido...');
      
      // Buscar mensagens com user_id inválido
      const { data: invalidMessages, error: fetchError } = await supabase
        .from('mensagens')
        .select('*')
        .or('user_id.eq.00000000,user_id.is.null,user_id.eq.');

      if (fetchError) {
        console.error('❌ Erro ao buscar mensagens inválidas:', fetchError);
        return false;
      }

      if (!invalidMessages || invalidMessages.length === 0) {
        console.log('✅ Nenhuma mensagem inválida encontrada');
        return true;
      }

      console.log(`🔧 Encontradas ${invalidMessages.length} mensagens para corrigir`);
      
      let fixedCount = 0;
      
      for (const message of invalidMessages) {
        const conversationKey = message.telefone;
        
        if (!conversationKey || !conversationKey.includes('_')) {
          console.log('⚠️ Mensagem sem chave de conversa válida, pulando...');
          continue;
        }
        
        // Extrair instance_id da chave de conversa (formato: instance_id_telefone)
        const instanceId = conversationKey.split('_')[0];
        
        if (!instanceId || instanceId === '00000000') {
          console.log('⚠️ Instance_id inválido na chave de conversa, pulando...');
          continue;
        }
        
        // Buscar configuração válida para esse instance_id
        const { data: configData, error: configError } = await supabase
          .from('chatbot_configs')
          .select('user_id')
          .eq('user_id', instanceId)
          .eq('is_active', true)
          .single();

        if (configError || !configData) {
          console.log(`⚠️ Configuração não encontrada para instance_id: ${instanceId}`);
          continue;
        }
        
        // Atualizar a mensagem com o user_id correto
        const { error: updateError } = await supabase
          .from('mensagens')
          .update({
            user_id: instanceId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', message.id);

        if (updateError) {
          console.error(`❌ Erro ao atualizar mensagem ${message.id}:`, updateError);
        } else {
          console.log(`✅ Mensagem ${message.id} corrigida com user_id: ${instanceId}`);
          fixedCount++;
        }
      }
      
      console.log(`✅ Correção de mensagens concluída: ${fixedCount}/${invalidMessages.length} registros corrigidos`);
      return true;
    } catch (error) {
      console.error('💥 Erro ao corrigir mensagens inválidas:', error);
      return false;
    }
  };

  const runFullFix = async () => {
    console.log('🚀 Iniciando correção completa do Supabase...');
    
    toast({
      title: "🔧 Iniciando correção",
      description: "Corrigindo registros com instance_id inválido...",
    });
    
    // Primeiro corrigir as configurações
    const configsFixed = await fixInvalidUserIds();
    
    if (configsFixed) {
      // Depois corrigir as mensagens
      await fixInvalidMessages();
    }
    
    console.log('✅ Correção completa finalizada!');
    
    toast({
      title: "✅ Correção concluída!",
      description: "Todos os registros foram atualizados com instance_id real.",
    });
  };

  return {
    fixInvalidUserIds,
    fixInvalidMessages,
    runFullFix,
    getEvolutionInstanceData,
  };
};
