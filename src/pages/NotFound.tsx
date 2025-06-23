
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md mx-auto shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="text-6xl font-bold text-gray-400 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Página não encontrada</h1>
          <p className="text-gray-600 mb-6">
            A página que você está procurando não existe ou foi movida.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-[#FF914C] hover:bg-[#FF7A2B] text-white"
            >
              <Home className="h-4 w-4 mr-2" />
              Ir para Dashboard
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
