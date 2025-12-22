import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin, AuthError } from '@/lib/admin-auth';
import { Pool } from 'pg';

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();

    const pool = new Pool({
      connectionString: process.env.PROD_DATABASE_URL || process.env.DATABASE_URL,
    });

    try {
      await pool.query("NOTIFY pgrst, 'reload schema'");
      await pool.end();
      
      return NextResponse.json({ 
        success: true, 
        message: 'Schema cache refresh requested. Changes may take a few seconds to propagate.' 
      });
    } catch (dbError: any) {
      await pool.end();
      console.error('Failed to send NOTIFY:', dbError);
      return NextResponse.json({ 
        error: `Failed to refresh schema cache: ${dbError.message}` 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error reloading schema:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
