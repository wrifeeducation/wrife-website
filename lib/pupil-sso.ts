'use client'

import { createClient } from '@/lib/supabase'

/**
 * Builds a cross-domain SSO URL for a WriFe app.
 *
 * Appends the current pupil's Supabase session tokens to the URL hash so the
 * receiving Vite app (practice.wrife.co.uk, pwp-studio.wrife.co.uk) detects
 * them via `detectSessionInUrl` (enabled by default in @supabase/supabase-js)
 * and automatically calls setSession() — no second login required.
 *
 * Falls back to the plain baseUrl if:
 *   - No Supabase session exists (pupil used an older login without SSO)
 *   - The session has fewer than 60 seconds remaining
 *   - Any error occurs during token retrieval
 *
 * Usage:
 *   const url = await buildSSOUrl('https://practice.wrife.co.uk')
 *   window.open(url, '_blank')
 */
export async function buildSSOUrl(baseUrl: string): Promise<string> {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.access_token || !session?.refresh_token) {
      return baseUrl
    }

    // Don't pass a session that expires in under 60 seconds
    const expiresIn = session.expires_at
      ? Math.floor(session.expires_at - Date.now() / 1000)
      : 3600

    if (expiresIn < 60) {
      // Try to refresh the session first
      const { data: refreshed } = await supabase.auth.refreshSession()
      if (!refreshed.session) return baseUrl

      const refreshedIn = refreshed.session.expires_at
        ? Math.floor(refreshed.session.expires_at - Date.now() / 1000)
        : 3600

      const params = new URLSearchParams({
        access_token:  refreshed.session.access_token,
        refresh_token: refreshed.session.refresh_token,
        token_type:    'bearer',
        expires_in:    String(refreshedIn),
      })
      return `${baseUrl}#${params.toString()}`
    }

    // Supabase detectSessionInUrl parses this exact hash format
    const params = new URLSearchParams({
      access_token:  session.access_token,
      refresh_token: session.refresh_token,
      token_type:    'bearer',
      expires_in:    String(expiresIn),
    })

    return `${baseUrl}#${params.toString()}`
  } catch {
    // Non-fatal: plain URL is always a valid fallback
    return baseUrl
  }
}
