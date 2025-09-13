import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { LanguageProvider } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Jogadores from "./pages/Jogadores";
import Financeiro from "./pages/Financeiro";
import Mensagens from "./pages/Mensagens";
import Configuracoes from "./pages/Configuracoes";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header com trigger sempre visível */}
          <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-card">
            <div className="flex items-center">
              <SidebarTrigger className="text-foreground hover:bg-muted" />
              <div className="ml-4">
                <h1 className="font-semibold text-foreground">Sistema de Gestão Financeira</h1>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </header>
          
          {/* Main content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={
                  <ProtectedLayout>
                    <Dashboard />
                  </ProtectedLayout>
                } />
                <Route path="/jogadores" element={
                  <ProtectedLayout>
                    <Jogadores />
                  </ProtectedLayout>
                } />
                <Route path="/financeiro" element={
                  <ProtectedLayout>
                    <Financeiro />
                  </ProtectedLayout>
                } />
                <Route path="/mensagens" element={
                  <ProtectedLayout>
                    <Mensagens />
                  </ProtectedLayout>
                } />
                <Route path="/configuracoes" element={
                  <ProtectedLayout>
                    <Configuracoes />
                  </ProtectedLayout>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
