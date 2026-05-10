import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

/**
 * Returns '.wrife.co.uk' when the request is actually coming from that domain
 * so the session cookie is readable by resources.wrife.co.uk (and any other
 * subdomain). On Vercel preview URLs we leave domain unset — a cookie scoped
 * to the wrong domain is immediately unreadable and causes an infinite redirect.
 */
function cookieDomain(): string | undefined {
  if (process.env.NODE_ENV !== 'production') return undefined
  const configured = process.env.NEXT_PUBLIC_SITE_DOMAIN
  if (configured) return `.${configured}`
  try {
    const host = headers().get('host') ?? ''
    if (host === 'wrife.co.uk' || host.endsWith('.wrife.co.uk')) return '.wrife.co.uk'
  } catch {
    // headers() not available in some build contexts
  }
  return undefined
}

export async function createClient() {
  const cookieStore = await cookies()
  const domain = cookieDomain()

  return createServerClient(
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
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                sameSite: 'none',
                secure: true,
                ...(domain ? { domain } : {}),
              })
            )
          } catch {
            // Called from a Server Component - ignore
          }
        },
      },
    }
  )
}
