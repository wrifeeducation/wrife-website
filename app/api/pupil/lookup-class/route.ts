import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const { classCode } = await request.json();
    
    if (!classCode) {
      return NextResponse.json({ error: 'Class code is required' }, { status: 400 });
    }

    const codeToFind = classCode.toUpperCase().trim();
    
    const { data: classData, error: classError } = await supabaseAdmin
      .from('classes')
      .select('id, name, year_group, class_code')
      .eq('class_code', codeToFind)
      .single();

    if (classError || !classData) {
      return NextResponse.json({ error: 'Class code not found' }, { status: 404 });
    }

    const { data: members, error: membersError } = await supabaseAdmin
      .from('class_members')
      .select('id, pupil_id, pupils(id, first_name, last_name)')
      .eq('class_id', classData.id);

    if (membersError) {
      console.error('Members error:', membersError);
      return NextResponse.json({ error: 'Failed to fetch class members' }, { status: 500 });
    }

    const formattedMembers = (members || []).map((m: any) => ({
      id: m.id,
      pupil_id: m.pupil_id,
      first_name: m.pupils?.first_name || 'Unknown',
      last_name: m.pupils?.last_name || null,
    })).sort((a: any, b: any) => a.first_name.localeCompare(b.first_name));

    return NextResponse.json({
      classInfo: classData,
      members: formattedMembers
    });
  } catch (error) {
    console.error('Lookup error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
