
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare } from 'lucide-react';

interface QuickActionsProps {
  onNavigate: (path: string) => void;
}

const QuickActions = ({ onNavigate }: QuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="h-16 flex flex-col space-y-1"
            onClick={() => onNavigate('/contacts')}
          >
            <Users className="h-5 w-5" />
            <span className="text-sm">Contatos</span>
          </Button>

          <Button 
            variant="outline" 
            className="h-16 flex flex-col space-y-1"
            onClick={() => onNavigate('/messages')}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm">Mensagens</span>
          </Button>

          <Button 
            variant="outline" 
            className="h-16 flex flex-col space-y-1"
            onClick={() => onNavigate('/chats')}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm">Conversas</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
