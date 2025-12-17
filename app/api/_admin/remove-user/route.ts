import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin, supabaseAdmin, AuthError } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (admin.role === 'school_admin') {
      const { data: targetUser, error: targetError } = await supabaseAdmin
        .from('profiles')
        .select('school_id')
        .eq('id', userId)
        .single();

      if (targetError && targetError.code !== 'PGRST116') {
        return NextResponse.json({ error: `Failed to lookup user: ${targetError.message}` }, { status: 500 });
      }

      if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (targetUser.school_id !== admin.schoolId) {
        return NextResponse.json({ error: 'Forbidden: You can only manage users in your own school' }, { status: 403 });
      }
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ school_id: null })
      .eq('id', userId);

    if (profileError) {
      throw profileError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error removing user:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
