
import { useToast } from '@/hooks/use-toast';

interface WebhookData {
  origem: string;
  nome_instancia?: string;
  [key: string]: any;
}

export const useN8nWebhook = () => {
  const { toast } = useToast();

  const sendToWebhook = async (data: WebhookData) => {
    try {
      console.log('Enviando dados para n8n webhook:', data);
      
      // Criar query string com todos os dados
      const queryParams = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          queryParams.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
      
      const webhookUrl = `https://leowebhook.techcorps.com.br/webhook/receber-formulario?${queryParams.toString()}`;
      
      const response = await fetch(webhookUrl, {
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
      data_envio: new Date().toISOString(),
      ...formData
    };

    return await sendToWebhook(webhookData);
  };

  const sendInstanceData = async (instanceName: string, chatbotData: Record<string, any>) => {
    const webhookData: WebhookData = {
      origem: 'instancia',
      nome_instancia: instanceName,
      data_criacao: new Date().toISOString(),
      status: 'criada',
      api_key_usado: '09d18f5a...',
      status_conexao: 'aguardando_qr_scan',
      nome_da_IA: chatbotData.nome_da_IA || '',
      empresa: chatbotData.empresa || '',
      nicho: chatbotData.nicho || '',
      identidade: chatbotData.identidade || '',
      personalidade: chatbotData.personalidade || '',
      objetivo: chatbotData.objetivo || '',
      regras: chatbotData.regras || '',
      fluxo: chatbotData.fluxo || '',
      funcionalidades: chatbotData.funcionalidades || []
    };

    return await sendToWebhook(webhookData);
  };

  return {
    sendToWebhook,
    sendFormData,
    sendInstanceData
  };
};
