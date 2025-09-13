import { ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useBarbershop } from "@/hooks/use-barbershop";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth: boolean;
  adminOnly?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireAuth, 
  adminOnly = false 
}: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { barbershop, loading: barbershopLoading } = useBarbershop();
  const { slug } = useParams();

  // Show loading while checking authentication or barbershop
  if (authLoading || barbershopLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      </div>
    );
  }

  // If route requires auth but user is not authenticated
  if (requireAuth && !user) {
    return <Navigate to={slug ? `/${slug}` : "/"} replace />;
  }

  // If accessing barbershop route but barbershop doesn't exist
  if (slug && !barbershop) {
    return <Navigate to="/" replace />;
  }

  // If admin route but user is not admin (future implementation)
  if (adminOnly && user && !isUserAdmin(user, slug)) {
    return <Navigate to={slug ? `/${slug}` : "/"} replace />;
  }

  return <>{children}</>;
};

// Helper function to check if user is admin (placeholder for future implementation)
const isUserAdmin = (user: any, slug?: string): boolean => {
  // TODO: Implement admin check logic
  // This could check if user has admin role for specific barbershop
  return false;
};