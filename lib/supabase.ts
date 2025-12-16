import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookies: {
    getAll() {
      const cookies: { name: string; value: string }[] = []
      if (typeof document !== 'undefined') {
        document.cookie.split(';').forEach(cookie => {
          const [name, ...valueParts] = cookie.trim().split('=')
          if (name) {
            cookies.push({ name, value: valueParts.join('=') })
          }
        })
      }
      return cookies
    },
    setAll(cookiesToSet) {
      if (typeof document !== 'undefined') {
        cookiesToSet.forEach(({ name, value, options }) => {
          let cookieStr = `${name}=${value}`
          if (options?.maxAge) cookieStr += `; Max-Age=${options.maxAge}`
          if (options?.path) cookieStr += `; Path=${options.path}`
          if (options?.sameSite) cookieStr += `; SameSite=${options.sameSite}`
          cookieStr += '; Path=/'
          document.cookie = cookieStr
        })
      }
    },
  },
})
