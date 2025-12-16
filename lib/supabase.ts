import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export async function syncSessionToServer(event: string, session: any) {
  if (typeof window === 'undefined') return;
  
  try {
    const response = await fetch('/api/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, session }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      console.error('[Supabase] Failed to sync session to server');
    }
  } catch (error) {
    console.error('[Supabase] Error syncing session:', error);
  }
}
