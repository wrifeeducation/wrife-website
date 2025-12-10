import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { classId, pupilId } = await request.json();
    
    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    const { data: assignmentsData, error: assignmentsError } = await supabaseAdmin
      .from('assignments')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (assignmentsError) {
      console.error('Assignments error:', assignmentsError);
      if (assignmentsError.code === 'PGRST205') {
        return NextResponse.json({ assignments: [], submissions: [] });
      }
      return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
    }

    let submissions: any[] = [];
    if (pupilId) {
      try {
        const { data: submissionsData, error: submissionsError } = await supabaseAdmin
          .from('submissions')
          .select('*')
          .eq('pupil_id', pupilId);

        if (!submissionsError) {
          submissions = submissionsData || [];
        }
      } catch (err) {
        console.log('Submissions table may not exist, continuing without submissions');
      }
    }

    return NextResponse.json({
      assignments: assignmentsData || [],
      submissions
    });
  } catch (error) {
    console.error('Fetch assignments error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
