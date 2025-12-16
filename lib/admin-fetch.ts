import { supabase } from './supabase';

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Session error:', sessionError);
    throw new Error(`Session error: ${sessionError.message}`);
  }
  
  if (!session?.access_token) {
    console.error('No session or access token found');
    throw new Error('Not authenticated - please log in again');
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${session.access_token}`);
  headers.set('Content-Type', 'application/json');

  return fetch(url, {
    ...options,
    headers,
  });
}
