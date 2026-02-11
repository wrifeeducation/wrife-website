import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin, getSupabaseAdmin, AuthError } from '@/lib/admin-auth';
import { getPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();

    if (admin.role !== 'admin') {
      return NextResponse.json({ error: 'Only super admins can create admin accounts' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, firstName, lastName, role } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const targetRole = role === 'school_admin' ? 'school_admin' : 'admin';

    const supabaseAdmin = getSupabaseAdmin();

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      if (authError.message?.includes('already been registered')) {
        return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 });
    }

    const db = getPool();
    const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'Admin';

    await db.query(
      `INSERT INTO profiles (id, email, first_name, last_name, display_name, role, membership_tier, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'full', NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET role = $6, email = $2, updated_at = NOW()`,
      [authData.user.id, email, firstName || '', lastName || '', displayName, targetRole]
    );

    return NextResponse.json({
      success: true,
      message: `${targetRole === 'admin' ? 'Admin' : 'School admin'} account created successfully`,
      profile: {
        id: authData.user.id,
        email,
        display_name: displayName,
        role: targetRole,
        membership_tier: 'full',
        created_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message || 'Failed to create admin account' }, { status: 500 });
  }
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
