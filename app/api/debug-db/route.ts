import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Temporary debug endpoint — DELETE after fixing DB connection
export async function GET() {
  const connectionString = process.env.PROD_DATABASE_URL;

  if (!connectionString) {
    return NextResponse.json({ error: 'PROD_DATABASE_URL is not set' });
  }

  // Show sanitised connection string (hide password)
  const sanitised = connectionString.replace(/:([^@]+)@/, ':***@');

  try {
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });
    const result = await pool.query('SELECT 1 as ok');
    await pool.end();
    return NextResponse.json({ success: true, row: result.rows[0], connectionString: sanitised });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      code: err.code,
      connectionString: sanitised,
    });
  }
}
