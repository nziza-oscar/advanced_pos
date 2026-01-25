import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth/jwt';

const publicPaths = ['/login', '/signup', '/forgot-password', '/api/auth'];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '');

  // 2. Handle API Protection
  if (pathname.startsWith('/api')) {
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    try {
      verifyToken(token);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
  }

  // 3. Handle Page Protection & Role-Based Routing
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const decoded = verifyToken(token) as { role: string };
    const role = decoded.role;

    // Admin Access: Restricted to /dashboard
    if (pathname.startsWith('/dashboard') && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }

    // Cashier Access: Restricted to /cashier
    if (pathname.startsWith('/cashier') && role !== 'cashier') {
      const target = role === 'admin' ? '/dashboard' : `/${role}`;
      return NextResponse.redirect(new URL(target, request.url));
    }

    // Inventory Access: Restricted to /inventory
    if (pathname.startsWith('/inventory') && role !== 'inventory_manager') {
      const target = role === 'admin' ? '/dashboard' : `/${role}`;
      return NextResponse.redirect(new URL(target, request.url));
    }

    // Manager Access: Restricted to /manager
    if (pathname.startsWith('/manager') && role !== 'manager') {
      const target = role === 'admin' ? '/dashboard' : `/${role}`;
      return NextResponse.redirect(new URL(target, request.url));
    }

  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)',
  ],
};