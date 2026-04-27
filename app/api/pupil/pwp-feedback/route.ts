import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/pupil/pwp-feedback?assignmentId=...&pupilId=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const assignmentId = searchParams.get('assignmentId');
  const pupilId = searchParams.get('pupilId');

  if (!assignmentId || !pupilId) {
    return NextResponse.json({ error: 'assignmentId and pupilId are required' }, { status: 400 });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Fetch the submission for this pupil + assignment
    const { data: submission, error: subErr } = await supabaseAdmin
      .from('pwp_submissions')
      .select('id, pwp_assignment_id, pupil_id, status, content, submitted_at')
      .eq('pwp_assignment_id', parseInt(assignmentId, 10))
      .eq('pupil_id', pupilId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subErr) throw subErr;
    if (!submission) {
      return NextResponse.json({ submission: null, assessment: null });
    }

    // Only return assessment if teacher has reviewed
    let assessment: Record<string, any> | null = null;
    if (submission.status === 'reviewed') {
      const { data: asmData } = await supabaseAdmin
        .from('pwp_assessments')
        .select('id, grammar_accuracy, structure_correctness, feedback, corrections, improved_example, teacher_note, created_at')
        .eq('pwp_submission_id', submission.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      assessment = asmData || null;
    }

    return NextResponse.json({ submission, assessment });
  } catch (error: any) {
    console.error('[PWP feedback]', error);
    return NextResponse.json({ error: 'Could not load feedback' }, { status: 500 });
  }
}
