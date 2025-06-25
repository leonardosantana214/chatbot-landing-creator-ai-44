
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Payment from "./pages/Payment";
import AccountCreation from "./pages/AccountCreation";
import Dashboard from "./pages/Dashboard";
import ChatbotSetup from "./pages/ChatbotSetup";
import WhatsAppIntegration from "./pages/WhatsAppIntegration";
import Contacts from "./pages/Contacts";
import Messages from "./pages/Messages";
import Chats from "./pages/Chats";
import Clientes from "./pages/Clientes";
import PricingSelection from "./pages/PricingSelection";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Página inicial */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Fluxo de pagamento e criação de conta */}
            <Route path="/payment" element={<Payment />} />
            <Route path="/account-creation" element={<AccountCreation />} />
            
            {/* Autenticação */}
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Dashboard e configurações */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chatbot-setup" element={<ChatbotSetup />} />
            <Route path="/whatsapp-integration" element={<WhatsAppIntegration />} />
            
            {/* Gerenciamento */}
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/clientes" element={<Clientes />} />
            
            {/* Outras páginas */}
            <Route path="/pricing" element={<PricingSelection />} />
            
            {/* Redirect fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
