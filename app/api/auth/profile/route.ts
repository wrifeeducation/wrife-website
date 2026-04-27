import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { trackActivityAsync, extractRequestInfo } from '@/lib/activity-tracker';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  const email = request.nextUrl.searchParams.get('email');

  console.log(`[Profile API] GET request - userId: ${userId}, email: ${email}`);

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // 1. Look up profile by auth user ID
    console.log(`[Profile API] Querying for userId: ${userId}`);
    let { data: profile, error } = await supabase
      .from('profiles')
      .select('id, role, display_name, email, school_id, membership_tier')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[Profile API] Error querying by ID:', error);
    }

    console.log(`[Profile API] Query result: ${profile ? 'found' : 'not found'}`);

    // 2. Fall back to email lookup
    if (!profile && email) {
      console.log(`[Profile API] No profile by ID, trying email lookup: ${email}`);
      const { data: emailProfile, error: emailError } = await supabase
        .from('profiles')
        .select('id, role, display_name, email, school_id, membership_tier')
        .ilike('email', email)
        .maybeSingle();

      if (emailError) {
        console.error('[Profile API] Error querying by email:', emailError);
      }

      if (emailProfile) {
        profile = emailProfile;
        console.log(`[Profile API] Found profile by email, using existing profile ID: ${profile.id}`);
      } else {
        // 3. Auto-create profile
        console.log(`[Profile API] No profile found by email either - auto-creating profile`);
        const displayName = email.split('@')[0];
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email,
            display_name: displayName,
            role: 'teacher',
            membership_tier: 'free',
          })
          .select('id, role, display_name, email, school_id, membership_tier')
          .maybeSingle();

        if (insertError) {
          console.error('[Profile API] Error creating profile:', insertError);
          const { data: retryProfile } = await supabase
            .from('profiles')
            .select('id, role, display_name, email, school_id, membership_tier')
            .eq('id', userId)
            .maybeSingle();
          profile = retryProfile;
        } else {
          profile = newProfile;
          console.log(`[Profile API] Auto-created profile for user: ${email}`);
        }
      }
    } else if (profile) {
      console.log(`[Profile API] Profile found by ID: ${profile.email}, role: ${profile.role}`);
    }

    // 4. Look up school tier if applicable
    let schoolTier = null;
    if (profile?.school_id) {
      const { data: school } = await supabase
        .from('schools')
        .select('subscription_tier')
        .eq('id', profile.school_id)
        .maybeSingle();
      if (school) {
        schoolTier = school.subscription_tier;
      }
    }

    console.log(`[Profile API] Returning profile: ${!!profile}, schoolTier: ${schoolTier}`);

    if (profile) {
      const reqInfo = extractRequestInfo(request);
      trackActivityAsync({
        userId: profile.id,
        userRole: profile.role,
        eventType: 'login',
        eventData: { email: profile.email },
        ...reqInfo,
      });
    }

    return NextResponse.json({
      profile: profile ? { ...profile, school_tier: schoolTier } : null,
    });
  } catch (err) {
    console.error('[Profile API] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, display_name, role = 'teacher' } = body;

    if (!id || !email) {
      return NextResponse.json({ error: 'id and email are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ profile: existing });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        id,
        email,
        display_name: display_name || email.split('@')[0],
        role,
        membership_tier: 'free',
      })
      .select('id, email, display_name, role, membership_tier, school_id')
      .single();

    if (error) {
      console.error('[Profile API] Error creating profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[Profile API] Created profile for user:', id);
    return NextResponse.json({ profile });
  } catch (err: any) {
    console.error('[Profile API] Error creating profile:', err);
    return NextResponse.json({ error: err.message || 'Failed to create profile' }, { status: 500 });
  }
}
