import { useLocation, NavLink } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Página não encontrada</h2>
          <p className="text-muted-foreground max-w-md">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        
        <Button asChild className="gradient-primary text-white hover:opacity-90">
          <NavLink to="/">
            <Home className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </NavLink>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
