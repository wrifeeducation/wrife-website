import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

interface FormulaValidationResult {
  is_correct: boolean;
  errors?: {
    type: string;
    message: string;
  }[];
  feedback?: {
    type: 'success' | 'error';
    message: string;
    socraticQuestions?: string[];
  };
  repetitionStats?: Record<string, number>;
}

function parseFormulaStructure(structure: string): string[] {
  const parts = structure.split('+').map(p => p.trim().toLowerCase());
  return parts;
}

function basicValidation(sentence: string, structure: string, newElements: string[]): { valid: boolean; issues: string[] } {
  const words = sentence.trim().split(/\s+/);
  const requiredParts = parseFormulaStructure(structure);
  const issues: string[] = [];

  if (words.length === 0 || (words.length === 1 && words[0] === '')) {
    issues.push('Please write a sentence');
    return { valid: false, issues };
  }

  if (requiredParts.includes('subject') && requiredParts.includes('verb')) {
    if (words.length < 2) {
      issues.push('Your sentence needs at least a subject and a verb');
    }
  }

  if (requiredParts.includes('determiner')) {
    const determiners = ['the', 'a', 'an', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those'];
    const firstWord = words[0].toLowerCase();
    if (!determiners.includes(firstWord)) {
      issues.push('Start with a determiner (the, a, my, etc.)');
    }
  }

  if (requiredParts.includes('adverb')) {
    const hasAdverb = words.some(w => w.toLowerCase().endsWith('ly') || 
      ['quickly', 'slowly', 'happily', 'quietly', 'loudly', 'gently', 'bravely', 'fast', 'hard', 'well'].includes(w.toLowerCase()));
    if (!hasAdverb) {
      issues.push('Add an adverb (a word that describes how something happens, often ending in -ly)');
    }
  }

  return { valid: issues.length === 0, issues };
}

async function aiValidation(sentence: string, structure: string, newElements: string[]): Promise<FormulaValidationResult> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a grammar teacher for primary school pupils (ages 7-11). 
Validate if the sentence follows the required formula structure.
Be encouraging but accurate. Focus on the structure, not content.
Respond in JSON format with: { "is_correct": boolean, "feedback_message": string, "socratic_questions": string[] }
If correct, give a short praise. If incorrect, give one helpful hint and 1-2 Socratic questions.`
        },
        {
          role: 'user',
          content: `Formula structure required: ${structure}
New element(s) being practiced: ${newElements.join(', ')}
Pupil's sentence: "${sentence}"

Does this sentence follow the formula? Provide feedback.`
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      is_correct: result.is_correct,
      feedback: {
        type: result.is_correct ? 'success' : 'error',
        message: result.feedback_message || (result.is_correct ? 'Well done!' : 'Try again!'),
        socraticQuestions: result.socratic_questions || []
      }
    };
  } catch (error) {
    console.error('AI validation error:', error);
    return {
      is_correct: true,
      feedback: {
        type: 'success',
        message: 'Good sentence! Keep going!'
      }
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, formula_number, pupil_sentence } = body;

    if (!session_id || !formula_number || !pupil_sentence) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: formula, error: formulaError } = await supabase
      .from('pwp_formulas')
      .select('*')
      .eq('session_id', session_id)
      .eq('formula_number', formula_number)
      .single();

    if (formulaError || !formula) {
      return NextResponse.json({ error: 'Formula not found' }, { status: 404 });
    }

    const basicCheck = basicValidation(pupil_sentence, formula.formula_structure, formula.new_elements);
    
    let result: FormulaValidationResult;
    
    if (!basicCheck.valid) {
      result = {
        is_correct: false,
        feedback: {
          type: 'error',
          message: basicCheck.issues[0],
          socraticQuestions: ['What parts does your sentence need?', 'Look at the formula structure again.']
        }
      };
    } else {
      result = await aiValidation(pupil_sentence, formula.formula_structure, formula.new_elements);
    }

    const newAttempts = (formula.attempts || 0) + 1;
    await supabase
      .from('pwp_formulas')
      .update({
        pupil_sentence: result.is_correct ? pupil_sentence : formula.pupil_sentence,
        attempts: newAttempts,
        is_correct: result.is_correct,
        ai_feedback_given: [...(formula.ai_feedback_given || []), result.feedback],
        completed_at: result.is_correct ? new Date().toISOString() : null
      })
      .eq('id', formula.id);

    await supabase
      .from('formula_attempts')
      .insert({
        formula_id: formula.id,
        attempt_number: newAttempts,
        pupil_sentence,
        errors_detected: result.is_correct ? [] : [{ message: result.feedback?.message }],
        feedback_provided: result.feedback || {}
      });

    if (result.is_correct) {
      const words = pupil_sentence.toLowerCase().split(/\s+/);
      const repetitionStats: Record<string, number> = {};
      words.forEach(word => {
        repetitionStats[word] = (repetitionStats[word] || 0) + 1;
      });
      result.repetitionStats = repetitionStats;

      await supabase
        .from('pwp_sessions')
        .update({
          formulas_completed: formula_number
        })
        .eq('id', session_id);
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Submit formula error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
