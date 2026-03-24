// proxy.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth/jwt';
import { getTenantBySlug, getTenantById } from './lib/tenant/utils';

// Public paths (no auth required)
const publicPaths = [
  '/',  // Home page
  '/pricing',
  '/features',
  '/about',
  '/contact',
  '/blog',
  '/login', 
  '/signup', 
  '/forgot-password', 
  '/reset-password',
  '/verify-email'
];

// Public API routes (no auth required) - IMPORTANT: These must come first
const publicApiPaths = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email'
];

// Role-based route mappings
const roleRoutes = {
  super_admin: '/admin',
  tenant_admin: '/dashboard',
  manager: '/manager',
  cashier: '/cashier',
  inventory_manager: '/inventory'
};

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // CRITICAL: Allow public API routes first (before any redirects)
  if (publicApiPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return NextResponse.next();
  }
  
  // Extract tenant slug from path (e.g., /acme-corp/dashboard -> acme-corp)
  const pathSegments = pathname.split('/').filter(Boolean);
  const tenantSlug = pathSegments[0];
  
  // Check if this is a public page path
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );
  
  // Handle root path (home page)
  if (pathname === '/') {
    const token = request.cookies.get('token')?.value;
    
    if (token) {
      try {
        const decoded = verifyToken(token) as { role: string; tenant_id?: string };
        
        if (decoded.role === 'super_admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
        
        if (decoded.tenant_id) {
          const tenant = await getTenantById(decoded.tenant_id);
          if (tenant) {
            return NextResponse.redirect(new URL(`/${tenant.slug}/dashboard`, request.url));
          }
        }
        
        return NextResponse.redirect(new URL('/pricing', request.url));
      } catch (error) {
        const response = NextResponse.next();
        response.cookies.delete('token');
        response.cookies.delete('tenant_slug');
        return response;
      }
    }
    
    return NextResponse.next();
  }
  
  // Handle public page paths
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Handle super admin routes
  if (pathname.startsWith('/admin')) {
    return handleSuperAdminRoutes(request);
  }
  
  // Handle API routes (non-public ones)
  if (pathname.startsWith('/api')) {
    return handleApiRoutes(request);
  }
  
  // Handle tenant routes (with slug in URL)
  if (tenantSlug) {
    return handleTenantRoutes(request, tenantSlug);
  }
  
  // Redirect to home for any other routes
  return NextResponse.redirect(new URL('/', request.url));
}

// API Routes Handler (for authenticated API calls)
async function handleApiRoutes(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  
  try {
    const decoded = verifyToken(token) as { id: string; role: string; tenant_id?: string };
    
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.id);
    requestHeaders.set('x-user-role', decoded.role);
    
    if (decoded.role === 'super_admin') {
      requestHeaders.set('x-is-super-admin', 'true');
    }
    
    if (decoded.tenant_id) {
      requestHeaders.set('x-tenant-id', decoded.tenant_id);
    }
    
    return NextResponse.next({
      request: { headers: requestHeaders }
    });
    
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

// Super Admin Routes Handler
async function handleSuperAdminRoutes(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  try {
    const decoded = verifyToken(token) as { id: string; role: string };
    
    if (decoded.role !== 'super_admin') {
      const userTenantId = (decoded as any).tenant_id;
      if (userTenantId) {
        const tenant = await getTenantById(userTenantId);
        if (tenant) {
          return NextResponse.redirect(new URL(`/${tenant.slug}/dashboard`, request.url));
        }
      }
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.id);
    requestHeaders.set('x-user-role', decoded.role);
    requestHeaders.set('x-is-super-admin', 'true');
    
    return NextResponse.next({
      request: { headers: requestHeaders }
    });
    
  } catch (error) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

// Tenant Routes Handler
async function handleTenantRoutes(request: NextRequest, tenantSlug: string) {
  const token = request.cookies.get('token')?.value;
  
  // Get tenant from database
  const tenant = await getTenantBySlug(tenantSlug);
  
  if (!tenant) {
    return NextResponse.redirect(new URL('/404', request.url));
  }
  
  // Check authentication
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    loginUrl.searchParams.set('tenant', tenantSlug);
    return NextResponse.redirect(loginUrl);
  }
  
  try {
    const decoded = verifyToken(token) as { 
      id: string; 
      role: string; 
      tenant_id?: string;
    };
    
    // Super admin can access any tenant
    if (decoded.role === 'super_admin') {
      // Check if tenant subscription is active
      if (tenant.status === 'expired' || tenant.status === 'suspended') {
        if (request.nextUrl.pathname.includes('/subscription-expired')) {
          return NextResponse.next();
        }
        return NextResponse.redirect(new URL(`/${tenantSlug}/subscription-expired`, request.url));
      }
      
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-tenant-id', tenant.id);
      requestHeaders.set('x-tenant-slug', tenant.slug);
      requestHeaders.set('x-tenant-name', tenant.name);
      requestHeaders.set('x-user-id', decoded.id);
      requestHeaders.set('x-user-role', decoded.role);
      requestHeaders.set('x-is-super-admin', 'true');
      requestHeaders.set('x-impersonating', 'true');
      
      return NextResponse.next({
        request: { headers: requestHeaders }
      });
    }
    
    // Regular users must belong to this tenant
    if (decoded.tenant_id !== tenant.id) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    // Check if tenant subscription is active
    if (tenant.status === 'expired' || tenant.status === 'suspended') {
      if (request.nextUrl.pathname.includes('/subscription-expired')) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL(`/${tenantSlug}/subscription-expired`, request.url));
    }
    
    // Role-based routing for tenant users
    const userRole = decoded.role;
    const allowedRoute = roleRoutes[userRole as keyof typeof roleRoutes];
    
    // Root tenant path - redirect to role-specific dashboard
    if (request.nextUrl.pathname === `/${tenantSlug}`) {
      return NextResponse.redirect(new URL(`/${tenantSlug}${allowedRoute}`, request.url));
    }
    
    // Validate role-based access
    const isCashierRoute = request.nextUrl.pathname.startsWith(`/${tenantSlug}/cashier`);
    const isInventoryRoute = request.nextUrl.pathname.startsWith(`/${tenantSlug}/inventory`);
    const isManagerRoute = request.nextUrl.pathname.startsWith(`/${tenantSlug}/manager`);
    const isDashboardRoute = request.nextUrl.pathname.startsWith(`/${tenantSlug}/dashboard`);
    
    if (userRole === 'cashier' && !isCashierRoute) {
      return NextResponse.redirect(new URL(`/${tenantSlug}/cashier`, request.url));
    }
    
    if (userRole === 'inventory_manager' && !isInventoryRoute) {
      return NextResponse.redirect(new URL(`/${tenantSlug}/inventory`, request.url));
    }
    
    if (userRole === 'manager' && !isManagerRoute && !isDashboardRoute) {
      return NextResponse.redirect(new URL(`/${tenantSlug}/manager`, request.url));
    }
    
    if (userRole === 'tenant_admin' && !isDashboardRoute && !isManagerRoute && !isInventoryRoute) {
      return NextResponse.redirect(new URL(`/${tenantSlug}/dashboard`, request.url));
    }
    
    // Add tenant and user context to headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-id', tenant.id);
    requestHeaders.set('x-tenant-slug', tenant.slug);
    requestHeaders.set('x-tenant-name', tenant.name);
    requestHeaders.set('x-user-id', decoded.id);
    requestHeaders.set('x-user-role', decoded.role);
    
    return NextResponse.next({
      request: { headers: requestHeaders }
    });
    
  } catch (error) {
    // Invalid token
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    response.cookies.delete('tenant_slug');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};