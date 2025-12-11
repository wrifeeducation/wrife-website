import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { pwpAssignmentId, pupilId, content, status } = await request.json();

    if (!pwpAssignmentId || !pupilId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['draft', 'submitted'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('pwp_submissions')
      .select('id')
      .eq('pwp_assignment_id', pwpAssignmentId)
      .eq('pupil_id', pupilId)
      .single();

    let submission;

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('pwp_submissions')
        .update({
          content,
          status,
          submitted_at: status === 'submitted' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      submission = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('pwp_submissions')
        .insert({
          pwp_assignment_id: pwpAssignmentId,
          pupil_id: pupilId,
          content,
          status,
          submitted_at: status === 'submitted' ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (error) throw error;
      submission = data;
    }

    return NextResponse.json({ submission });
  } catch (error) {
    console.error('PWP submit error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
