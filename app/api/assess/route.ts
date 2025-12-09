import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

interface AssessmentRequest {
  submission_id: number;
  teacher_id: string;
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
    const body: AssessmentRequest = await request.json();
    const { submission_id, teacher_id } = body;

    if (!submission_id || !teacher_id) {
      return NextResponse.json(
        { error: 'Missing required fields: submission_id and teacher_id' },
        { status: 400 }
      );
    }

    const { data: submission, error: submissionError } = await supabase
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
    
    let lessonInfo = '';
    if (assignment?.lesson_id) {
      const { data: lesson } = await supabase
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

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    const responseText = response.choices[0]?.message?.content || '';
    
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

    const { data: savedAssessment, error: saveError } = await supabase
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
          model: response.model,
          usage: response.usage,
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

    await supabase
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
