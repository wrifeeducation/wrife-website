import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { trackActivityAsync, extractRequestInfo } from '@/lib/activity-tracker';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  const email = request.nextUrl.searchParams.get('email');
  
  console.log(`[Profile API] GET request - userId: ${userId}, email: ${email}`);
  
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const db = getPool();
    
    console.log(`[Profile API] Querying for userId: ${userId}`);
    let result = await db.query(
      `SELECT id, role, display_name, email, school_id, membership_tier
       FROM profiles
       WHERE id = $1`,
      [userId]
    );

    console.log(`[Profile API] Query result rows: ${result.rows.length}`);
    let profile = result.rows[0] || null;
    
    if (!profile && email) {
      console.log(`[Profile API] No profile by ID, trying email lookup: ${email}`);
      const emailResult = await db.query(
        `SELECT id, role, display_name, email, school_id, membership_tier
         FROM profiles
         WHERE LOWER(email) = LOWER($1)`,
        [email]
      );
      
      console.log(`[Profile API] Email lookup result rows: ${emailResult.rows.length}`);
      
      if (emailResult.rows[0]) {
        const existingProfile = emailResult.rows[0];
        console.log(`[Profile API] Found profile by email ${email}, syncing ID from ${existingProfile.id} to ${userId}`);
        
        await db.query(
          `UPDATE profiles SET id = $1, updated_at = NOW() WHERE id = $2`,
          [userId, existingProfile.id]
        );
        
        result = await db.query(
          `SELECT id, role, display_name, email, school_id, membership_tier
           FROM profiles
           WHERE id = $1`,
          [userId]
        );
        profile = result.rows[0] || null;
        console.log(`[Profile API] After sync, profile found: ${!!profile}`);
      } else {
        console.log(`[Profile API] No profile found by email either`);
      }
    } else if (profile) {
      console.log(`[Profile API] Profile found by ID: ${profile.email}, role: ${profile.role}`);
    }

    let schoolTier = null;
    if (profile?.school_id) {
      const schoolResult = await db.query(
        `SELECT subscription_tier FROM schools WHERE id = $1`,
        [profile.school_id]
      );
      if (schoolResult.rows[0]) {
        schoolTier = schoolResult.rows[0].subscription_tier;
      }
    }
    
    console.log(`[Profile API] Returning profile: ${!!profile}, schoolTier: ${schoolTier}`)

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

    const db = getPool();

    const existingResult = await db.query(
      `SELECT id FROM profiles WHERE id = $1`,
      [id]
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json({ profile: existingResult.rows[0] });
    }

    const result = await db.query(
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
