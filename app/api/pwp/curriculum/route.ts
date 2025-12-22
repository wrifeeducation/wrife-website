import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

declare global {
  var pgPool: Pool | undefined;
}

function getPool(): Pool {
  if (!globalThis.pgPool) {
    globalThis.pgPool = new Pool({
      connectionString: process.env.PROD_DATABASE_URL || process.env.DATABASE_URL,
      max: 3,
    });
  }
  return globalThis.pgPool;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lessonNumber = parseInt(searchParams.get('lesson') || '10');

  try {
    const pool = getPool();
    const result = await pool.query(
      'SELECT * FROM curriculum_map WHERE lesson_number = $1',
      [lessonNumber]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
