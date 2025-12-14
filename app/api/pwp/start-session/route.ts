import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface FormulaSpec {
  formula_number: number;
  formula_structure: string;
  labelled_example: string;
  word_bank: string[];
  new_elements: string[];
  hint_text: string;
}

function generateFormulasForLesson(lessonNumber: number, subject: string, conceptsCumulative: string[]): FormulaSpec[] {
  const formulas: FormulaSpec[] = [];
  const subjectCap = subject.charAt(0).toUpperCase() + subject.slice(1);
  
  const verbOptions = ['runs', 'jumps', 'sleeps', 'plays', 'swims', 'eats', 'walks', 'sits'];
  const adjOptions = ['big', 'small', 'happy', 'fluffy', 'brave', 'quick', 'gentle', 'loud'];
  const advOptions = ['quickly', 'slowly', 'happily', 'quietly', 'loudly', 'gently', 'bravely'];
  const detOptions = ['The', 'A', 'My', 'This'];
  
  const verb = verbOptions[Math.floor(Math.random() * verbOptions.length)];
  const adj = adjOptions[Math.floor(Math.random() * adjOptions.length)];
  const adv = advOptions[Math.floor(Math.random() * advOptions.length)];
  const det = detOptions[Math.floor(Math.random() * detOptions.length)];

  if (lessonNumber === 10) {
    formulas.push({
      formula_number: 1,
      formula_structure: 'subject + verb',
      labelled_example: `Cat runs\n(subject) (verb)`,
      word_bank: [],
      new_elements: ['noun', 'verb'],
      hint_text: `What does a ${subject} do? Think of an action word!`
    });
    formulas.push({
      formula_number: 2,
      formula_structure: 'subject + verb',
      labelled_example: `Bird sings\n(subject) (verb)`,
      word_bank: [],
      new_elements: ['noun', 'verb'],
      hint_text: `Try another action word for your ${subject}!`
    });
  } else if (lessonNumber === 11) {
    formulas.push({
      formula_number: 1,
      formula_structure: 'subject + verb',
      labelled_example: `Cat runs\n(subject) (verb)`,
      word_bank: [],
      new_elements: ['noun', 'verb'],
      hint_text: `Start with your ${subject} and an action.`
    });
    formulas.push({
      formula_number: 2,
      formula_structure: 'determiner + subject + verb',
      labelled_example: `The cat runs\n(det) (subject) (verb)`,
      word_bank: [subjectCap, verb],
      new_elements: ['determiner'],
      hint_text: 'Add "The", "A", or "My" at the start!'
    });
    formulas.push({
      formula_number: 3,
      formula_structure: 'determiner + subject + verb',
      labelled_example: `A bird flies\n(det) (subject) (verb)`,
      word_bank: [],
      new_elements: ['determiner', 'noun', 'verb'],
      hint_text: 'Write a complete sentence with a determiner!'
    });
  } else if (lessonNumber === 12) {
    formulas.push({
      formula_number: 1,
      formula_structure: 'subject + verb',
      labelled_example: `Dog runs\n(subject) (verb)`,
      word_bank: [],
      new_elements: ['noun', 'verb'],
      hint_text: 'Start simple!'
    });
    formulas.push({
      formula_number: 2,
      formula_structure: 'determiner + subject + verb',
      labelled_example: `The dog runs\n(det) (subject) (verb)`,
      word_bank: [subjectCap, verb],
      new_elements: ['determiner'],
      hint_text: 'Add a determiner at the start.'
    });
    formulas.push({
      formula_number: 3,
      formula_structure: 'determiner + adjective + subject + verb',
      labelled_example: `The fluffy dog runs\n(det) (adj) (subject) (verb)`,
      word_bank: [det, subjectCap, verb],
      new_elements: ['adjective'],
      hint_text: 'What is your subject like? Add a describing word!'
    });
    formulas.push({
      formula_number: 4,
      formula_structure: 'determiner + adjective + subject + verb',
      labelled_example: `A happy cat plays\n(det) (adj) (subject) (verb)`,
      word_bank: [],
      new_elements: ['determiner', 'adjective', 'noun', 'verb'],
      hint_text: 'Write a complete sentence with an adjective!'
    });
  } else if (lessonNumber === 13) {
    formulas.push({
      formula_number: 1,
      formula_structure: 'subject + verb',
      labelled_example: `Lion roars\n(subject) (verb)`,
      word_bank: [],
      new_elements: ['noun', 'verb'],
      hint_text: 'Start with subject + verb.'
    });
    formulas.push({
      formula_number: 2,
      formula_structure: 'subject + adverb + verb',
      labelled_example: `Lion loudly roars\n(subject) (adverb) (verb)`,
      word_bank: [subjectCap, verb],
      new_elements: ['adverb'],
      hint_text: 'Add an adverb to describe HOW the action happens!'
    });
    formulas.push({
      formula_number: 3,
      formula_structure: 'determiner + subject + adverb + verb',
      labelled_example: `The lion loudly roars\n(det) (subject) (adverb) (verb)`,
      word_bank: [subjectCap, adv, verb],
      new_elements: ['determiner'],
      hint_text: 'Add a determiner at the start.'
    });
    formulas.push({
      formula_number: 4,
      formula_structure: 'determiner + adjective + subject + adverb + verb',
      labelled_example: `The brave lion loudly roars\n(det) (adj) (subject) (adverb) (verb)`,
      word_bank: [det, subjectCap, adv, verb],
      new_elements: ['adjective'],
      hint_text: 'Add an adjective to describe your subject!'
    });
  } else if (lessonNumber === 14 || lessonNumber === 15) {
    formulas.push({
      formula_number: 1,
      formula_structure: 'subject + verb',
      labelled_example: `Bird sings\n(subject) (verb)`,
      word_bank: [],
      new_elements: ['noun', 'verb'],
      hint_text: 'Start simple with subject + verb.'
    });
    formulas.push({
      formula_number: 2,
      formula_structure: 'determiner + subject + verb',
      labelled_example: `The bird sings\n(det) (subject) (verb)`,
      word_bank: [subjectCap, verb],
      new_elements: ['determiner'],
      hint_text: 'Add a determiner.'
    });
    formulas.push({
      formula_number: 3,
      formula_structure: 'determiner + adjective + subject + verb',
      labelled_example: `The small bird sings\n(det) (adj) (subject) (verb)`,
      word_bank: [det, subjectCap, verb],
      new_elements: ['adjective'],
      hint_text: 'Add an adjective to describe your subject.'
    });
    formulas.push({
      formula_number: 4,
      formula_structure: 'determiner + adjective + subject + adverb + verb',
      labelled_example: `The small bird happily sings\n(det) (adj) (subject) (adverb) (verb)`,
      word_bank: [det, adj, subjectCap, verb],
      new_elements: ['adverb'],
      hint_text: 'Add an adverb to describe how the action happens!'
    });
  }

  return formulas;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lesson_number, subject_text, pupil_id } = body;

    if (!lesson_number || !subject_text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: curriculum, error: curriculumError } = await supabase
      .from('curriculum_map')
      .select('*')
      .eq('lesson_number', lesson_number)
      .single();

    if (curriculumError || !curriculum) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const formulas = generateFormulasForLesson(
      lesson_number,
      subject_text,
      curriculum.concepts_cumulative
    );

    const sessionData = {
      pupil_id: pupil_id || '00000000-0000-0000-0000-000000000000',
      lesson_number,
      subject_text,
      subject_type: 'thing',
      formulas_total: formulas.length,
      status: 'in_progress'
    };

    const { data: session, error: sessionError } = await supabase
      .from('pwp_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    for (const formula of formulas) {
      await supabase
        .from('pwp_formulas')
        .insert({
          session_id: session.id,
          formula_number: formula.formula_number,
          formula_structure: formula.formula_structure,
          labelled_example: formula.labelled_example,
          word_bank: formula.word_bank,
          new_elements: formula.new_elements,
          hint_text: formula.hint_text
        });
    }

    return NextResponse.json({
      session_id: session.id,
      lesson_number,
      subject: subject_text,
      formulas,
      expected_duration_minutes: curriculum.pwp_duration_minutes
    });

  } catch (error) {
    console.error('Start session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
