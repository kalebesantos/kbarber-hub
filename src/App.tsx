import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { BarbershopProvider } from "@/hooks/use-barbershop";
import { AppRoutes } from "@/routes";
import { RouteGuard } from "@/routes/RouteGuard";



const App = () => (
  <TooltipProvider>
    <AuthProvider>
      <BarbershopProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RouteGuard>
            <AppRoutes />
          </RouteGuard>
        </BrowserRouter>
      </BarbershopProvider>
    </AuthProvider>
  </TooltipProvider>
);

export default App;
