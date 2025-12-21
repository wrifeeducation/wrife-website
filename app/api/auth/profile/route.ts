import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { trackActivityAsync, extractRequestInfo } from '@/lib/activity-tracker';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `SELECT id, role, display_name, email, school_id, membership_tier
       FROM profiles
       WHERE id = $1`,
      [userId]
    );

    const profile = result.rows[0] || null;

    let schoolTier = null;
    if (profile?.school_id) {
      const schoolResult = await pool.query(
        `SELECT subscription_tier FROM schools WHERE id = $1`,
        [profile.school_id]
      );
      if (schoolResult.rows[0]) {
        schoolTier = schoolResult.rows[0].subscription_tier;
      }
    }

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
      profile: profile ? { ...profile, school_tier: schoolTier } : null 
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

    const existingResult = await pool.query(
      `SELECT id FROM profiles WHERE id = $1`,
      [id]
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json({ profile: existingResult.rows[0] });
    }

    const result = await pool.query(
      `INSERT INTO profiles (id, email, display_name, role, membership_tier, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'free', NOW(), NOW())
       RETURNING id, email, display_name, role, membership_tier, school_id`,
      [id, email, display_name || email.split('@')[0], role]
    );

    console.log('[Profile API] Created profile for user:', id);
    return NextResponse.json({ profile: result.rows[0] });
  } catch (err: any) {
    console.error('[Profile API] Error creating profile:', err);
    return NextResponse.json({ error: err.message || 'Failed to create profile' }, { status: 500 });
  }
}
