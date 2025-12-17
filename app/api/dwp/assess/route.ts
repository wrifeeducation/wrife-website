import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined,
  });
}

interface AssessmentRequest {
  attemptId?: string;
  pupilId?: string;
  levelId?: string;
  pupilWriting: string;
  isDemo?: boolean;
  levelNumber?: number;
  activityName?: string;
  promptTitle?: string;
  promptInstructions?: string;
  rubric?: any;
}

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAI();
    const body: AssessmentRequest = await request.json();
    const { attemptId, pupilId, levelId, pupilWriting, isDemo, levelNumber, activityName, promptTitle, promptInstructions, rubric } = body;

    if (!pupilWriting) {
      return NextResponse.json({ error: 'Missing pupil writing' }, { status: 400 });
    }

    if (isDemo) {
      return handleDemoAssessment(openai, pupilWriting, {
        levelNumber: levelNumber || 1,
        activityName: activityName || 'Simple Sentences',
        promptTitle: promptTitle || 'Level 1: Simple Sentences',
        promptInstructions: promptInstructions || 'Write 3 simple sentences.',
        rubric: rubric || { criteria: [] }
      });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error. Please contact your administrator.' },
        { status: 500 }
      );
    }

    if (!attemptId || !pupilId || !levelId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: level, error: levelError } = await supabaseAdmin
      .from('writing_levels')
      .select('*')
      .eq('level_id', levelId)
      .single();

    if (levelError || !level) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    const systemPrompt = `You are an expert primary school writing teacher assessing young pupils' written work. Your role is to provide encouraging, specific, age-appropriate feedback that helps pupils improve.

# ASSESSMENT CONTEXT
- Level: ${level.level_id}
- Activity: ${level.activity_name}
- Learning Objective: ${level.learning_objective}
- Passing Threshold: ${level.passing_threshold}%

# RUBRIC
${JSON.stringify(level.rubric, null, 2)}

# CRITICAL RULES

AGE-APPROPRIATE LANGUAGE:
- Use simple words pupils can understand
- Explain concepts in child-friendly terms
- Avoid jargon or overly technical language

ENCOURAGING TONE:
- ALWAYS be positive and encouraging
- Focus on growth, not just correction
- Celebrate effort and progress
- Never use harsh or discouraging language
- Even low scores get supportive feedback

SPECIFIC FEEDBACK:
- Quote or reference specific parts of pupil's work
- Give concrete examples, not generic praise
- Explain WHY something is good or needs work

ONE TEACHING POINT:
- Growth Area focuses on ONE concept only
- Too many corrections overwhelm pupils
- Pick the most important improvement area

RESPONSE FORMAT:
Return valid JSON with this exact structure:
{
  "score": number (raw score),
  "total": number (total possible),
  "percentage": number (0-100),
  "passed": boolean,
  "performance_band": "mastery" | "secure" | "developing" | "emerging",
  "badge": "emoji + text",
  "feedback": {
    "main_message": "Score + emotion (e.g., 'Brilliant! You got 8 out of 10!')",
    "specific_praise": "1-2 specific things done well",
    "growth_area": "ONE thing to improve (or null if perfect)",
    "encouragement": "Forward-looking positive statement"
  },
  "detailed_analysis": {
    "correct_elements": ["list of correct items"],
    "areas_for_improvement": ["list of areas to work on"],
    "primary_strength": "main strength shown",
    "primary_growth_area": "main area to develop"
  },
  "error_patterns": ["detected error patterns if any"],
  "intervention_needed": boolean,
  "teacher_notes": "Brief summary for teacher dashboard"
}`;

    const userPrompt = `# PUPIL'S WORK

Activity: ${level.prompt_title}
Instructions given: ${level.prompt_instructions}

Pupil's response:
"""
${pupilWriting}
"""

Assess this pupil's work using the rubric provided. Be encouraging and age-appropriate.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('No response from AI');
    }

    let assessment;
    try {
      assessment = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      throw new Error('Failed to parse AI assessment response');
    }
    
    assessment = {
      score: typeof assessment.score === 'number' ? assessment.score : 0,
      total: typeof assessment.total === 'number' ? assessment.total : 10,
      percentage: typeof assessment.percentage === 'number' ? assessment.percentage : 0,
      passed: typeof assessment.passed === 'boolean' ? assessment.passed : false,
      performance_band: assessment.performance_band || 'developing',
      badge: assessment.badge || '',
      feedback: {
        main_message: assessment.feedback?.main_message || 'Keep trying!',
        specific_praise: assessment.feedback?.specific_praise || 'You made a good effort.',
        growth_area: assessment.feedback?.growth_area || null,
        encouragement: assessment.feedback?.encouragement || 'You can do it!'
      },
      detailed_analysis: {
        correct_elements: assessment.detailed_analysis?.correct_elements || [],
        areas_for_improvement: assessment.detailed_analysis?.areas_for_improvement || [],
        primary_strength: assessment.detailed_analysis?.primary_strength || null,
        primary_growth_area: assessment.detailed_analysis?.primary_growth_area || null
      },
      error_patterns: assessment.error_patterns || [],
      intervention_needed: assessment.intervention_needed || false,
      teacher_notes: assessment.teacher_notes || ''
    };

    const { data: updatedAttempt, error: updateError } = await supabaseAdmin
      .from('writing_attempts')
      .update({
        score: assessment.score,
        total_items: assessment.total,
        percentage: assessment.percentage,
        passed: assessment.passed,
        performance_band: assessment.performance_band,
        badge_earned: assessment.badge,
        ai_assessment: assessment,
        error_patterns: assessment.error_patterns || [],
        primary_strength: assessment.detailed_analysis?.primary_strength,
        primary_growth_area: assessment.detailed_analysis?.primary_growth_area,
        intervention_flagged: assessment.intervention_needed || false,
        status: 'assessed',
        time_submitted: new Date().toISOString(),
      })
      .eq('id', attemptId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating attempt:', updateError);
      throw updateError;
    }

    if (assessment.passed) {
      const nextLevelNumber = level.level_number + 1;
      if (nextLevelNumber <= 40) {
        const { data: nextLevel } = await supabaseAdmin
          .from('writing_levels')
          .select('level_id')
          .eq('level_number', nextLevelNumber)
          .single();

        if (nextLevel) {
          await supabaseAdmin
            .from('writing_attempts')
            .update({
              unlocked_next_level: true,
              next_level_id: nextLevel.level_id,
            })
            .eq('id', attemptId);
        }
      }

      await updateProgress(supabaseAdmin, pupilId, level, assessment);
    }

    return NextResponse.json({
      success: true,
      assessment,
      attempt: updatedAttempt,
    });

  } catch (error: any) {
    console.error('DWP Assessment error:', error);
    return NextResponse.json({ error: error.message || 'Assessment failed' }, { status: 500 });
  }
}

async function handleDemoAssessment(openai: OpenAI, pupilWriting: string, demoContext: {
  levelNumber: number;
  activityName: string;
  promptTitle: string;
  promptInstructions: string;
  rubric: any;
}) {
  try {
    const systemPrompt = `You are an expert primary school writing teacher assessing young pupils' written work. Your role is to provide encouraging, specific, age-appropriate feedback.

