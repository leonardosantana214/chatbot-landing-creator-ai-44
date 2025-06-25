
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserProfile {
  name: string | null;
  email: string | null;
  company: string | null;
  whatsapp: string | null;
}

interface UserProfileCardProps {
  userProfile: UserProfile | null;
  userId: string;
}

const UserProfileCard = ({ userProfile, userId }: UserProfileCardProps) => {
  if (!userProfile) return null;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Informações da Conta</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Nome:</span>
            <p className="font-medium">{userProfile.name || 'Não informado'}</p>
          </div>
          <div>
            <span className="text-gray-600">Email:</span>
            <p className="font-medium">{userProfile.email || 'Não informado'}</p>
          </div>
          <div>
            <span className="text-gray-600">Empresa:</span>
            <p className="font-medium">{userProfile.company || 'Não informado'}</p>
          </div>
          <div>
            <span className="text-gray-600">WhatsApp:</span>
            <p className="font-medium">{userProfile.whatsapp || 'Não informado'}</p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm">
            <span className="text-blue-600 font-medium">User ID:</span>
            <code className="ml-2 bg-blue-100 px-2 py-1 rounded text-xs">{userId}</code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;
