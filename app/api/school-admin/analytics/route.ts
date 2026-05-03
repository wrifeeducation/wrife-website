/**
 * GET /api/school-admin/analytics
 *
 * Returns school-wide analytics for the school_admin dashboard.
 * Aggregates DWP writing attempts and lesson submissions
 * scoped to all classes belonging to the caller's school.
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getPool } from '@/lib/db';

interface AdminProfile {
  id: string;
  role: string;
  school_id: string | null;
}

async function getAdminProfile(): Promise<AdminProfile | null> {
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
    'SELECT id, role, school_id FROM profiles WHERE id = $1 LIMIT 1',
    [user.id],
  );
  return (res.rows[0] as AdminProfile) ?? null;
}

export async function GET() {
  try {
    const profile = await getAdminProfile();
    if (!profile || !['school_admin', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const pool = getPool();

    // Determine school_id — admins can see all (pass null to skip filter),
    // school_admin is scoped to their school.
    const schoolId = profile.role === 'admin' ? null : profile.school_id;
    if (profile.role === 'school_admin' && !schoolId) {
      return NextResponse.json({ error: 'No school assigned to this account' }, { status: 400 });
    }

    // ── 1. Class IDs for this school ──────────────────────────────────────────
    const classRes = await pool.query<{ id: string }>(
      schoolId
        ? 'SELECT id FROM classes WHERE school_id = $1'
        : 'SELECT id FROM classes',
      schoolId ? [schoolId] : [],
    );
    const classIds: string[] = classRes.rows.map(r => r.id);

    if (classIds.length === 0) {
      return NextResponse.json({
        summary: { total_dwp_assessed: 0, total_dwp_passed: 0, pass_rate: 0, avg_word_count: 0, intervention_count: 0, active_pupils_7d: 0, total_submissions: 0 },
        band_distribution: [],
        class_breakdown: [],
        recent_activity: [],
      });
    }

    // ── 2. DWP summary (last 30 days) ─────────────────────────────────────────
    const summaryRes = await pool.query<{
      total_assessed: string;
      total_passed: string;
      avg_word_count: string;
      intervention_count: string;
    }>(
      `SELECT
         COUNT(*)                                                          AS total_assessed,
         SUM(CASE WHEN wa.passed THEN 1 ELSE 0 END)                       AS total_passed,
         COALESCE(ROUND(AVG(wa.word_count)), 0)                            AS avg_word_count,
         SUM(CASE WHEN wa.intervention_flagged THEN 1 ELSE 0 END)          AS intervention_count
       FROM writing_attempts wa
       JOIN class_members cm ON cm.pupil_id = wa.pupil_id
       WHERE cm.class_id = ANY($1::uuid[])
         AND wa.status = 'assessed'
         AND wa.created_at >= NOW() - INTERVAL '30 days'`,
      [classIds],
    );

    // ── 3. Active pupils (7 days) ─────────────────────────────────────────────
    const activeRes = await pool.query<{ active_pupils: string }>(
      `SELECT COUNT(DISTINCT wa.pupil_id) AS active_pupils
       FROM writing_attempts wa
       JOIN class_members cm ON cm.pupil_id = wa.pupil_id
       WHERE cm.class_id = ANY($1::uuid[])
         AND wa.created_at >= NOW() - INTERVAL '7 days'`,
      [classIds],
    );

    // ── 4. Lesson submissions (last 30 days) ──────────────────────────────────
    const submissionsRes = await pool.query<{ total: string }>(
      `SELECT COUNT(*) AS total
       FROM submissions s
       JOIN assignments a ON a.id = s.assignment_id
       WHERE a.class_id = ANY($1::uuid[])
         AND s.submitted_at >= NOW() - INTERVAL '30 days'`,
      [classIds],
    );

    // ── 5. Band distribution ──────────────────────────────────────────────────
    const bandRes = await pool.query<{ performance_band: string; count: string }>(
      `SELECT wa.performance_band, COUNT(*) AS count
       FROM writing_attempts wa
       JOIN class_members cm ON cm.pupil_id = wa.pupil_id
       WHERE cm.class_id = ANY($1::uuid[])
         AND wa.status = 'assessed'
         AND wa.performance_band IS NOT NULL
       GROUP BY wa.performance_band
       ORDER BY CASE wa.performance_band
         WHEN 'mastery'    THEN 1
         WHEN 'secure'     THEN 2
         WHEN 'developing' THEN 3
         WHEN 'emerging'   THEN 4
         ELSE 5
       END`,
      [classIds],
    );

    // ── 6. Per-class breakdown ────────────────────────────────────────────────
    const classBreakdownRes = await pool.query<{
      class_id: string;
      class_name: string;
      year_group: number;
      teacher_name: string;
      pupil_count: string;
      dwp_assessed: string;
      dwp_passed: string;
      avg_percentage: string;
    }>(
      `SELECT
         c.id                                                               AS class_id,
         c.name                                                             AS class_name,
         c.year_group,
         COALESCE(p.display_name, p.email, 'Unassigned')                   AS teacher_name,
         COUNT(DISTINCT cm.pupil_id)                                        AS pupil_count,
         COUNT(DISTINCT CASE WHEN wa.status = 'assessed' THEN wa.id END)   AS dwp_assessed,
         SUM(CASE WHEN wa.passed = true THEN 1 ELSE 0 END)                 AS dwp_passed,
         COALESCE(ROUND(AVG(CASE WHEN wa.status = 'assessed' THEN wa.percentage END)), 0) AS avg_percentage
       FROM classes c
       LEFT JOIN profiles p ON p.id = c.teacher_id
       LEFT JOIN class_members cm ON cm.class_id = c.id
       LEFT JOIN writing_attempts wa ON wa.pupil_id = cm.pupil_id
       WHERE c.id = ANY($1::uuid[])
       GROUP BY c.id, c.name, c.year_group, teacher_name
       ORDER BY c.year_group, c.name`,
      [classIds],
    );

    // Fetch submission counts per class
    const subPerClassRes = await pool.query<{ class_id: string; sub_count: string }>(
      `SELECT a.class_id, COUNT(s.id) AS sub_count
       FROM assignments a
       LEFT JOIN submissions s ON s.assignment_id = a.id
       WHERE a.class_id = ANY($1::uuid[])
       GROUP BY a.class_id`,
      [classIds],
    );
    const subByClass: Record<string, number> = {};
    for (const row of subPerClassRes.rows) {
      subByClass[row.class_id] = parseInt(row.sub_count, 10);
    }

    // ── 7. Recent activity (last 10 assessed DWP attempts) ───────────────────
    const recentRes = await pool.query<{
      pupil_name: string;
      class_name: string;
      level_id: string;
      performance_band: string;
      passed: boolean;
      percentage: number;
      word_count: number;
      time_submitted: string;
    }>(
      `SELECT
         COALESCE(pu.display_name, pu.first_name || ' ' || pu.last_name)  AS pupil_name,
         c.name                                                             AS class_name,
         wa.level_id,
         wa.performance_band,
         wa.passed,
         wa.percentage,
         wa.word_count,
         wa.time_submitted
       FROM writing_attempts wa
       JOIN class_members cm ON cm.pupil_id = wa.pupil_id
       JOIN classes c ON c.id = cm.class_id
       JOIN pupils pu ON pu.id = wa.pupil_id
       WHERE c.id = ANY($1::uuid[])
         AND wa.status = 'assessed'
       ORDER BY wa.time_submitted DESC NULLS LAST
       LIMIT 10`,
      [classIds],
    );

    // ── Assemble response ─────────────────────────────────────────────────────
    const s = summaryRes.rows[0];
    const totalAssessed = parseInt(s?.total_assessed ?? '0', 10);
    const totalPassed   = parseInt(s?.total_passed   ?? '0', 10);

    return NextResponse.json({
      summary: {
        total_dwp_assessed:  totalAssessed,
        total_dwp_passed:    totalPassed,
        pass_rate:           totalAssessed > 0 ? Math.round((totalPassed / totalAssessed) * 100) : 0,
        avg_word_count:      parseInt(s?.avg_word_count      ?? '0', 10),
        intervention_count:  parseInt(s?.intervention_count  ?? '0', 10),
        active_pupils_7d:    parseInt(activeRes.rows[0]?.active_pupils ?? '0', 10),
        total_submissions:   parseInt(submissionsRes.rows[0]?.total ?? '0', 10),
      },
      band_distribution: bandRes.rows.map(r => ({
        band:  r.performance_band,
        count: parseInt(r.count, 10),
      })),
      class_breakdown: classBreakdownRes.rows.map(r => ({
        class_id:     r.class_id,
        class_name:   r.class_name,
        year_group:   r.year_group,
        teacher_name: r.teacher_name,
        pupil_count:  parseInt(r.pupil_count, 10),
        dwp_assessed: parseInt(r.dwp_assessed, 10),
        dwp_passed:   parseInt(r.dwp_passed, 10),
        pass_rate:    parseInt(r.dwp_assessed, 10) > 0
          ? Math.round((parseInt(r.dwp_passed, 10) / parseInt(r.dwp_assessed, 10)) * 100)
          : 0,
        avg_percentage: parseInt(r.avg_percentage, 10),
        submissions:  subByClass[r.class_id] ?? 0,
      })),
      recent_activity: recentRes.rows,
    });

  } catch (err: unknown) {
    console.error('[/api/school-admin/analytics] error:', err);
    const message = err instanceof Error ? err.message : 'Failed to load analytics';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
