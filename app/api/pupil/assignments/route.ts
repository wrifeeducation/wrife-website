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
    let progressRecords: any[] = [];
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

      try {
        const { data: progressData, error: progressError } = await supabaseAdmin
          .from('progress_records')
          .select('*')
          .eq('pupil_id', pupilId);

        if (!progressError) {
          progressRecords = progressData || [];
        }
      } catch (err) {
        console.log('Progress records may not exist, continuing');
      }
    }

    let pwpAssignments: any[] = [];
    let pwpSubmissions: any[] = [];

    try {
      const { data: pwpData, error: pwpError } = await supabaseAdmin
        .from('pwp_assignments')
        .select(`
          id, activity_id, instructions, due_date, created_at,
          progressive_activities (id, level, level_name, grammar_focus, sentence_structure, instructions, examples, practice_prompts)
        `)
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (!pwpError) {
        pwpAssignments = pwpData || [];
      }
    } catch (err) {
      console.log('PWP assignments may not exist, continuing');
    }

    if (pupilId && pwpAssignments.length > 0) {
      try {
        const pwpAssignmentIds = pwpAssignments.map(a => a.id);
        const { data: pwpSubData, error: pwpSubError } = await supabaseAdmin
          .from('pwp_submissions')
          .select('*')
          .eq('pupil_id', pupilId)
          .in('pwp_assignment_id', pwpAssignmentIds);

        if (!pwpSubError) {
          pwpSubmissions = pwpSubData || [];
        }
      } catch (err) {
        console.log('PWP submissions may not exist, continuing');
      }
    }

    return NextResponse.json({
      assignments: assignmentsData || [],
      submissions,
      progressRecords,
      pwpAssignments,
      pwpSubmissions
    });
  } catch (error) {
    console.error('Fetch assignments error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
