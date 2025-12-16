import { NextResponse, type NextRequest } from 'next/server'

interface SessionData {
  userId: string;
  role: string;
  displayName: string;
  email: string;
  schoolId: string | null;
  accessToken: string;
  expiresAt: number;
}

export async function updateSession(request: NextRequest) {
  const sessionCookie = request.cookies.get('wrife-session');
  let session: SessionData | null = null;
  
  if (sessionCookie?.value) {
    try {
      session = JSON.parse(sessionCookie.value);
      if (session && session.expiresAt < Date.now()) {
        session = null;
      }
    } catch {
      session = null;
    }
  }
  
  console.log('[Middleware] Path:', request.nextUrl.pathname, 'Session:', session ? `User: ${session.userId}, Role: ${session.role}` : 'none')

  const protectedPaths = ['/lesson', '/dashboard']
  const isProtectedRoute = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedRoute && !session) {
    console.log('[Middleware] No session for protected route, redirecting to login')
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next({ request })
}
