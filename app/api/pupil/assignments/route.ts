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

    let dwpAssignments: any[] = [];
    let writingAttempts: any[] = [];

    try {
      const { data: dwpData, error: dwpError } = await supabaseAdmin
        .from('dwp_assignments')
        .select(`
          id, level_id, instructions, due_date, created_at,
          writing_levels (level_number, tier_number, activity_name, prompt_title, prompt_instructions, learning_objective)
        `)
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (!dwpError) {
        dwpAssignments = dwpData || [];
      }
    } catch (err) {
      console.log('DWP assignments may not exist, continuing');
    }

    if (pupilId && dwpAssignments.length > 0) {
      try {
        const dwpAssignmentIds = dwpAssignments.map(a => a.id);
        const { data: attemptData, error: attemptError } = await supabaseAdmin
          .from('writing_attempts')
          .select('*')
          .eq('pupil_id', pupilId)
          .in('dwp_assignment_id', dwpAssignmentIds);

        if (!attemptError) {
          writingAttempts = attemptData || [];
        }
      } catch (err) {
        console.log('Writing attempts may not exist, continuing');
      }
    }

    return NextResponse.json({
      assignments: assignmentsData || [],
      submissions,
      progressRecords,
      pwpAssignments,
      pwpSubmissions,
      dwpAssignments,
      writingAttempts
    });
  } catch (error) {
    console.error('Fetch assignments error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
