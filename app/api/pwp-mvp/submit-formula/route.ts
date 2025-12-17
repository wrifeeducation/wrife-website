import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    const { sessionId, formulaNumber, pupilSentence } = body;

    if (!sessionId || !formulaNumber || !pupilSentence) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: formulaData, error: formulaError } = await supabase
      .from('pwp_formulas')
      .select('*')
      .eq('session_id', sessionId)
      .eq('formula_number', formulaNumber)
      .single();

    if (formulaError || !formulaData) {
      return NextResponse.json(
        { error: 'Formula not found' },
        { status: 404 }
      );
    }

    const trimmedSentence = pupilSentence.trim();
    const isCorrect = trimmedSentence.length > 0;

    const { error: updateError } = await supabase
      .from('pwp_formulas')
      .update({
        pupil_sentence: trimmedSentence,
        is_correct: isCorrect,
        attempts: (formulaData.attempts || 0) + 1,
        completed_at: new Date().toISOString(),
      })
      .eq('id', formulaData.id);

    if (updateError) {
      console.error('Update formula error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update formula' },
        { status: 500 }
      );
    }

    await supabase
      .from('pwp_sessions')
      .update({
        formulas_completed: formulaNumber,
      })
      .eq('id', sessionId);

    const { data: nextFormula } = await supabase
      .from('pwp_formulas')
      .select('*')
      .eq('session_id', sessionId)
      .eq('formula_number', formulaNumber + 1)
      .single();

    return NextResponse.json({
      isCorrect,
      feedback: isCorrect
        ? {
            type: 'success',
            message: 'Excellent! You REWROTE the complete sentence!',
          }
        : {
            type: 'error',
            message: 'Try again. Remember to write the COMPLETE sentence.',
          },
      nextFormula: nextFormula
        ? {
            number: nextFormula.formula_number,
            structure: nextFormula.formula_structure,
            example: nextFormula.labelled_example,
            wordBank: nextFormula.word_bank,
          }
        : null,
    });
  } catch (error) {
    console.error('Submit formula error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
