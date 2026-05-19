/**
 * GET /api/pupil/class-leaderboard?pupilId=<id>
 *
 * Pupil-authenticated endpoint (validates pupil exists + belongs to a class).
 * Returns:
 *  - top 5 pupils in the class ranked by Interactive Practice XP
 *  - the requesting pupil's own rank + score (even if outside top 5)
 *  - each entry shows first name + last initial only (privacy)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pupilId = searchParams.get('pupilId');

    if (!pupilId) {
      return NextResponse.json({ error: 'pupilId is required' }, { status: 400 });
    }

    const pool = getPool();

    // Verify pupil exists and get their class
    const pupilRes = await pool.query(
      `SELECT p.id, p.first_name, p.last_name, cm.class_id
       FROM pupils p
       JOIN class_members cm ON cm.pupil_id = p.id
       WHERE p.id = $1
       LIMIT 1`,
      [pupilId],
    );

    if (pupilRes.rows.length === 0) {
      return NextResponse.json({ error: 'Pupil not found or not in a class' }, { status: 404 });
    }

    const { class_id: classId } = pupilRes.rows[0] as { class_id: string };

    // Fetch all class members with their IP stats, ranked by XP
    const result = await pool.query(
      `SELECT
         p.id,
         p.first_name,
         LEFT(COALESCE(p.last_name, ''), 1) AS last_initial,
         COALESCE(SUM(pp.xp_earned), 0)::int AS total_xp,
         COUNT(DISTINCT pp.lesson_id) FILTER (
           WHERE pp.bronze_stars > 0 OR pp.silver_stars > 0 OR pp.gold_stars > 0
         )::int AS lessons_completed,
         COALESCE(MAX(ps.current_streak), 0)::int AS current_streak
       FROM class_members cm
       JOIN pupils p ON cm.pupil_id = p.id
       LEFT JOIN practice_pupil_progress pp ON pp.pupil_id = p.id
       LEFT JOIN practice_streaks ps ON ps.pupil_id = p.id
       WHERE cm.class_id = $1
       GROUP BY p.id, p.first_name, p.last_name
       ORDER BY total_xp DESC, p.first_name ASC`,
      [classId],
    );

    // Build ranked list
    const ranked = result.rows.map((row, idx) => ({
      rank: idx + 1,
      pupilId: row.id as string,
      name: `${row.first_name as string}${row.last_initial ? ` ${row.last_initial as string}.` : ''}`,
      isMe: row.id === pupilId,
      totalXp: row.total_xp as number,
      lessonsCompleted: row.lessons_completed as number,
      currentStreak: row.current_streak as number,
    }));

    const top5 = ranked.slice(0, 5);
    const myEntry = ranked.find((r) => r.isMe);

    // If I'm outside the top 5, include my entry separately so the pupil always sees their position
    const myRankOutside = myEntry && myEntry.rank > 5 ? myEntry : null;

    return NextResponse.json({
      top5,
      myRank: myEntry?.rank ?? null,
      myRankOutside,
      totalPupils: ranked.length,
    });
  } catch (err: unknown) {
    console.error('[/api/pupil/class-leaderboard] error:', err);
    const message = err instanceof Error ? err.message : 'Failed to load';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
