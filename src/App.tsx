
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Payment from "./pages/Payment";
import ChatbotSetup from "./pages/ChatbotSetup";
import WhatsAppIntegration from "./pages/WhatsAppIntegration";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import Messages from "./pages/Messages";
import Chats from "./pages/Chats";
import Clientes from "./pages/Clientes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Fluxo Principal */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/chatbot-setup" element={<ChatbotSetup />} />
            <Route path="/whatsapp-integration" element={<WhatsAppIntegration />} />
            
            {/* Dashboard e páginas internas */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/clientes" element={<Clientes />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
