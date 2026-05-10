'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Returns '.wrife.co.uk' when running on the production domain so the session
 * cookie is readable by resources.wrife.co.uk and any other subdomain.
 * On localhost / Vercel preview URLs we leave domain unset — a domain cookie
 * with the wrong value is unreadable and causes an infinite login loop.
 */
function cookieDomain(): string | undefined {
  if (typeof window === 'undefined') return undefined
  const host = window.location.hostname
  if (host === 'wrife.co.uk' || host.endsWith('.wrife.co.uk')) return '.wrife.co.uk'
  return undefined
}

let _supabase: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('createClient() can only be called on the client side')
  }

  if (!_supabase) {
    const domain = cookieDomain()
    _supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookieOptions: {
        sameSite: 'none',
        secure: true,
        ...(domain ? { domain } : {}),
      }
    })
  }
  return _supabase
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (typeof window === 'undefined') {
      return () => Promise.reject(new Error('Supabase client not available on server'))
    }
    return (createClient() as any)[prop]
  }
})
