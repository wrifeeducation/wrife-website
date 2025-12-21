import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const userId = request.nextUrl.searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, role, display_name, email, school_id, membership_tier')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[Profile API] Error fetching profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let schoolTier = null;
    if (profile?.school_id) {
      const { data: school } = await supabaseAdmin
        .from('schools')
        .select('subscription_tier')
        .eq('id', profile.school_id)
        .maybeSingle();
      
      if (school) {
        schoolTier = school.subscription_tier;
      }
    }

    return NextResponse.json({ 
      profile: profile ? { ...profile, school_tier: schoolTier } : null 
    });
  } catch (err) {
    console.error('[Profile API] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
