import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { generateCompletion, parseJSONResponse, getCurrentProviderInfo } from '@/lib/llm-provider';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface AssessmentRequest {
  submission_id: number;
}

interface AssessmentResult {
  strengths: string[];
  improvements: string[];
  improved_example: string;
  mechanical_edits: string[];
  banding_score: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Get authenticated user from session
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

    const body: AssessmentRequest = await request.json();
    const { submission_id } = body;

    if (!submission_id) {
      return NextResponse.json(
        { error: 'Missing required field: submission_id' },
        { status: 400 }
      );
    }

    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('submissions')
      .select('*, assignments(*)')
      .eq('id', submission_id)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    const assignment = submission.assignments;
    
    // Verify authenticated teacher owns this assignment
    if (assignment?.teacher_id !== teacher_id) {
      return NextResponse.json(
        { error: 'You do not have permission to assess this submission' },
        { status: 403 }
      );
    }
    
    let lessonInfo = '';
    if (assignment?.lesson_id) {
      const { data: lesson } = await supabaseAdmin
        .from('lessons')
        .select('*')
        .eq('id', assignment.lesson_id)
        .single();
      
      if (lesson) {
        lessonInfo = `
Lesson: ${lesson.title}
Chapter: ${lesson.chapter}, Unit: ${lesson.unit}
Summary: ${lesson.summary || 'N/A'}
Year Group: ${lesson.year_group_min}-${lesson.year_group_max}
`;
      }
    }

    const prompt = `You are an expert primary school writing teacher in the UK. Assess the following pupil writing and provide constructive feedback.

${lessonInfo}

Assignment Title: ${assignment?.title || 'Writing Assignment'}
Instructions: ${assignment?.instructions || 'Complete the writing task'}

PUPIL'S WRITING:
"""
${submission.content}
"""

Please provide your assessment in the following JSON format:
{
  "strengths": ["List 2-3 specific things the pupil did well"],
  "improvements": ["List 2-3 specific areas for improvement with actionable suggestions"],
  "improved_example": "Rewrite one paragraph showing how to improve it",
  "mechanical_edits": ["List specific spelling, punctuation, or grammar corrections needed"],
  "banding_score": 2
}

Banding scores:
1 = Working towards - Needs significant support
2 = Expected - Meeting age-related expectations  
3 = Greater depth - Exceeding expectations
4 = Mastery - Exceptional work

Be encouraging and age-appropriate in your feedback. Focus on the positive while giving clear, helpful suggestions for improvement.

Return ONLY valid JSON, no other text.`;

    const { provider, model } = getCurrentProviderInfo();
    console.log(`General Assessment using ${provider} (${model})`);

    const llmResponse = await generateCompletion({
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      jsonMode: true,
    });

    const responseText = llmResponse.content || '';
    
    let assessment: AssessmentResult;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      assessment = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      assessment = {
        strengths: ['The pupil made a good effort on this writing task'],
        improvements: ['Continue practising your writing skills'],
        improved_example: 'Keep working on developing your ideas further.',
        mechanical_edits: [],
        banding_score: 2,
      };
    }

    const { data: savedAssessment, error: saveError } = await supabaseAdmin
      .from('ai_assessments')
      .insert({
        submission_id,
        teacher_id,
        strengths: assessment.strengths,
        improvements: assessment.improvements,
        improved_example: assessment.improved_example,
        mechanical_edits: assessment.mechanical_edits,
        banding_score: assessment.banding_score,
        raw_response: {
          provider: llmResponse.provider,
          model: llmResponse.model,
          usage: llmResponse.usage,
          content: responseText,
        },
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving assessment:', saveError);
      return NextResponse.json(
        { error: 'Failed to save assessment' },
        { status: 500 }
      );
    }

    await supabaseAdmin
      .from('submissions')
      .update({ status: 'reviewed' })
      .eq('id', submission_id);

    return NextResponse.json({
      success: true,
      assessment: savedAssessment,
    });
  } catch (error) {
    console.error('Assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to generate assessment' },
      { status: 500 }
    );
  }
}
