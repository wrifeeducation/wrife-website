import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin, createAdminClient, AuthError } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('progressive_activities')
      .select('*')
      .order('level', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ activities: data || [] });
  } catch (error: any) {
    console.error('Error fetching PWP activities:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    const supabase = createAdminClient();
    const body = await request.json();

    const { error } = await supabase
      .from('progressive_activities')
      .insert(body);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error creating PWP activity:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    const supabase = createAdminClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Activity ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('progressive_activities')
      .update(updates)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating PWP activity:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Activity ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('progressive_activities')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting PWP activity:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
