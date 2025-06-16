
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import DemoPage from "./pages/DemoPage";
import ChatbotSetup from "./pages/ChatbotSetup";
import PricingSelection from "./pages/PricingSelection";
import WhatsAppIntegration from "./pages/WhatsAppIntegration";
import Payment from "./pages/Payment";
import CompanyInfo from "./pages/CompanyInfo";
import Contacts from "./pages/Contacts";
import Chats from "./pages/Chats";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/company-info" element={<CompanyInfo />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/chatbot-setup" element={<ChatbotSetup />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/contacts" element={
              <ProtectedRoute>
                <Contacts />
              </ProtectedRoute>
            } />
            <Route path="/chats" element={
              <ProtectedRoute>
                <Chats />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/pricing-selection" element={
              <ProtectedRoute>
                <PricingSelection />
              </ProtectedRoute>
            } />
            <Route path="/whatsapp-integration" element={
              <ProtectedRoute>
                <WhatsAppIntegration />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
