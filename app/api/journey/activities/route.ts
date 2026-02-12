import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

// Default activities for lessons that don't have database-stored activities yet
interface ActivityData {
  id: number;
  activityNumber: number;
  wLevel: string;
  activityType: string;
  title: string;
  instructions: string;
  content: Record<string, unknown>;
  correctAnswers: unknown;
  hints: string[];
}

function getDefaultActivities(lessonNumber: number, yearGroup: number) {
  const activities: ActivityData[] = [];
  const wLevels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];

  // Generate age-appropriate activities based on lesson number
  const nouns = yearGroup <= 3
    ? ['dog', 'cat', 'ball', 'tree', 'house', 'book', 'mum', 'dad']
    : ['elephant', 'library', 'adventure', 'mountain', 'telescope', 'orchestra'];

  const verbs = yearGroup <= 3
    ? ['runs', 'jumps', 'eats', 'plays', 'reads', 'sings']
    : ['explores', 'discovers', 'imagines', 'observes', 'creates', 'transforms'];

  const adjectives = yearGroup <= 3
    ? ['big', 'small', 'happy', 'red', 'fast', 'loud']
    : ['enormous', 'mysterious', 'brilliant', 'ancient', 'magnificent', 'peculiar'];

  // W1: Recognition - Multiple Choice
  activities.push({
    id: lessonNumber * 100 + 1,
    activityNumber: 1,
    wLevel: 'W1',
    activityType: 'multiple_choice',
    title: 'Find the Noun',
    instructions: 'Which word is a noun (a naming word)?',
    content: {
      type: 'multiple_choice',
      question: `Which word is a noun in this sentence: "The ${adjectives[0]} ${nouns[0]} ${verbs[0]} quickly."`,
      options: [nouns[0], verbs[0], adjectives[0], 'quickly'],
    },
    correctAnswers: [nouns[0]],
    hints: ['A noun is a word that names a person, place, or thing.'],
  });

  // W1: Recognition - Multiple Choice (verb)
  activities.push({
    id: lessonNumber * 100 + 2,
    activityNumber: 2,
    wLevel: 'W1',
    activityType: 'multiple_choice',
    title: 'Find the Verb',
    instructions: 'Which word is a verb (a doing word)?',
    content: {
      type: 'multiple_choice',
      question: `Which word is a verb in: "The ${nouns[1]} ${verbs[1]} in the park."`,
      options: ['The', nouns[1], verbs[1], 'park'],
    },
    correctAnswers: [verbs[1]],
    hints: ['A verb is a doing word - it tells you what someone or something does.'],
  });

  // W2: Sorting
  activities.push({
    id: lessonNumber * 100 + 3,
    activityNumber: 3,
    wLevel: 'W2',
    activityType: 'sorting',
    title: 'Sort the Word Classes',
    instructions: 'Sort these words into the correct groups.',
    content: {
      type: 'sorting',
      items: [nouns[0], verbs[0], adjectives[0], nouns[1], verbs[1], adjectives[1]],
      categories: ['Nouns', 'Verbs', 'Adjectives'],
    },
    correctAnswers: {
      [nouns[0]]: 'Nouns',
      [nouns[1]]: 'Nouns',
      [verbs[0]]: 'Verbs',
      [verbs[1]]: 'Verbs',
      [adjectives[0]]: 'Adjectives',
      [adjectives[1]]: 'Adjectives',
    },
    hints: ['Nouns name things, verbs are doing words, adjectives describe things.'],
  });

  // W3: Matching
  activities.push({
    id: lessonNumber * 100 + 4,
    activityNumber: 4,
    wLevel: 'W3',
    activityType: 'matching',
    title: 'Match Words to Their Class',
    instructions: 'Match each word on the left with its word class on the right.',
    content: {
      type: 'matching',
      pairs: [
        { left: nouns[2] || 'book', right: 'Noun' },
        { left: verbs[2] || 'reads', right: 'Verb' },
        { left: adjectives[2] || 'happy', right: 'Adjective' },
        { left: 'quickly', right: 'Adverb' },
      ],
    },
    correctAnswers: {},
    hints: ['Think about what each word does in a sentence.'],
  });

  // W4: Fill in the blank
  activities.push({
    id: lessonNumber * 100 + 5,
    activityNumber: 5,
    wLevel: 'W4',
    activityType: 'fill_blank',
    title: 'Complete the Sentence',
    instructions: 'Fill in the missing word with the correct type.',
    content: {
      type: 'fill_blank',
      sentence: `The ___ ${nouns[0]} ___ over the fence.`,
      blanks: ['adjective', 'verb'],
      wordBank: [...adjectives.slice(0, 3), ...verbs.slice(0, 3)],
    },
    correctAnswers: [adjectives[0], verbs[0]],
    hints: ['The first blank needs an adjective (describing word), the second needs a verb (doing word).'],
  });

  // W5: Application - Multiple Choice (harder)
  activities.push({
    id: lessonNumber * 100 + 6,
    activityNumber: 6,
    wLevel: 'W5',
    activityType: 'multiple_choice',
    title: 'Choose the Best Word',
    instructions: 'Which word best completes this sentence to match the formula: Subject + Verb + Object?',
    content: {
      type: 'multiple_choice',
      question: `"The ${nouns[0]} ___ the ${nouns[1]}." Which verb fits best?`,
      options: [verbs[0], adjectives[0], 'the', 'and'],
    },
    correctAnswers: [verbs[0]],
    hints: ['We need a verb (doing word) to complete the Subject + Verb + Object formula.'],
  });

  // W5: Fill in the blank (harder)
  activities.push({
    id: lessonNumber * 100 + 7,
    activityNumber: 7,
    wLevel: 'W5',
    activityType: 'fill_blank',
    title: 'Build the Formula',
    instructions: 'Write a word for each part of the formula: Subject + Verb + Object',
    content: {
      type: 'fill_blank',
      sentence: 'Write one word for each: ___ (subject) ___ (verb) ___ (object)',
      blanks: ['subject', 'verb', 'object'],
      wordBank: [],
    },
    correctAnswers: ['any', 'any', 'any'],
    hints: ['Subject = who/what, Verb = doing word, Object = what they did it to.'],
  });

  // W6: Creation (handled by AI)
  activities.push({
    id: lessonNumber * 100 + 8,
    activityNumber: 8,
    wLevel: 'W6',
    activityType: 'fill_blank',
    title: 'Write Your Own Sentence',
    instructions: `Write a complete sentence using the formula: Subject + Verb + Object. Use your own words!`,
    content: {
      type: 'fill_blank',
      sentence: '',
      blanks: ['sentence'],
      wordBank: [],
    },
    correctAnswers: ['any'],
    hints: ['Remember: Subject (who?) + Verb (does what?) + Object (to what?). Example: "The cat chased the mouse."'],
  });

  return activities;
}

