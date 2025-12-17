import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import OpenAI from 'openai';
import { cookies } from 'next/headers';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getOpenAI() {
  return new OpenAI({
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  });
}

interface PWPAssessmentResult {
  grammar_accuracy: number;
  structure_correctness: number;
  feedback: string;
  corrections: string[];
  improved_example: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const openai = getOpenAI();
    
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    const teacher_id = user.id;

    const { pwp_submission_id } = await request.json();

    if (!pwp_submission_id) {
      return NextResponse.json(
        { error: 'Missing required field: pwp_submission_id' },
        { status: 400 }
      );
    }

    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('pwp_submissions')
      .select(`
        *,
        pwp_assignments (
          id, teacher_id,
          progressive_activities (
            level, level_name, grammar_focus, sentence_structure, instructions
          )
        )
      `)
      .eq('id', pwp_submission_id)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    const assignment = submission.pwp_assignments;
    
    if (assignment?.teacher_id !== teacher_id) {
      return NextResponse.json(
        { error: 'You do not have permission to assess this submission' },
        { status: 403 }
      );
    }

    const activity = assignment.progressive_activities;

    const prompt = `You are an expert primary school writing teacher in the UK specializing in grammar instruction. Assess the following pupil writing for their Progressive Writing Practice activity.

ACTIVITY DETAILS:
Level: ${activity.level} - ${activity.level_name}
Grammar Focus: ${activity.grammar_focus}
Expected Sentence Structure: ${activity.sentence_structure}
Instructions Given: ${activity.instructions}

PUPIL'S WRITING:
"""
${submission.content}
"""

Please assess the writing focusing specifically on whether the pupil correctly uses the target sentence structure (${activity.sentence_structure}).

Provide your assessment in the following JSON format:
{
  "grammar_accuracy": 3,
  "structure_correctness": 3,
  "feedback": "Encouraging feedback about their use of the target sentence structure",
  "corrections": ["List specific corrections needed, if any"],
  "improved_example": "Rewrite one of their sentences showing the correct structure"
}

Scoring (1-4):
1 = Working towards - Does not use the target structure correctly
2 = Expected - Uses the target structure with some errors
3 = Greater depth - Uses the target structure correctly and confidently
4 = Mastery - Uses the target structure with sophistication and variety

Be encouraging and age-appropriate. Focus on the specific grammar skill being practised.

Return ONLY valid JSON, no other text.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    const responseText = response.choices[0]?.message?.content || '';
    
    let assessment: PWPAssessmentResult;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      assessment = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      assessment = {
        grammar_accuracy: 2,
        structure_correctness: 2,
        feedback: 'Good effort on this writing task. Keep practising!',
        corrections: [],
        improved_example: 'Continue working on your sentence structure.',
      };
    }

    const { data: savedAssessment, error: saveError } = await supabaseAdmin
      .from('pwp_assessments')
      .insert({
        pwp_submission_id,
        teacher_id,
        grammar_accuracy: assessment.grammar_accuracy,
        structure_correctness: assessment.structure_correctness,
        feedback: assessment.feedback,
        corrections: assessment.corrections,
        improved_example: assessment.improved_example,
        raw_response: {
          model: response.model,
          usage: response.usage,
          content: responseText,
        },
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving PWP assessment:', saveError);
      return NextResponse.json(
        { error: 'Failed to save assessment' },
        { status: 500 }
      );
    }

    await supabaseAdmin
      .from('pwp_submissions')
      .update({ status: 'reviewed' })
      .eq('id', pwp_submission_id);

    return NextResponse.json({
      success: true,
      assessment: savedAssessment,
    });
  } catch (error) {
    console.error('PWP Assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to generate assessment' },
      { status: 500 }
    );
  }
}
