import { ReactNode, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getSubdomain, getRouteType } from "@/utils/subdomain";

interface RouteGuardProps {
  children: ReactNode;
}

export const RouteGuard = ({ children }: RouteGuardProps) => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const location = useLocation();
  const subdomain = getSubdomain();
  const routeType = getRouteType();

  useEffect(() => {
    // Handle subdomain routing logic
    if (subdomain && !slug) {
      // If there's a subdomain but no slug in path, redirect to barbershop
      navigate(`/${subdomain}`, { replace: true });
      return;
    }

    // Handle mismatched subdomain and slug
    if (subdomain && slug && subdomain !== slug) {
      // If subdomain doesn't match slug, redirect to correct URL
      navigate(`/${subdomain}`, { replace: true });
      return;
    }

    // Handle super admin route validation
    if (location.pathname.startsWith('/super-admin')) {
      // Super admin should not have subdomain
      if (subdomain) {
        navigate('/super-admin', { replace: true });
        return;
      }
    }

    // Handle admin routes
    if (location.pathname.includes('/admin')) {
      if (!slug) {
        navigate('/', { replace: true });
        return;
      }
    }
  }, [subdomain, slug, location.pathname, navigate]);

  return <>{children}</>;
};