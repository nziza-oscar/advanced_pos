// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth/jwt';
import { getTenantBySlug } from './lib/tenant/utils';

// Public paths (no auth required)
const publicPaths = [
  '/',  // Home/pricing page
  '/pricing',
  '/features',
  '/about',
  '/contact',
  '/blog',
  '/login', 
  '/signup', 
  '/forgot-password', 
  '/reset-password',
  '/verify-email',
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
  
  // Extract tenant slug from path (e.g., /acme-corp/dashboard -> acme-corp)
  const pathSegments = pathname.split('/').filter(Boolean);
  const tenantSlug = pathSegments[0];
  
  // Check if this is a public path (no tenant required)
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );
  
  // Handle root path (home/pricing page)
  if (pathname === '/') {
    const token = request.cookies.get('token')?.value;
    
    // If user is logged in, redirect to their dashboard
    if (token) {
      try {
        const decoded = verifyToken(token) as { role: string; tenant_id?: string };
        
        // Super admin goes to admin panel
        if (decoded.role === 'super_admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
        
        // Regular user with tenant - redirect to their tenant dashboard
        if (decoded.tenant_id) {
          // Get tenant by ID to find slug
          const tenant = await getTenantBySlug(decoded.tenant_id);
          if (tenant) {
            return NextResponse.redirect(new URL(`/${tenant.slug}/dashboard`, request.url));
          }
        }
        
        // If no tenant (shouldn't happen for non-super-admin), go to pricing page
        if (decoded.role !== 'super_admin') {
          return NextResponse.redirect(new URL('/pricing', request.url));
        }
      } catch (error) {
        // Invalid token, clear it and show home page
        const response = NextResponse.redirect(new URL('/', request.url));
        response.cookies.delete('token');
        response.cookies.delete('tenant_slug');
        return response;
      }
    }
    
    // Not logged in - show home/pricing page
    return NextResponse.next();
  }
  
  // Handle pricing page specifically - allow access
  if (pathname === '/pricing') {
    return NextResponse.next();
  }
  
  // Handle public paths (no tenant required)
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Handle tenant routes
  if (tenantSlug) {
    // Get tenant from database
    const tenant = await getTenantBySlug(tenantSlug);
    
    if (!tenant) {
      return NextResponse.redirect(new URL('/404', request.url));
    }
    
    // Check authentication for tenant routes
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('tenant', tenantSlug);
      return NextResponse.redirect(loginUrl);
    }
    
    try {
      const decoded = verifyToken(token) as { 
        id: string; 
        role: string; 
        tenant_id?: string;
        email: string;
        full_name: string;
      };
      
      // Super admin can access any tenant
      if (decoded.role !== 'super_admin') {
        // Regular users must belong to this tenant
        if (decoded.tenant_id !== tenant.id) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }
      
      // Check if tenant subscription is active
      if (tenant.status === 'expired' || tenant.status === 'suspended') {
        return NextResponse.redirect(new URL(`/${tenantSlug}/subscription-expired`, request.url));
      }
      
      // Handle API routes
      if (pathname.startsWith('/api')) {
        return handleApiRoutes(request, decoded, tenant);
      }
      
      // Handle page routes
      return handlePageRoutes(request, decoded, tenant, tenantSlug);
      
    } catch (error) {
      // Invalid token
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      response.cookies.delete('tenant_slug');
      return response;
    }
  }
  
  // Handle API routes without tenant
  if (pathname.startsWith('/api')) {
    return NextResponse.json({ error: 'Tenant not specified' }, { status: 400 });
  }
  
  // Redirect to pricing page for any other routes
  return NextResponse.redirect(new URL('/pricing', request.url));
}

// API route handler with tenant isolation
function handleApiRoutes(
  request: NextRequest,
  decoded: { id: string; role: string; tenant_id?: string },
  tenant: any
) {
  const { pathname } = request.nextUrl;
  
  // Add tenant and user context to headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', tenant.id);
  requestHeaders.set('x-tenant-slug', tenant.slug);
  requestHeaders.set('x-tenant-name', tenant.name);
  requestHeaders.set('x-user-id', decoded.id);
  requestHeaders.set('x-user-role', decoded.role);
  
  // For super admin routes accessing specific tenant
  if (decoded.role === 'super_admin' && pathname.startsWith('/api/admin')) {
    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  }
  
  // Regular tenant routes - validate access
  if (decoded.role !== 'super_admin' && decoded.tenant_id !== tenant.id) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  
  return NextResponse.next({
    request: { headers: requestHeaders }
  });
}

// Page route handler with role-based routing and tenant isolation
function handlePageRoutes(
  request: NextRequest,
  decoded: { id: string; role: string; tenant_id?: string },
  tenant: any,
  tenantSlug: string
) {
  const { pathname } = request.nextUrl;
  const userRole = decoded.role;
  
  // Role-based routing for tenant users
  const allowedRoute = roleRoutes[userRole as keyof typeof roleRoutes];
  
  // Root tenant path - redirect to role-specific dashboard
  if (pathname === `/${tenantSlug}`) {
    return NextResponse.redirect(new URL(`/${tenantSlug}${allowedRoute}`, request.url));
  }
  
  // Validate role-based access for tenant routes
  const isCashierRoute = pathname.startsWith(`/${tenantSlug}/cashier`);
  const isInventoryRoute = pathname.startsWith(`/${tenantSlug}/inventory`);
  const isManagerRoute = pathname.startsWith(`/${tenantSlug}/manager`);
  const isDashboardRoute = pathname.startsWith(`/${tenantSlug}/dashboard`);
  
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
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder files
     * - .svg, .png, .jpg, etc (static assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};