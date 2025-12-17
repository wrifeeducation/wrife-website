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
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      );
    }

    const { data: sessionData, error: sessionError } = await supabase
      .from('pwp_sessions')
      .select('*, pwp_formulas(*)')
      .eq('id', sessionId)
      .single();

    if (sessionError || !sessionData) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const formulas = sessionData.pwp_formulas || [];
    const correctCount = formulas.filter((f: any) => f.is_correct).length;
    const accuracy = formulas.length > 0 ? (correctCount / formulas.length) * 100 : 0;

    const { error: updateError } = await supabase
      .from('pwp_sessions')
      .update({
        completed_at: new Date().toISOString(),
        accuracy_percentage: accuracy,
        status: 'completed',
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Complete session error:', updateError);
      return NextResponse.json(
        { error: 'Failed to complete session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionSummary: {
        formulasCompleted: formulas.length,
        formulasTotal: sessionData.formulas_total,
        accuracyPercentage: accuracy,
      },
    });
  } catch (error) {
    console.error('Complete session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
