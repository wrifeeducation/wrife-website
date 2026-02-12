import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { pupilId } = await request.json();

    if (!pupilId) {
      return NextResponse.json({ error: 'Pupil ID required' }, { status: 400 });
    }

    const pool = getPool();

    // Get pupil profile
    const profileResult = await pool.query(
      'SELECT current_lesson, personal_word_bank, story_type FROM pupil_profiles WHERE pupil_id = $1',
      [pupilId]
    );

    const currentLesson = profileResult.rows[0]?.current_lesson || 10;
    const wordBank = profileResult.rows[0]?.personal_word_bank || {
      people: ['Mum', 'Dad', 'My friend'],
      places: ['school', 'the park', 'home'],
      things: ['dog', 'cat', 'ball'],
    };

    // Get curriculum data for current lesson formula
    const curriculumResult = await pool.query(
      'SELECT * FROM curriculum_map WHERE lesson_number = $1',
      [currentLesson]
    );

    // Build formula info based on lesson
    let formula: { structure: string; example: string; wordClasses: string[] } | null = null;
    if (curriculumResult.rows.length > 0) {
      const curriculum = curriculumResult.rows[0];
      const concepts = curriculum.concepts_cumulative || [];

      formula = {
        structure: getFormulaStructure(currentLesson, concepts),
        example: getFormulaExample(currentLesson),
        wordClasses: getWordClasses(currentLesson),
      };
    } else {
      // Default formula for early PWP lessons
      formula = {
        structure: 'Subject + Verb + Object',
        example: 'The dog chased the ball.',
        wordClasses: ['Subject (noun)', 'Verb', 'Object (noun)'],
      };
    }

    // Get subjects used this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const subjectsResult = await pool.query(
      `SELECT DISTINCT subject_chosen FROM pwp_sentences
       WHERE pupil_id = $1 AND date_written >= $2`,
      [pupilId, weekStart.toISOString()]
    );

    const subjectsUsedThisWeek = subjectsResult.rows.map(r => r.subject_chosen);

    return NextResponse.json({
      currentLesson,
      formula,
      wordBank,
      subjectsUsedThisWeek,
    });
  } catch (error) {
    console.error('Story data error:', error);
    return NextResponse.json({ error: 'Failed to fetch story data' }, { status: 500 });
  }
}

function getFormulaStructure(lessonNumber: number, concepts: string[]): string {
  if (lessonNumber <= 12) return 'Subject + Verb + Object';
  if (lessonNumber <= 20) return 'Adjective + Subject + Verb + Object';
  if (lessonNumber <= 30) return 'Adjective + Subject + Verb + Adverb';
  if (lessonNumber <= 40) return 'Adjective + Subject + Verb + Prepositional Phrase';
  if (lessonNumber <= 50) return 'Time Adverbial + Adjective + Subject + Verb + Object';
  if (lessonNumber <= 60) return 'Adverbial + Subject + Verb + Object + Conjunction + Clause';
  return 'Complex Sentence with Multiple Clauses';
}

function getFormulaExample(lessonNumber: number): string {
  if (lessonNumber <= 12) return 'The dog chased the ball.';
  if (lessonNumber <= 20) return 'The fluffy cat ate the fish.';
  if (lessonNumber <= 30) return 'The brave knight fought bravely.';
  if (lessonNumber <= 40) return 'The curious fox hid under the bush.';
  if (lessonNumber <= 50) return 'Yesterday, the excited children played in the garden.';
  if (lessonNumber <= 60) return 'After lunch, the tired dog slept on the mat because he was full.';
  return 'When the sun set, the mysterious owl flew silently across the field and landed on the old oak tree.';
}

function getWordClasses(lessonNumber: number): string[] {
  if (lessonNumber <= 12) return ['Subject (noun)', 'Verb', 'Object (noun)'];
  if (lessonNumber <= 20) return ['Adjective', 'Subject (noun)', 'Verb', 'Object (noun)'];
  if (lessonNumber <= 30) return ['Adjective', 'Subject (noun)', 'Verb', 'Adverb'];
  if (lessonNumber <= 40) return ['Adjective', 'Subject (noun)', 'Verb', 'Prepositional phrase'];
  if (lessonNumber <= 50) return ['Time adverbial', 'Adjective', 'Subject (noun)', 'Verb', 'Object'];
  if (lessonNumber <= 60) return ['Adverbial', 'Subject', 'Verb', 'Object', 'Conjunction', 'Clause'];
  return ['Subordinate clause', 'Subject', 'Verb', 'Adverb', 'Prepositional phrase', 'Conjunction', 'Clause'];
}
