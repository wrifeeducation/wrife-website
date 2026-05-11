import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      school_name,
      contact_name,
      email,
      phone,
      website,
      num_pupils,
      num_teachers,
      year_groups,
      message,
    } = body;

    if (!school_name || !contact_name || !email) {
      return NextResponse.json(
        { error: 'School name, contact name, and email are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Check for duplicate submission from same email in last 24h
    const { data: existing } = await supabase
      .from('school_registrations')
      .select('id')
      .eq('email', email)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'A registration request from this email was already submitted recently. We will be in touch soon.' },
        { status: 409 }
      );
    }

    const { error } = await supabase.from('school_registrations').insert({
      school_name,
      contact_name,
      email,
      phone: phone || null,
      website: website || null,
      num_pupils: num_pupils ? parseInt(num_pupils) : null,
      num_teachers: num_teachers ? parseInt(num_teachers) : null,
      year_groups: year_groups || [],
      message: message || null,
      status: 'pending',
    });

    if (error) {
      console.error('[school-register] DB error:', error);
      return NextResponse.json({ error: 'Failed to submit registration. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[school-register] Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
