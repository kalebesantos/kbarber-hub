import { Routes, Route, Navigate } from "react-router-dom";
import { Home } from "@/pages/Home";
import { SuperAdmin } from "@/pages/SuperAdmin";
import { BarbershopCustomer } from "@/pages/BarbershopCustomer";
import { BarbershopAdmin } from "@/pages/BarbershopAdmin";
import NotFound from "@/pages/NotFound";
import { ProtectedRoute } from "./ProtectedRoute";
import { getRouteType } from "@/utils/subdomain";

export const AppRoutes = () => {
  const routeType = getRouteType();

  return (
    <Routes>
      {/* Home route */}
      <Route path="/" element={<Home />} />
      
      {/* Super Admin routes */}
      <Route path="/super-admin" element={<SuperAdmin />} />
      <Route path="/super-admin/*" element={<SuperAdmin />} />
      
      {/* Barbershop Admin routes */}
      <Route 
        path="/:slug/admin" 
        element={
          <ProtectedRoute requireAuth={false}>
            <BarbershopAdmin />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/:slug/admin/*" 
        element={
          <ProtectedRoute requireAuth={false}>
            <BarbershopAdmin />
          </ProtectedRoute>
        } 
      />
      
      {/* Barbershop Customer routes - require authentication */}
      <Route 
        path="/:slug" 
        element={
          <ProtectedRoute requireAuth={true}>
            <BarbershopCustomer />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/:slug/appointments" 
        element={
          <ProtectedRoute requireAuth={true}>
            <BarbershopCustomer />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/:slug/profile" 
        element={
          <ProtectedRoute requireAuth={true}>
            <BarbershopCustomer />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch all - 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};