
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
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/chatbot-setup" element={
              <ProtectedRoute>
                <ChatbotSetup />
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
