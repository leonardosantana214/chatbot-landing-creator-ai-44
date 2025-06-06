
import { useToast } from '@/hooks/use-toast';

interface WebhookData {
  origem: string;
  nome_instancia?: string;
  dados: Record<string, any>;
}

export const useN8nWebhook = () => {
  const { toast } = useToast();

  const sendToWebhook = async (data: WebhookData) => {
    try {
      console.log('Enviando dados para n8n webhook:', data);
      
      const response = await fetch('https://leowebhook.techcorps.com.br/webhook/receber-formulario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          sistema: 'lovable-chatbot'
        }),
      });

      console.log('Dados enviados com sucesso para n8n');
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar dados para n8n webhook:', error);
      
      toast({
        title: "Aviso",
        description: "Dados processados localmente. Webhook em segundo plano.",
      });
      
      return { success: false, error };
    }
  };

  const sendFormData = async (formData: Record<string, any>, instanceName?: string) => {
    const webhookData: WebhookData = {
      origem: 'chatbot',
      nome_instancia: instanceName || 'default',
      dados: {
        ...formData,
        data_envio: new Date().toISOString()
      }
    };

    return await sendToWebhook(webhookData);
  };

  const sendInstanceData = async (instanceName: string, additionalData?: Record<string, any>) => {
    const webhookData: WebhookData = {
      origem: 'instancia',
      nome_instancia: instanceName,
      dados: {
        nome_instancia: instanceName,
        data_criacao: new Date().toISOString(),
        status: 'criada',
        ...additionalData
      }
    };

    return await sendToWebhook(webhookData);
  };

  return {
    sendToWebhook,
    sendFormData,
    sendInstanceData
  };
};
