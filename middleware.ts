import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || '';
  const pathname = req.nextUrl.pathname;
  
  // Check if the request is coming from the promo subdomain
  if (hostname.startsWith('promo.') || hostname.includes('promo.wrife')) {
    // If already on a promo path, let it through
    if (pathname.startsWith('/promo')) {
      return NextResponse.next();
    }
    
    // Rewrite root and other paths to /promo
    const url = req.nextUrl.clone();
    url.pathname = `/promo${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
  }
  
  // Allow public routes to pass through without auth checks
  const publicPaths = ['/update-password', '/reset-password', '/admin/login', '/admin/setup', '/api/admin/setup'];
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // For auth-protected routes, run session update
  const protectedPaths = ['/lesson', '/dashboard', '/admin', '/api/admin'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtected) {
    return await updateSession(req);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match promo subdomain paths
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};
