import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validatePupilSession } from '@/lib/pupil-auth';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const { pupilId, lessonId, classId, assignmentId, status = 'completed', progressPayload } = await request.json();

    if (!pupilId || !lessonId) {
      return NextResponse.json({ error: 'Pupil ID and Lesson ID are required' }, { status: 400 });
    }

    const validStatuses = ['not_started', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be: not_started, in_progress, or completed' }, { status: 400 });
    }

    const session = await validatePupilSession(pupilId);
    if (!session.valid) {
      return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
    }

    const existingQuery = supabaseAdmin
      .from('progress_records')
      .select('id, status')
      .eq('pupil_id', pupilId)
      .eq('lesson_id', lessonId);

    if (assignmentId) {
      existingQuery.eq('assignment_id', assignmentId);
    }

    const { data: existing } = await existingQuery.maybeSingle();

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (progressPayload !== undefined) {
      updateData.progress_payload = progressPayload;
    }

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    if (existing) {
      if (existing.status === 'completed' && status === 'in_progress') {
        return NextResponse.json({ progress: existing });
      }

      const { data, error } = await supabaseAdmin
        .from('progress_records')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ progress: data });
    } else {
      const insertData: Record<string, unknown> = {
        pupil_id: pupilId,
        lesson_id: lessonId,
        class_id: classId ? parseInt(String(classId)) : null,
        assignment_id: assignmentId ? parseInt(String(assignmentId)) : null,
        ...updateData,
      };

      const { data, error } = await supabaseAdmin
        .from('progress_records')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ progress: data });
    }
  } catch (error) {
    console.error('Practice complete error:', error);
    return NextResponse.json({ error: 'Could not save progress' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const { searchParams } = new URL(request.url);
    const pupilId = searchParams.get('pupilId');
    const lessonId = searchParams.get('lessonId');
    const assignmentId = searchParams.get('assignmentId');

    if (!pupilId || !lessonId) {
      return NextResponse.json({ error: 'Pupil ID and Lesson ID are required' }, { status: 400 });
    }

    let query = supabaseAdmin
      .from('progress_records')
      .select('*')
      .eq('pupil_id', pupilId)
      .eq('lesson_id', parseInt(lessonId));

    if (assignmentId) {
      query = query.eq('assignment_id', parseInt(assignmentId));
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({ progress: data || null });
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json({ error: 'Could not fetch progress' }, { status: 500 });
  }
}
