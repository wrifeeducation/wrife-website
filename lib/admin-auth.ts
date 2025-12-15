import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: userData, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    throw new AuthError(`Authentication failed: ${authError.message}`, 500);
  }
  
  if (!userData.user) {
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

export { supabaseAdmin };
