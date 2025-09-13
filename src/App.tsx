import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { BarbershopProvider } from "@/hooks/use-barbershop";

// Pages
import { Home } from "./pages/Home";
import { SuperAdmin } from "./pages/SuperAdmin";
import { BarbershopCustomer } from "./pages/BarbershopCustomer";
import { BarbershopAdmin } from "./pages/BarbershopAdmin";
import NotFound from "./pages/NotFound";



const App = () => (
  <TooltipProvider>
    <AuthProvider>
      <BarbershopProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/super-admin" element={<SuperAdmin />} />
            <Route path="/:slug/admin" element={<BarbershopAdmin />} />
            <Route path="/:slug/admin/*" element={<BarbershopAdmin />} />
            <Route path="/:slug" element={<BarbershopCustomer />} />
            <Route path="/:slug/*" element={<BarbershopCustomer />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </BarbershopProvider>
    </AuthProvider>
  </TooltipProvider>
);

export default App;
