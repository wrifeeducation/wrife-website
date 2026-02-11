import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = getPool();
    const result = await pool.query(
      "SELECT id, email, role FROM profiles WHERE role = 'admin'"
    );
    const adminCount = result.rows.length;

    if (adminCount > 0) {
      const supabaseAdmin = getSupabaseAdmin();
      const adminProfile = result.rows[0];

      let authUserExists = false;
      try {
        const { data } = await supabaseAdmin.auth.admin.getUserById(adminProfile.id);
        authUserExists = !!data?.user;
      } catch {
        authUserExists = false;
      }

      return NextResponse.json({
        adminExists: true,
        count: adminCount,
        authUserExists,
        email: adminProfile.email,
      });
    }

    return NextResponse.json({ adminExists: false, count: 0, authUserExists: false });
  } catch (error) {
    console.error('Error checking admin:', error);
    return NextResponse.json({ error: 'Failed to check admin status' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const pool = getPool();
    const body = await request.json();
    const { email, password, firstName, lastName, action } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const existingAdmin = await pool.query(
      "SELECT id, email FROM profiles WHERE role = 'admin'"
    );

    if (existingAdmin.rows.length > 0 && action === 'recover') {
      const adminProfile = existingAdmin.rows[0];

      let authUser = null;
      try {
        const { data } = await supabaseAdmin.auth.admin.getUserById(adminProfile.id);
        authUser = data?.user;
      } catch {
        authUser = null;
      }

      if (authUser) {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          adminProfile.id,
          { password, email }
        );

        if (updateError) {
          console.error('Error updating auth user:', updateError);
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
      } else {
        await supabaseAdmin.auth.admin.deleteUser(adminProfile.id).catch(() => {});

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (authError) {
          console.error('Error creating auth user:', authError);
          return NextResponse.json({ error: authError.message }, { status: 500 });
        }

        if (authData.user) {
          await pool.query(
            `UPDATE profiles SET id = $1, email = $2, updated_at = NOW() WHERE id = $3`,
            [authData.user.id, email, adminProfile.id]
          );
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Admin account recovered successfully',
      });
    }

    if (existingAdmin.rows.length > 0) {
      return NextResponse.json(
        { error: 'An admin account already exists. Use the recover option to reset credentials.' },
        { status: 403 }
      );
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 });
    }

    await pool.query(
      `INSERT INTO profiles (id, email, first_name, last_name, display_name, role, membership_tier, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'admin', 'full', NOW(), NOW())`,
      [authData.user.id, email, firstName || 'Admin', lastName || '', firstName ? `${firstName} ${lastName || ''}`.trim() : 'Admin']
    );

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      userId: authData.user.id,
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Failed to create admin account' }, { status: 500 });
  }
}
