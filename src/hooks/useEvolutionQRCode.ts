
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useEvolutionQRCode = () => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const API_KEY = '09d18f5a0aa248bebdb35893efeb170e';
  const EVOLUTION_BASE_URL = 'https://leoevo.techcorps.com.br';

  const generateQRCode = async (instanceName: string): Promise<string | null> => {
    if (!instanceName) {
      toast({
        title: "Erro",
        description: "Nome da instância não informado",
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);
    
    try {
      console.log('🔄 Gerando QR Code para instância:', instanceName);
      
      // Primeiro, tentar conectar a instância
      const connectResponse = await fetch(`${EVOLUTION_BASE_URL}/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: { 
          'apikey': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (connectResponse.ok) {
        const connectData = await connectResponse.json();
        console.log('✅ Resposta da conexão:', connectData);
        
        if (connectData.base64 || connectData.qrcode) {
          const qrCodeData = connectData.base64 || connectData.qrcode;
          const formattedQR = qrCodeData.startsWith('data:') ? qrCodeData : `data:image/png;base64,${qrCodeData}`;
          
          setQrCode(formattedQR);
          
          toast({
            title: "QR Code gerado!",
            description: "Escaneie com seu WhatsApp para conectar.",
          });
          
          return formattedQR;
        }
      }

      // Se não conseguiu, tentar buscar das instâncias
      const instancesResponse = await fetch(`${EVOLUTION_BASE_URL}/instance/fetchInstances?instanceName=${instanceName}`, {
        method: 'GET',
        headers: { 
          'apikey': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (instancesResponse.ok) {
        const instancesData = await instancesResponse.json();
        let instanceData = Array.isArray(instancesData) ? instancesData[0] : instancesData;
        
        if (instanceData && (instanceData.qrcode || instanceData.qr)) {
          const qrCodeData = instanceData.qrcode || instanceData.qr;
          const formattedQR = qrCodeData.startsWith('data:') ? qrCodeData : `data:image/png;base64,${qrCodeData}`;
          
          setQrCode(formattedQR);
          
          toast({
            title: "QR Code obtido!",
            description: "Escaneie com seu WhatsApp para conectar.",
          });
          
          return formattedQR;
        }
      }

      // Se chegou até aqui, não conseguiu obter QR Code
      toast({
        title: "Não foi possível gerar QR Code",
        description: "A instância pode já estar conectada ou houve um erro na API.",
        variant: "destructive",
      });
      
      return null;

    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error);
      toast({
        title: "Erro ao gerar QR Code",
        description: "Erro na conexão com a API Evolution.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearQRCode = () => {
    setQrCode(null);
  };

  return {
    qrCode,
    isGenerating,
    generateQRCode,
    clearQRCode
  };
};
