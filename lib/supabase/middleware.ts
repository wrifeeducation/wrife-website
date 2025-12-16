import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        sameSite: 'none',
        secure: true,
      },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, { ...options, sameSite: 'none', secure: true })
          )
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  
  console.log('[Middleware] Path:', request.nextUrl.pathname, 'User:', user?.id || 'none', 'Error:', error?.message || 'none')

  const publicPaths = ['/admin/login', '/login', '/signup', '/reset-password']
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/')
  )

  if (isPublicPath) {
    return supabaseResponse
  }

  const protectedPaths = ['/lesson', '/dashboard', '/admin']
  const isProtectedRoute = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedRoute && !user) {
    console.log('[Middleware] No user for protected route, redirecting to login')
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
    const loginPath = isAdminRoute ? '/admin/login' : '/login'
    const redirectUrl = new URL(loginPath, request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}