export async function POST(request: NextRequest) {
  try {
    const { pupilId, yearGroup } = await request.json();

    if (!pupilId) {
      return NextResponse.json({ error: 'Pupil ID required' }, { status: 400 });
    }

    const pool = getPool();

    // Get current lesson from profile
    const profileResult = await pool.query(
      'SELECT current_lesson FROM pupil_profiles WHERE pupil_id = $1',
      [pupilId]
    );
    const currentLesson = profileResult.rows[0]?.current_lesson || 1;

    // Try to get database activities first
    const dbActivities = await pool.query(
      `SELECT * FROM daily_activities
       WHERE lesson_number = $1
       AND year_group_min <= $2 AND year_group_max >= $2
       ORDER BY activity_number`,
      [currentLesson, yearGroup || 4]
    );

    let activities;
    if (dbActivities.rows.length > 0) {
      activities = dbActivities.rows.map(row => ({
        id: row.id,
        activityNumber: row.activity_number,
        wLevel: row.w_level,
        activityType: row.activity_type,
        title: row.title,
        instructions: row.instructions,
        content: row.content,
        correctAnswers: row.correct_answers,
        hints: row.hints || [],
      }));
    } else {
      activities = getDefaultActivities(currentLesson, yearGroup || 4);
    }

    // Find where the pupil left off today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const progressResult = await pool.query(
      `SELECT MAX(activity_number) as last_activity
       FROM activity_progress
       WHERE pupil_id = $1 AND lesson_number = $2 AND completed_at >= $3`,
      [pupilId, currentLesson, todayStart.toISOString()]
    );
    const resumeAt = progressResult.rows[0]?.last_activity || 0;

    return NextResponse.json({
      activities,
      currentLesson,
      resumeAt,
    });
  } catch (error) {
    console.error('Activities fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
