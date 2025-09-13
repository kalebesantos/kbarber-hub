import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { BarbershopProvider } from "@/hooks/use-barbershop";

// Pages
import { Home } from "./pages/Home";
import { SuperAdmin } from "./pages/SuperAdmin";
import { BarbershopCustomer } from "./pages/BarbershopCustomer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BarbershopProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/super-admin" element={<SuperAdmin />} />
              <Route path="/:slug" element={<BarbershopCustomer />} />
              <Route path="/:slug/*" element={<BarbershopCustomer />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </BarbershopProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
