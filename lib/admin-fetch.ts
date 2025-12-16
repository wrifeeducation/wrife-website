import { supabase } from './supabase';

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${session.access_token}`);
  headers.set('Content-Type', 'application/json');

  return fetch(url, {
    ...options,
    headers,
  });
}
