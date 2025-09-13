export interface RouteConfig {
  path: string;
  title: string;
  description?: string;
  requireAuth?: boolean;
  adminOnly?: boolean;
  public?: boolean;
}

export const ROUTE_PATHS = {
  // Public routes
  HOME: '/',
  
  // Super Admin routes
  SUPER_ADMIN: '/super-admin',
  SUPER_ADMIN_DASHBOARD: '/super-admin/dashboard',
  SUPER_ADMIN_BARBERSHOPS: '/super-admin/barbershops',
  
  // Barbershop Admin routes
  BARBERSHOP_ADMIN: '/:slug/admin',
  BARBERSHOP_ADMIN_DASHBOARD: '/:slug/admin/dashboard',
  BARBERSHOP_ADMIN_BARBERS: '/:slug/admin/barbers',
  BARBERSHOP_ADMIN_SERVICES: '/:slug/admin/services',
  BARBERSHOP_ADMIN_APPOINTMENTS: '/:slug/admin/appointments',
  BARBERSHOP_ADMIN_SCHEDULE: '/:slug/admin/schedule',
  BARBERSHOP_ADMIN_CUSTOMERS: '/:slug/admin/customers',
  BARBERSHOP_ADMIN_SETTINGS: '/:slug/admin/settings',
  
  // Customer routes
  BARBERSHOP_HOME: '/:slug',
  BARBERSHOP_APPOINTMENTS: '/:slug/appointments',
  BARBERSHOP_PROFILE: '/:slug/profile',
  BARBERSHOP_BOOKING: '/:slug/booking',
} as const;

export const ROUTE_CONFIG: Record<string, RouteConfig> = {
  [ROUTE_PATHS.HOME]: {
    path: ROUTE_PATHS.HOME,
    title: 'BarberHub - Sistema de Gestão para Barbearias',
    description: 'Plataforma completa para gestão de barbearias',
    public: true,
  },
  
  [ROUTE_PATHS.SUPER_ADMIN]: {
    path: ROUTE_PATHS.SUPER_ADMIN,
    title: 'Super Admin - BarberHub',
    description: 'Painel administrativo do sistema',
    adminOnly: true,
  },
  
  [ROUTE_PATHS.BARBERSHOP_ADMIN]: {
    path: ROUTE_PATHS.BARBERSHOP_ADMIN,
    title: 'Admin - Barbearia',
    description: 'Painel administrativo da barbearia',
    adminOnly: true,
  },
  
  [ROUTE_PATHS.BARBERSHOP_HOME]: {
    path: ROUTE_PATHS.BARBERSHOP_HOME,
    title: 'Barbearia',
    description: 'Página da barbearia',
    requireAuth: true,
  },
  
  [ROUTE_PATHS.BARBERSHOP_APPOINTMENTS]: {
    path: ROUTE_PATHS.BARBERSHOP_APPOINTMENTS,
    title: 'Meus Agendamentos',
    description: 'Visualizar e gerenciar agendamentos',
    requireAuth: true,
  },
  
  [ROUTE_PATHS.BARBERSHOP_PROFILE]: {
    path: ROUTE_PATHS.BARBERSHOP_PROFILE,
    title: 'Meu Perfil',
    description: 'Gerenciar dados do perfil',
    requireAuth: true,
  },
};

export const buildRoute = (routePath: string, params: Record<string, string> = {}) => {
  let route = routePath;
  
  Object.entries(params).forEach(([key, value]) => {
    route = route.replace(`:${key}`, value);
  });
  
  return route;
};

export const getBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];
  
  if (segments.length === 0) {
    return [{ title: 'Início', path: '/' }];
  }
  
  if (segments[0] === 'super-admin') {
    breadcrumbs.push({ title: 'Super Admin', path: '/super-admin' });
    if (segments[1]) {
      breadcrumbs.push({ title: segments[1], path: `/super-admin/${segments[1]}` });
    }
  } else if (segments.length >= 2 && segments[1] === 'admin') {
    breadcrumbs.push({ title: segments[0], path: `/${segments[0]}` });
    breadcrumbs.push({ title: 'Admin', path: `/${segments[0]}/admin` });
    if (segments[2]) {
      breadcrumbs.push({ title: segments[2], path: `/${segments[0]}/admin/${segments[2]}` });
    }
  } else {
    breadcrumbs.push({ title: segments[0], path: `/${segments[0]}` });
    if (segments[1]) {
      breadcrumbs.push({ title: segments[1], path: `/${segments[0]}/${segments[1]}` });
    }
  }
  
  return breadcrumbs;
};