# DEMO ASSESSMENT CONTEXT
- Level: ${demoContext.levelNumber}
- Activity: ${demoContext.activityName}
- Learning Objective: Write simple, clear sentences

# RUBRIC
${JSON.stringify(demoContext.rubric, null, 2)}

# CRITICAL RULES
- Use simple words pupils can understand
- ALWAYS be positive and encouraging
- Focus on growth, not just correction
- Give concrete examples from their writing
- Pick ONE main improvement area only

# RESPONSE FORMAT
Return valid JSON with this structure:
{
  "overallScore": number (0-100),
  "performanceBand": "mastery" | "secure" | "developing" | "emerging",
  "feedback": {
    "strengths": ["2-3 specific things done well"],
    "improvements": ["1-2 areas to develop"],
    "encouragement": "positive forward-looking statement"
  }
}

PERFORMANCE BANDS:
- 80-100: mastery
- 60-79: secure
- 40-59: developing
- 0-39: emerging`;

    const userPrompt = `# PUPIL'S WORK FOR DEMO ASSESSMENT

Activity: ${demoContext.promptTitle}
Instructions: ${demoContext.promptInstructions}

Pupil's response:
"""
${pupilWriting}
"""

Assess this pupil's work. Be encouraging and age-appropriate.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 800,
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('No response from AI');
    }

    let assessment;
    try {
      assessment = JSON.parse(responseText);
    } catch {
      throw new Error('Failed to parse AI response');
    }

    const normalizeArray = (val: unknown, fallback: string[]): string[] => {
      if (Array.isArray(val)) return val.map(String);
      if (typeof val === 'string') return [val];
      return fallback;
    };

    return NextResponse.json({
      overallScore: typeof assessment.overallScore === 'number' ? assessment.overallScore : 70,
      performanceBand: assessment.performanceBand || 'developing',
      feedback: {
        strengths: normalizeArray(assessment.feedback?.strengths, ['Good effort!']),
        improvements: normalizeArray(assessment.feedback?.improvements, ['Keep practising!']),
        encouragement: String(assessment.feedback?.encouragement || 'You are doing great!')
      }
    });
  } catch (error: any) {
    console.error('Demo assessment error:', error);
    return NextResponse.json({ error: error.message || 'Demo assessment failed' }, { status: 500 });
  }
}

