import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateFormulas } from '@/lib/formulaGenerator';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  
  try {
    const body = await request.json();
    const { pupilId, lessonNumber, subject, subjectType } = body;

    if (!pupilId || !lessonNumber || !subject || !subjectType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: curriculumData, error: curriculumError } = await supabase
      .from('curriculum_map')
      .select('*')
      .eq('lesson_number', lessonNumber)
      .single();

    if (curriculumError || !curriculumData) {
      return NextResponse.json(
        { error: 'Invalid lesson number' },
        { status: 400 }
      );
    }

    const formulas = generateFormulas({
      lessonNumber,
      subject,
      subjectType,
      conceptsCumulative: curriculumData.concepts_cumulative,
    });

    const { data: sessionData, error: sessionError } = await supabase
      .from('pwp_sessions')
      .insert({
        pupil_id: pupilId,
        lesson_number: lessonNumber,
        subject_text: subject,
        subject_type: subjectType,
        formulas_total: formulas.length,
        status: 'in_progress',
      })
      .select()
      .single();

    if (sessionError || !sessionData) {
      console.error('Session creation error:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    const formulaRecords = formulas.map((formula) => ({
      session_id: sessionData.id,
      formula_number: formula.number,
      formula_structure: formula.structure,
      labelled_example: formula.example,
      word_bank: formula.wordBank,
    }));

    const { error: formulasError } = await supabase
      .from('pwp_formulas')
      .insert(formulaRecords);

    if (formulasError) {
      console.error('Formula creation error:', formulasError);
      return NextResponse.json(
        { error: 'Failed to create formulas' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionId: sessionData.id,
      lessonNumber,
      subject,
      formulas: formulas.map((f) => ({
        number: f.number,
        structure: f.structure,
        example: f.example,
        wordBank: f.wordBank,
        newElements: f.newElements,
      })),
    });
  } catch (error) {
    console.error('Start session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
