import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

export interface ProfileLookupResult {
  id: string;
  role: string;
  school_id: string | null;
  email?: string;
  display_name?: string;
  membership_tier?: string;
}

export async function getProfileForUser(
  supabaseUserId: string,
  email?: string | null,
  selectFields: string = 'id, role, school_id'
): Promise<ProfileLookupResult | null> {
  const supabase = getSupabaseAdmin();
  
  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(selectFields)
    .eq('id', supabaseUserId)
    .single();

  if (profileError?.code === 'PGRST116' && email) {
    const emailResult = await supabase
      .from('profiles')
      .select(selectFields)
      .ilike('email', email)
      .single();
    
    if (!emailResult.error && emailResult.data) {
      return emailResult.data as unknown as ProfileLookupResult;
    }
  }

  if (!profile) return null;
  return profile as unknown as ProfileLookupResult;
}

export async function verifyTeacherAccess(
  supabaseUserId: string,
  email?: string | null
): Promise<{ authorized: true; profile: ProfileLookupResult } | { authorized: false; error: string }> {
  const profile = await getProfileForUser(supabaseUserId, email);
  
  if (!profile) {
    return { authorized: false, error: 'Profile not found' };
  }
  
  if (!['teacher', 'admin', 'school_admin'].includes(profile.role)) {
    return { authorized: false, error: 'Teacher access required' };
  }
  
  return { authorized: true, profile };
}

export async function verifyAdminAccess(
  supabaseUserId: string,
  email?: string | null
): Promise<{ authorized: true; profile: ProfileLookupResult } | { authorized: false; error: string }> {
  const profile = await getProfileForUser(supabaseUserId, email);
  
  if (!profile) {
    return { authorized: false, error: 'Profile not found' };
  }
  
  if (profile.role !== 'admin') {
    return { authorized: false, error: 'Admin access required' };
  }
  
  return { authorized: true, profile };
}

export async function verifyAdminOrSchoolAdminAccess(
  supabaseUserId: string,
  email?: string | null
): Promise<{ authorized: true; profile: ProfileLookupResult } | { authorized: false; error: string }> {
  const profile = await getProfileForUser(supabaseUserId, email);
  
  if (!profile) {
    return { authorized: false, error: 'Profile not found' };
  }
  
  if (!['admin', 'school_admin'].includes(profile.role)) {
    return { authorized: false, error: 'Admin access required' };
  }
  
  return { authorized: true, profile };
}
