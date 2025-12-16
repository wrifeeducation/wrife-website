import { supabase } from './supabase';

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('adminFetch session error:', sessionError);
      throw new Error(`Session error: ${sessionError.message}`);
    }
    
    if (!session?.access_token) {
      console.error('adminFetch: No session found - user may need to log in');
      throw new Error('Not authenticated - please log in again');
    }

    console.log('adminFetch: Making authenticated request to', url);
    
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${session.access_token}`);
    headers.set('Content-Type', 'application/json');

    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    console.log('adminFetch: Response status', response.status);
    return response;
  } catch (error: any) {
    console.error('adminFetch error:', error?.message || error);
    throw error;
  }
}
