import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

export async function GET() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

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
        year_group_min, 
        year_group_max
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
  } finally {
    await pool.end();
  }
}
