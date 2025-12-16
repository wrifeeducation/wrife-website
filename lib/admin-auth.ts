import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

function createAdminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: {
        schema: 'public',
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

const supabaseAdmin = createAdminClient();

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

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role, school_id')
    .eq('id', userData.user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    throw new AuthError(`Failed to fetch user profile: ${profileError.message}`, 500);
  }

  if (!profile || (profile.role !== 'admin' && profile.role !== 'school_admin')) {
    throw new AuthError('Unauthorized: Admin access required', 401);
  }

  return {
    userId: userData.user.id,
    role: profile.role,
    schoolId: profile.school_id,
  };
}

export { supabaseAdmin, createAdminClient };
