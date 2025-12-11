import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { pupilId, lessonId, classId, assignmentId } = await request.json();
    
    if (!pupilId || !lessonId) {
      return NextResponse.json({ error: 'Pupil ID and Lesson ID are required' }, { status: 400 });
    }

    const { data: existing } = await supabaseAdmin
      .from('progress_records')
      .select('id')
      .eq('pupil_id', pupilId)
      .eq('lesson_id', lessonId)
      .single();

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('progress_records')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ progress: data });
    } else {
      const { data, error } = await supabaseAdmin
        .from('progress_records')
        .insert({
          pupil_id: pupilId,
          lesson_id: lessonId,
          class_id: classId ? parseInt(classId) : null,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
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
