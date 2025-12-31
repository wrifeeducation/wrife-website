import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin, AuthError } from '@/lib/admin-auth';
import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL;
    pool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    const db = getPool();

    const [profilesResult, schoolsResult] = await Promise.all([
      db.query(`SELECT * FROM profiles ORDER BY created_at DESC`),
      db.query(`SELECT id, name FROM schools ORDER BY name`),
    ]);

    return NextResponse.json({
      profiles: profilesResult.rows || [],
      schools: schoolsResult.rows || [],
    });
  } catch (error: any) {
    console.error('Error in users GET:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    const db = getPool();
    
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      return NextResponse.json({ error: 'Updates must be a valid object' }, { status: 400 });
    }

    const currentProfileResult = await db.query(
      `SELECT role FROM profiles WHERE id = $1`,
      [userId]
    );
    const currentProfile = currentProfileResult.rows[0];

    if (currentProfile?.role === 'admin' && admin.role !== 'admin') {
      return NextResponse.json({ error: 'Cannot modify admin users' }, { status: 403 });
    }

    const allowedRoles = ['teacher', 'pupil', 'school_admin'];
    if (admin.role === 'admin') {
      allowedRoles.push('admin');
    }

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (updates.school_id !== undefined) {
      setClauses.push(`school_id = $${paramIndex++}`);
      values.push(updates.school_id || null);
    }
    
    if (updates.role !== undefined && allowedRoles.includes(updates.role)) {
      if (updates.role === 'admin' && admin.role !== 'admin') {
        return NextResponse.json({ error: 'Cannot assign admin role' }, { status: 403 });
      }
      setClauses.push(`role = $${paramIndex++}`);
      values.push(updates.role);
    }
    
    if (updates.display_name !== undefined) {
      setClauses.push(`display_name = $${paramIndex++}`);
      values.push(updates.display_name);
    }
    
    if (updates.first_name !== undefined) {
      setClauses.push(`first_name = $${paramIndex++}`);
      values.push(updates.first_name);
    }
    
    if (updates.last_name !== undefined) {
      setClauses.push(`last_name = $${paramIndex++}`);
      values.push(updates.last_name);
    }
    
    if (updates.membership_tier !== undefined) {
      const validTiers = ['free', 'standard', 'full'];
      if (!validTiers.includes(updates.membership_tier)) {
        return NextResponse.json({ 
          error: `Invalid membership tier: ${updates.membership_tier}. Must be one of: ${validTiers.join(', ')}` 
        }, { status: 400 });
      }
      setClauses.push(`membership_tier = $${paramIndex++}`);
      values.push(updates.membership_tier);
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    setClauses.push(`updated_at = $${paramIndex++}`);
    values.push(new Date().toISOString());
    
    values.push(userId);
    
    const query = `
      UPDATE profiles 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, values);
    const profile = result.rows[0];

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Error in users PUT:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
