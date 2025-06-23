
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: string;
  label?: string;
  variant?: 'default' | 'ghost' | 'outline';
  className?: string;
}

const BackButton = ({ 
  to = '/dashboard', 
  label = 'Voltar', 
  variant = 'ghost',
  className = ''
}: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button
      variant={variant}
      onClick={() => navigate(to)}
      className={`flex items-center space-x-2 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );
};

export default BackButton;
