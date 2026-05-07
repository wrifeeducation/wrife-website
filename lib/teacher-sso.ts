'use client'

/**
 * Builds a cross-domain SSO URL for a teacher navigating from wrife.co.uk
 * to a WriFe sub-app (practice.wrife.co.uk or pwp-studio.wrife.co.uk).
 *
 * Reads the teacher's active Supabase session from the browser client and
 * appends the tokens to the URL hash. The receiving Vite app's Supabase SDK
 * detects the hash via `detectSessionInUrl` (enabled by default) and
 * automatically calls setSession(), landing the teacher in their dashboard.
 *
 * Falls back to the plain baseUrl + path if:
 *   - No active session found
 *   - The session has fewer than 60 seconds remaining
 *   - Any error occurs
 *
 * Usage:
 *   const url = await buildTeacherSSOUrl('https://practice.wrife.co.uk', '/teacher')
 *   window.open(url, '_blank')
 */
export async function buildTeacherSSOUrl(
  baseUrl: string,
  path: string = '/teacher',
): Promise<string> {
  const fallback = `${baseUrl}${path}`
  try {
    // Lazy import to ensure we're only called client-side
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()

    const { data: { session }, error } = await supabase.auth.getSession()
    if (error || !session) return fallback

    const expiresIn = Math.floor((session.expires_at ?? 0) - Date.now() / 1000)
    if (expiresIn < 60) return fallback

    // Supabase detectSessionInUrl parses this exact hash format
    const params = new URLSearchParams({
      access_token:  session.access_token,
      refresh_token: session.refresh_token,
      token_type:    'bearer',
      expires_in:    String(expiresIn),
    })

    return `${baseUrl}${path}#${params.toString()}`
  } catch {
    return fallback
  }
}
