import { supabase } from './supabase';

async function getFreshAccessToken(): Promise<string> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError || !refreshData.session?.access_token) {
      throw new Error('Not authenticated - please log in again');
    }
    return refreshData.session.access_token;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return session.access_token;
  }

  const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError || !refreshData.session?.access_token) {
    throw new Error('Not authenticated - please log in again');
  }
  return refreshData.session.access_token;
}

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getFreshAccessToken();

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const method = (options.method || 'GET').toUpperCase();
    if (method !== 'GET' && method !== 'HEAD') {
      return response;
    }

    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError || !refreshData.session?.access_token) {
      return response;
    }

    const retryHeaders = new Headers(options.headers);
    retryHeaders.set('Authorization', `Bearer ${refreshData.session.access_token}`);
    retryHeaders.set('Content-Type', 'application/json');

    return fetch(url, { ...options, headers: retryHeaders });
  }

  return response;
}
