import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const openai = new OpenAI();

interface AssessmentRequest {
  attemptId: string;
  pupilId: string;
  levelId: string;
  pupilWriting: string;
}

export async function POST(request: NextRequest) {
  try {
    const { attemptId, pupilId, levelId, pupilWriting }: AssessmentRequest = await request.json();

    if (!attemptId || !pupilId || !levelId || !pupilWriting) {
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

      await updateProgress(pupilId, level, assessment);
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

async function updateProgress(pupilId: string, level: any, assessment: any) {
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
