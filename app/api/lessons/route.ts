import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const pool = getPool();

  try {
    const result = await pool.query(`
      SELECT
        id,
        lesson_number,
        title,
        has_parts,
        part,
        chapter,
        unit,
        summary,
        duration_minutes,
        year_groups,
        -- Parse "Years 2-3" into year_group_min and year_group_max for frontend compatibility
        (regexp_match(year_groups, '(\\d+)-(\\d+)'))[1]::int AS year_group_min,
        (regexp_match(year_groups, '(\\d+)-(\\d+)'))[2]::int AS year_group_max
      FROM lessons
      ORDER BY lesson_number ASC, part ASC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}
