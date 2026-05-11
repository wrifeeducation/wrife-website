import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Generates a real Supabase session for a pupil.
 * Auto-provisions a Supabase auth user on first login (id = pupil.id
 * so auth.uid() === pupils.id in all RLS policies).
 *
 * Returns { access_token, refresh_token, expires_at } or null on failure.
 * Never throws — caller treats token generation as non-fatal.
 */
async function generatePupilSupabaseSession(
  pupilId: string,
  authUserId: string | null,
  firstName: string | null,
  displayName: string | null,
): Promise<{ access_token: string; refresh_token: string; expires_at: number } | null> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const syntheticEmail = `pupil-${pupilId}@practice.wrife.co.uk`;
    // Include first_name in user_metadata so sub-apps can read it from the JWT
    // without a separate DB query. Safe to call on every login — updateUserById
    // is idempotent and keeps the metadata current if the name ever changes.
    const userMeta = {
      role: 'pupil',
      pupil_id: pupilId,
      first_name: firstName ?? '',
      display_name: displayName ?? firstName ?? '',
    };

    // Ensure auth user exists (provision on first login)
    if (!authUserId) {
      const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
        id: pupilId,
        email: syntheticEmail,
        email_confirm: true,
        user_metadata: userMeta,
      });

      if (createErr) {
        // User may already exist from Interactive Practice login — that's fine
        const isAlreadyExists =
          createErr.message?.toLowerCase().includes('already') ||
          (createErr as { status?: number }).status === 422;
        if (!isAlreadyExists) {
          console.error('Failed to provision auth user:', createErr.message);
          return null;
        }
      } else {
        // Store auth_user_id so future logins skip provisioning
        getPool()
          .query('UPDATE pupils SET auth_user_id = $1 WHERE id = $2', [pupilId, pupilId])
          .catch(() => {});
      }
    }

    // Always refresh user_metadata BEFORE generating the OTP so the new JWT
    // includes the updated first_name. Must be awaited — if fire-and-forget,
    // generateLink races ahead and issues the JWT with stale metadata (no first_name).
    await supabaseAdmin.auth.admin
      .updateUserById(pupilId, { user_metadata: userMeta })
      .catch((e: Error) => console.error('user_metadata update failed:', e.message));

    // Generate a magic-link OTP (no email sent)
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: syntheticEmail,
    });
    if (linkErr || !linkData) {
      console.error('generateLink failed:', linkErr?.message);
      return null;
    }

    const otp = (linkData as { properties?: { email_otp?: string } }).properties?.email_otp;
    if (!otp) {
      console.error('generateLink returned no OTP');
      return null;
    }

    // Exchange OTP for a real session using an anon client
    // (verifyOtp requires the anon key, not the service role key)
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, detectSessionInUrl: false } }
    );

    const { data: otpData, error: otpErr } = await anonClient.auth.verifyOtp({
      email: syntheticEmail,
      token: otp,
      type: 'email',
    });

    if (otpErr || !otpData?.session) {
      console.error('verifyOtp failed:', otpErr?.message ?? 'no session');
      return null;
    }

    return {
      access_token: otpData.session.access_token,
      refresh_token: otpData.session.refresh_token,
      expires_at: otpData.session.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
    };
  } catch (err) {
    console.error('generatePupilSupabaseSession error:', err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classCode, username, pin } = body;

    if (!classCode || !username || !pin) {
      return NextResponse.json({
        error: 'Class code, username, and PIN are required'
      }, { status: 400 });
    }

    const pool = getPool();

    // Look up pupil via class_members join — also fetch auth_user_id for SSO provisioning
    const result = await pool.query(
      `SELECT p.id, p.first_name, p.last_name, p.display_name, p.username,
              p.password_hash, p.year_group, p.is_active, p.auth_user_id,
              c.id as class_uuid, c.name as class_name, c.class_code,
              t.display_name as teacher_name
       FROM pupils p
       JOIN class_members cm ON cm.pupil_id = p.id
       JOIN classes c ON c.id = cm.class_id
       LEFT JOIN profiles t ON c.teacher_id = t.id
       WHERE LOWER(c.class_code) = LOWER($1)
         AND LOWER(p.username) = LOWER($2)`,
      [classCode.trim(), username.trim()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid class code or username' }, { status: 401 });
    }

    const pupil = result.rows[0];

    if (!pupil.is_active) {
      return NextResponse.json(
        { error: 'Account is disabled. Please contact your teacher.' },
        { status: 403 }
      );
    }

    // Verify PIN — bcrypt first, then auto-upgrade legacy plain PINs
    let isValidPassword = await bcrypt.compare(pin, pupil.password_hash);

    if (!isValidPassword && /^\d{4}$/.test(pupil.password_hash) && pin === pupil.password_hash) {
      isValidPassword = true;
      const newHash = await bcrypt.hash(pin, 10);
      pool
        .query('UPDATE pupils SET password_hash = $1 WHERE id = $2', [newHash, pupil.id])
        .catch(() => {});
    }

    if (!isValidPassword) {
      pool
        .query(
          `INSERT INTO pupil_activity_log (pupil_id, event_type, event_data, ip_address)
           VALUES ($1, 'login_failed', $2, $3)`,
          [pupil.id, JSON.stringify({ reason: 'wrong_pin' }), request.headers.get('x-forwarded-for') || 'unknown']
        )
        .catch(() => {});

      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }

    // Generate Supabase session tokens (non-fatal — login still succeeds without them)
    const supabaseTokens = await generatePupilSupabaseSession(
      pupil.id, pupil.auth_user_id, pupil.first_name ?? null, pupil.display_name ?? null
    );

    // Create legacy session cookie (kept for backward compat during migration)
    const token = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 8);

    await pool.query(
      `INSERT INTO pupil_sessions (pupil_id, session_token, expires_at, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [pupil.id, token, expiresAt, request.headers.get('x-forwarded-for') || null]
    );

    pool.query('UPDATE pupils SET last_login_at = NOW() WHERE id = $1', [pupil.id]).catch(() => {});
    pool
      .query(
        `INSERT INTO pupil_activity_log (pupil_id, event_type, event_data, ip_address)
         VALUES ($1, 'login', $2, $3)`,
        [pupil.id, JSON.stringify({ success: true, sso: !!supabaseTokens }), request.headers.get('x-forwarded-for') || 'unknown']
      )
      .catch(() => {});

    const response = NextResponse.json({
      success: true,
      // Supabase session tokens — present when SSO provisioning succeeded
      ...(supabaseTokens ?? {}),
      pupil: {
        id: pupil.id,
        firstName: pupil.first_name,
        lastName: pupil.last_name,
        displayName: pupil.display_name,
        username: pupil.username,
        yearGroup: pupil.year_group,
        classId: pupil.class_uuid,
        className: pupil.class_name,
        teacherName: pupil.teacher_name,
      },
    });

    response.cookies.set('pupil_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Pupil login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
