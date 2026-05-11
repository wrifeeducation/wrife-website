import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin, getSupabaseAdmin, AuthError } from '@/lib/admin-auth';
import { getPool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await getAuthenticatedAdmin();
    const supabase = getSupabaseAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const query = supabase
      .from('school_registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[admin/registrations GET] error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ registrations: data || [] });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await getAuthenticatedAdmin();
    const supabase = getSupabaseAdmin();
    const db = getPool();

    const body = await request.json();
    const { id, action, admin_notes, schoolData } = body;

    if (!id || !action) {
      return NextResponse.json({ error: 'id and action are required' }, { status: 400 });
    }

    if (action === 'reject') {
      const { error } = await supabase
        .from('school_registrations')
        .update({ status: 'rejected', admin_notes: admin_notes || null, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, status: 'rejected' });
    }

    if (action === 'approve') {
      // Create the school account
      const { name, domain, teacher_limit, pupil_limit, subscription_tier } = schoolData || {};

      if (!name) {
        return NextResponse.json({ error: 'School name is required to approve' }, { status: 400 });
      }

      // Insert school via DB
      const result = await db.query(
        `INSERT INTO schools (name, domain, teacher_limit, pupil_limit, subscription_tier, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
         RETURNING id`,
        [
          name,
          domain || null,
          teacher_limit || 10,
          pupil_limit || 300,
          subscription_tier || 'trial',
        ]
      );

      const schoolId = result.rows[0]?.id;

      if (!schoolId) {
        return NextResponse.json({ error: 'Failed to create school account' }, { status: 500 });
      }

      // Mark registration as approved + link school_id
      await supabase
        .from('school_registrations')
        .update({
          status: 'approved',
          school_id: schoolId,
          admin_notes: admin_notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      return NextResponse.json({ success: true, status: 'approved', schoolId });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
