import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(request: NextRequest) {
  try {
    const { userId, accessToken } = await request.json();
    
    if (!userId || !accessToken) {
      return NextResponse.json({ error: 'userId and accessToken are required' }, { status: 400 });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, role, display_name, email, school_id')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[Set Session API] Error fetching profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const sessionData = {
      userId: profile.id,
      role: profile.role,
      displayName: profile.display_name,
      email: profile.email,
      schoolId: profile.school_id,
      accessToken,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
    };

    const cookieStore = await cookies();
    cookieStore.set('wrife-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({ success: true, profile });
  } catch (err) {
    console.error('[Set Session API] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('wrife-session');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Delete Session API] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
