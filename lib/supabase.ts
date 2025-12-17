'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let _supabase: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('createClient() can only be called on the client side')
  }
  
  if (!_supabase) {
    _supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookieOptions: {
        sameSite: 'none',
        secure: true,
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
