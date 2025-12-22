import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

let supabaseAdminInstance: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      throw new Error('Missing Supabase environment variables');
    }
    
    supabaseAdminInstance = createClient(url, key, {
      db: { schema: 'public' },
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabaseAdminInstance;
}

// Legacy export for backward compatibility
const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient];
  },
});

export interface AuthResult {
  userId: string;
  role: 'admin' | 'school_admin';
  schoolId: string | null;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function getAuthenticatedAdmin(): Promise<AuthResult> {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('Unauthorized: No token provided', 401);
  }

  const token = authHeader.replace('Bearer ', '');

  const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
  
  if (authError || !userData.user) {
    throw new AuthError('Unauthorized', 401);
  }

  // Try to find profile by Supabase user ID first
  let { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, role, school_id')
    .eq('id', userData.user.id)
    .single();

  // If not found by ID, try by email (handles cross-environment accounts)
  if (profileError?.code === 'PGRST116' && userData.user.email) {
    const emailResult = await supabaseAdmin
      .from('profiles')
      .select('id, role, school_id')
      .ilike('email', userData.user.email)
      .single();
    
    if (!emailResult.error) {
      profile = emailResult.data;
      profileError = null;
    }
  }

  if (profileError && profileError.code !== 'PGRST116') {
    throw new AuthError(`Failed to fetch user profile: ${profileError.message}`, 500);
  }

  if (!profile || (profile.role !== 'admin' && profile.role !== 'school_admin')) {
    throw new AuthError('Unauthorized: Admin access required', 401);
  }

  return {
    userId: profile.id,
    role: profile.role,
    schoolId: profile.school_id,
  };
}

export { supabaseAdmin, getSupabaseAdmin };