async function updateProgress(supabaseAdmin: any, pupilId: string, level: any, assessment: any) {
  const { data: progress } = await supabaseAdmin
    .from('writing_progress')
    .select('*')
    .eq('pupil_id', pupilId)
    .single();

  const newLevelsCompleted = progress?.levels_completed || [];
  if (!newLevelsCompleted.includes(level.level_id)) {
    newLevelsCompleted.push(level.level_id);
  }

  const nextLevelNumber = level.level_number + 1;
  const nextLevelId = nextLevelNumber <= 40 ? `writing_level_${nextLevelNumber}` : level.level_id;

  const updateData: any = {
    levels_completed: newLevelsCompleted,
    total_levels_passed: (progress?.total_levels_passed || 0) + 1,
    total_attempts: (progress?.total_attempts || 0) + 1,
    current_level_number: Math.min(nextLevelNumber, 40),
    current_level_id: nextLevelId,
    current_tier_number: Math.ceil(Math.min(nextLevelNumber, 40) / 5),
    updated_at: new Date().toISOString(),
    last_activity_date: new Date().toISOString().split('T')[0],
  };

  const bandField = `${assessment.performance_band}_count`;
  if (progress && progress[bandField] !== undefined) {
    updateData[bandField] = (progress[bandField] || 0) + 1;
  }

  if (level.tier_finale) {
    updateData[`tier${level.tier_number}_completed`] = true;
    const tiersCompleted = progress?.tiers_completed || [];
    if (!tiersCompleted.includes(level.tier_number)) {
      updateData.tiers_completed = [...tiersCompleted, level.tier_number];
    }
  }

  if (level.programme_finale && assessment.passed) {
    updateData.programme_completed = true;
    updateData.completed_at = new Date().toISOString();
  }

  if (progress) {
    await supabaseAdmin
      .from('writing_progress')
      .update(updateData)
      .eq('pupil_id', pupilId);
  } else {
    await supabaseAdmin
      .from('writing_progress')
      .insert({
        pupil_id: pupilId,
        ...updateData,
      });
  }
}
