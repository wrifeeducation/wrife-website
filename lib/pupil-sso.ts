'use client'

/**
 * Builds a cross-domain SSO URL for a WriFe app.
 *
 * Reads the pupil's Supabase tokens from localStorage ('pupilSSOTokens'),
 * appending them to the URL hash so the receiving Vite app
 * (practice.wrife.co.uk, pwp-studio.wrife.co.uk) detects them via
 * `detectSessionInUrl` and automatically calls setSession().
 *
 * Tokens are stored in localStorage (not via supabase.auth.setSession) to
 * avoid overwriting any active teacher session on the same wrife.co.uk domain.
 *
 * Falls back to the plain baseUrl if:
 *   - No tokens found in localStorage
 *   - The stored token has fewer than 60 seconds remaining
 *   - Any error occurs
 *
 * Usage:
 *   const url = await buildSSOUrl('https://practice.wrife.co.uk')
 *   window.open(url, '_blank')
 */
export async function buildSSOUrl(baseUrl: string): Promise<string> {
  try {
    const raw = localStorage.getItem('pupilSSOTokens')
    if (!raw) return baseUrl

    const tokens = JSON.parse(raw) as {
      access_token: string
      refresh_token: string
      expires_at: number
    }

    if (!tokens.access_token || !tokens.refresh_token) return baseUrl

    const expiresIn = Math.floor(tokens.expires_at - Date.now() / 1000)
    if (expiresIn < 60) {
      // Token is about to expire — clear it and fall back to base URL
      // (The next pupil login will store fresh tokens)
      localStorage.removeItem('pupilSSOTokens')
      return baseUrl
    }

    // Supabase detectSessionInUrl parses this exact hash format
    const params = new URLSearchParams({
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type:    'bearer',
      expires_in:    String(expiresIn),
    })

    return `${baseUrl}#${params.toString()}`
  } catch {
    // Non-fatal: plain URL is always a valid fallback
    return baseUrl
  }
}
