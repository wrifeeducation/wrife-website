import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Returns '.wrife.co.uk' when the request comes from the production domain so
 * the refreshed session cookie is shared across all WriFe subdomains.
 */
function cookieDomain(request: NextRequest): string | undefined {
  if (process.env.NODE_ENV !== 'production') return undefined
  const configured = process.env.NEXT_PUBLIC_SITE_DOMAIN
  if (configured) return `.${configured}`
  const host = request.headers.get('host') ?? ''
  if (host === 'wrife.co.uk' || host.endsWith('.wrife.co.uk')) return '.wrife.co.uk'
  return undefined
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const domain = cookieDomain(request)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        sameSite: 'none',
        secure: true,
        ...(domain ? { domain } : {}),
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
            supabaseResponse.cookies.set(name, value, {
              ...options,
              sameSite: 'none',
              secure: true,
              ...(domain ? { domain } : {}),
            })
          )
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

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
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
    if (!isAdminRoute) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}
