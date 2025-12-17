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
    const { pupilId, lessonId, classId, status = 'completed', progressPayload } = await request.json();
    
    if (!pupilId || !lessonId) {
      return NextResponse.json({ error: 'Pupil ID and Lesson ID are required' }, { status: 400 });
    }

    const validStatuses = ['not_started', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be: not_started, in_progress, or completed' }, { status: 400 });
    }

    const { data: existing } = await supabaseAdmin
      .from('progress_records')
      .select('id, status')
      .eq('pupil_id', pupilId)
      .eq('lesson_id', lessonId)
      .single();

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
      const { data, error } = await supabaseAdmin
        .from('progress_records')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ progress: data });
    } else {
      const insertData = {
        pupil_id: pupilId,
        lesson_id: lessonId,
        class_id: classId ? parseInt(classId) : null,
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

    if (!pupilId || !lessonId) {
      return NextResponse.json({ error: 'Pupil ID and Lesson ID are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('progress_records')
      .select('*')
      .eq('pupil_id', pupilId)
      .eq('lesson_id', parseInt(lessonId))
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({ progress: data || null });
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json({ error: 'Could not fetch progress' }, { status: 500 });
  }
}
