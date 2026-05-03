/**
 * GET  /api/teacher/pwp/set-theme?classId=<uuid>
 *      Returns the current week's theme for the class.
 *      Response: { theme: string | null, suggestions: string[] }
 *
 * POST /api/teacher/pwp/set-theme
 *      Upserts the weekly theme for the class (conflicts on class_id + week_start).
 *      Body:     { classId: string, theme: string, suggestions: string[] }
 *      Response: { success: true }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getPool } from '@/lib/db';

/** Returns ISO date string (YYYY-MM-DD) of the Monday of the current week. */
function getThisMonday(): string {
  const today = new Date();
  const d = new Date(today);
  d.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return d.toISOString().split('T')[0];
}

async function getTeacherProfile() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const pool = getPool();
  const res = await pool.query(
    'SELECT id, role FROM profiles WHERE id = $1 LIMIT 1',
    [user.id],
  );
  return res.rows[0] ?? null;
}

async function checkClassOwnership(
  pool: Awaited<ReturnType<typeof getPool>>,
  classId: string,
  teacherId: string,
): Promise<boolean> {
  const res = await pool.query(
    'SELECT 1 FROM classes WHERE id = $1 AND teacher_id = $2 LIMIT 1',
    [classId, teacherId],
  );
  return res.rows.length > 0;
}

// ─── GET — fetch current week's theme ─────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const teacher = await getTeacherProfile();
    if (!teacher || !['teacher', 'school_admin', 'admin'].includes(teacher.role)) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    if (!classId) {
      return NextResponse.json({ error: 'classId is required' }, { status: 400 });
    }

    const pool = getPool();
    const owns = await checkClassOwnership(pool, classId, teacher.id);
    if (!owns) {
      return NextResponse.json(
        { error: 'Class not found or you do not own it' },
        { status: 404 },
      );
    }

    const weekStart = getThisMonday();
    const res = await pool.query(
      `SELECT theme, suggestions
       FROM pwp_class_themes
       WHERE class_id = $1 AND week_start = $2
       LIMIT 1`,
      [classId, weekStart],
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ theme: null, suggestions: [] });
    }

    const { theme, suggestions } = res.rows[0] as {
      theme: string;
      suggestions: string[] | null;
    };
    return NextResponse.json({ theme, suggestions: suggestions ?? [] });
  } catch (err) {
    console.error('[pwp/set-theme GET] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── POST — upsert this week's theme ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const teacher = await getTeacherProfile();
    if (!teacher || !['teacher', 'school_admin', 'admin'].includes(teacher.role)) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const body = await req.json() as {
      classId?: string;
      theme?: string;
      suggestions?: string[];
    };
    const { classId, theme, suggestions } = body;

    if (!classId || !theme?.trim()) {
      return NextResponse.json(
        { error: 'classId and theme are required' },
        { status: 400 },
      );
    }

    const pool = getPool();
    const owns = await checkClassOwnership(pool, classId, teacher.id);
    if (!owns) {
      return NextResponse.json(
        { error: 'Class not found or you do not own it' },
        { status: 404 },
      );
    }

    const weekStart = getThisMonday();
    const cleanSuggestions = Array.isArray(suggestions)
      ? suggestions.map((s) => s.trim()).filter(Boolean)
      : [];

    // UNIQUE constraint: (class_id, week_start) — safe to use ON CONFLICT
    await pool.query(
      `INSERT INTO pwp_class_themes (class_id, theme, suggestions, week_start, created_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (class_id, week_start) DO UPDATE
         SET theme      = EXCLUDED.theme,
             suggestions = EXCLUDED.suggestions,
             created_by  = EXCLUDED.created_by`,
      [classId, theme.trim(), cleanSuggestions, weekStart, teacher.id],
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[pwp/set-theme POST] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
