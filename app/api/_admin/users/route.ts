import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin, AuthError } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    const supabase = getSupabaseAdmin();

    const [profilesResult, schoolsResult] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('schools').select('id, name').order('name'),
    ]);

    if (profilesResult.error) {
      console.error('Error fetching profiles:', profilesResult.error);
      return NextResponse.json({ error: profilesResult.error.message }, { status: 500 });
    }

    if (schoolsResult.error) {
      console.error('Error fetching schools:', schoolsResult.error);
      return NextResponse.json({ error: schoolsResult.error.message }, { status: 500 });
    }

    return NextResponse.json({
      profiles: profilesResult.data || [],
      schools: schoolsResult.data || [],
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
    const supabase = getSupabaseAdmin();
    
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      return NextResponse.json({ error: 'Updates must be a valid object' }, { status: 400 });
    }

    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (currentProfile?.role === 'admin' && admin.role !== 'admin') {
      return NextResponse.json({ error: 'Cannot modify admin users' }, { status: 403 });
    }

    const allowedRoles = ['teacher', 'pupil', 'school_admin'];
    if (admin.role === 'admin') {
      allowedRoles.push('admin');
    }

    const allowedUpdates: Record<string, any> = {};
    
    if (updates.school_id !== undefined) {
      allowedUpdates.school_id = updates.school_id || null;
    }
    
    if (updates.role !== undefined && allowedRoles.includes(updates.role)) {
      if (updates.role === 'admin' && admin.role !== 'admin') {
        return NextResponse.json({ error: 'Cannot assign admin role' }, { status: 403 });
      }
      allowedUpdates.role = updates.role;
    }
    
    if (updates.display_name !== undefined) {
      allowedUpdates.display_name = updates.display_name;
    }
    
    if (updates.first_name !== undefined) {
      allowedUpdates.first_name = updates.first_name;
    }
    
    if (updates.last_name !== undefined) {
      allowedUpdates.last_name = updates.last_name;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    allowedUpdates.updated_at = new Date().toISOString();

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(allowedUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
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
