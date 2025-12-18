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

    const { data: schools, error } = await supabase
      .from('schools')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching schools:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ schools: schools || [] });
  } catch (error: any) {
    console.error('Error in schools GET:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    const supabase = getSupabaseAdmin();
    
    const body = await request.json();
    const { name, domain, teacher_limit, pupil_limit, subscription_tier, is_active } = body;

    if (!name) {
      return NextResponse.json({ error: 'School name is required' }, { status: 400 });
    }

    const insertData: Record<string, any> = {
      name,
      domain: domain || null,
      teacher_limit: teacher_limit || 10,
      pupil_limit: pupil_limit || 300,
      subscription_tier: subscription_tier || 'trial',
    };

    const { data: school, error } = await supabase
      .from('schools')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating school:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, school });
  } catch (error: any) {
    console.error('Error in schools POST:', error);
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
    const { id, name, domain, teacher_limit, pupil_limit, subscription_tier, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    const allowedUpdates: Record<string, any> = {};
    if (name !== undefined) allowedUpdates.name = name;
    if (domain !== undefined) allowedUpdates.domain = domain;
    if (teacher_limit !== undefined) allowedUpdates.teacher_limit = Math.max(1, parseInt(teacher_limit) || 10);
    if (pupil_limit !== undefined) allowedUpdates.pupil_limit = Math.max(1, parseInt(pupil_limit) || 300);
    if (subscription_tier !== undefined && ['trial', 'basic', 'pro', 'enterprise'].includes(subscription_tier)) {
      allowedUpdates.subscription_tier = subscription_tier;
    }
    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: school, error } = await supabase
      .from('schools')
      .update(allowedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating school:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, school });
  } catch (error: any) {
    console.error('Error in schools PUT:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    const supabase = getSupabaseAdmin();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('schools')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting school:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in schools DELETE:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
