
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QRCodeGeneratorProps {
  type: 'pix' | 'whatsapp';
  value: string;
  amount?: number;
  recipientName?: string;
  description?: string;
}

const QRCodeGenerator = ({ type, value, amount, recipientName, description }: QRCodeGeneratorProps) => {
  const [qrCodeData, setQrCodeData] = useState<string>('');

  useEffect(() => {
    generateQRCode();
  }, [type, value, amount]);

  const generateQRCode = () => {
    let qrContent = '';
    
    if (type === 'pix' && amount) {
      // Formato PIX simplificado para exemplo
      const pixData = {
        chave: value,
        valor: amount,
        nome: recipientName || 'Techcorps',
        descricao: description || 'Pagamento de plano'
      };
      qrContent = `PIX:${btoa(JSON.stringify(pixData))}`;
    } else if (type === 'whatsapp') {
      qrContent = `https://wa.me/${value.replace(/\D/g, '')}`;
    }
    
    // Usar um serviço de QR Code online para gerar a imagem
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrContent)}`;
    setQrCodeData(qrUrl);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {type === 'pix' ? 'QR Code PIX' : 'QR Code WhatsApp'}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        {qrCodeData && (
          <div className="space-y-4">
            <img 
              src={qrCodeData} 
              alt={`QR Code ${type}`}
              className="mx-auto border rounded-lg"
            />
            {type === 'pix' && amount && (
              <div className="text-sm text-gray-600">
                <p><strong>Valor:</strong> R$ {amount.toFixed(2)}</p>
                <p><strong>Beneficiário:</strong> {recipientName || 'Techcorps'}</p>
                <p className="text-xs mt-2">
                  Escaneie o QR Code com seu app bancário para realizar o pagamento
                </p>
              </div>
            )}
            {type === 'whatsapp' && (
              <div className="text-sm text-gray-600">
                <p>Escaneie para conectar ao WhatsApp</p>
                <p className="text-xs mt-2">
                  Use o WhatsApp Web ou app para escanear este código
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
