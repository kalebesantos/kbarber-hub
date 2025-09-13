// Utility functions for handling subdomains in the BarberHub system

export const getSubdomain = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  
  // For development (localhost)
  if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
    // Extract subdomain from URL path for local development
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    // Check if first segment could be a barbershop slug
    if (segments.length > 0 && segments[0] !== 'super-admin' && segments[0] !== 'auth') {
      return segments[0];
    }
    
    return null;
  }
  
  // For Vercel preview URLs (e.g., project-name-git-branch-username.vercel.app)
  if (hostname.includes('vercel.app')) {
    // Use path-based routing for Vercel until custom domain is setup
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length > 0 && segments[0] !== 'super-admin' && segments[0] !== 'auth') {
      return segments[0];
    }
    
    return null;
  }
  
  // For production (actual subdomains like slug.yourdomain.com)
  const parts = hostname.split('.');
  if (parts.length > 2) {
    const subdomain = parts[0];
    
    // Skip common subdomains that aren't barbershop slugs
    if (['www', 'api', 'cdn', 'static', 'admin'].includes(subdomain)) {
      return null;
    }
    
    return subdomain;
  }
  
  return null;
};

export const isSuperAdminRoute = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const path = window.location.pathname;
  return path.startsWith('/super-admin');
};

export const isAdminRoute = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const path = window.location.pathname;
  const subdomain = getSubdomain();
  
  // Check for /slug/admin pattern in development
  if (subdomain) {
    return path.includes('/admin');
  }
  
  return false;
};

export const getRouteType = (): 'super-admin' | 'barbershop-admin' | 'customer' | 'home' => {
  if (isSuperAdminRoute()) {
    return 'super-admin';
  }
  
  if (isAdminRoute()) {
    return 'barbershop-admin';
  }
  
  const subdomain = getSubdomain();
  if (subdomain) {
    return 'customer';
  }
  
  return 'home';
};

export const buildBarbershopUrl = (slug: string, path: string = ''): string => {
  if (typeof window === 'undefined') return '#';
  
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // For development
  if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${protocol}//${hostname}${port}/${slug}${path}`;
  }
  
  // For Vercel preview URLs - use path-based routing
  if (hostname.includes('vercel.app')) {
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${protocol}//${hostname}${port}/${slug}${path}`;
  }
  
  // For production with real subdomains
  const baseDomain = hostname.split('.').slice(-2).join('.');
  return `${protocol}//${slug}.${baseDomain}${path}`;
};