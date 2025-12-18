import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin, supabaseAdmin, AuthError } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();

    const { email, firstName, lastName, schoolId } = await request.json();

    if (!email || !schoolId) {
      return NextResponse.json(
        { error: 'Email and school ID are required' },
        { status: 400 }
      );
    }

    if (admin.role === 'school_admin' && schoolId !== admin.schoolId) {
      return NextResponse.json({ error: 'Forbidden: You can only add teachers to your own school' }, { status: 403 });
    }

    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json({ error: `Failed to check existing user: ${checkError.message}` }, { status: 500 });
    }

    if (existingUser) {
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          school_id: schoolId,
          role: 'teacher',
          first_name: firstName || null,
          last_name: lastName || null,
        })
        .eq('id', existingUser.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Teacher added to school' });
    }

    const tempPassword = Math.random().toString(36).slice(-12);
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email,
        first_name: firstName || null,
        last_name: lastName || null,
        role: 'teacher',
        school_id: schoolId,
      });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Teacher invited successfully' });
  } catch (error: any) {
    console.error('Error inviting teacher:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
