import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { validatePupilSession } from '@/lib/pupil-auth';

async function getWordBank(pupilId: string) {
  const pool = getPool();
  const result = await pool.query(
    'SELECT category, word FROM pupil_word_banks WHERE pupil_id = $1 ORDER BY word',
    [pupilId]
  );

  const wordBank: { people: string[]; places: string[]; things: string[] } = {
    people: [],
    places: [],
    things: [],
  };

  for (const row of result.rows) {
    const category = row.category as keyof typeof wordBank;
    if (category in wordBank) {
      wordBank[category].push(row.word);
    }
  }

  return wordBank;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pupilId = searchParams.get('pupilId');

    if (!pupilId) {
      return NextResponse.json({ error: 'Missing pupilId parameter' }, { status: 400 });
    }

    const session = await validatePupilSession(pupilId);
    if (!session.valid) {
      return NextResponse.json({ error: 'Invalid or expired pupil session' }, { status: 401 });
    }

    const wordBank = await getWordBank(pupilId);
    return NextResponse.json(wordBank);
  } catch (error) {
    console.error('Error fetching word bank:', error);
    return NextResponse.json({ error: 'Failed to fetch word bank' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pupilId, category, word } = body;

    if (!pupilId) {
      return NextResponse.json({ error: 'Missing pupilId' }, { status: 400 });
    }

    const session = await validatePupilSession(pupilId);
    if (!session.valid) {
      return NextResponse.json({ error: 'Invalid or expired pupil session' }, { status: 401 });
    }

    if (!category || !word) {
      return NextResponse.json({ error: 'Category and word are required' }, { status: 400 });
    }

    const validCategories = ['people', 'places', 'things'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Category must be people, places, or things' }, { status: 400 });
    }

    const trimmedWord = word.trim();
    if (!trimmedWord) {
      return NextResponse.json({ error: 'Word cannot be empty' }, { status: 400 });
    }

    const pool = getPool();
    await pool.query(
      `INSERT INTO pupil_word_banks (pupil_id, category, word)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [pupilId, category, trimmedWord]
    );

    const wordBank = await getWordBank(pupilId);
    return NextResponse.json(wordBank);
  } catch (error) {
    console.error('Error adding word to bank:', error);
    return NextResponse.json({ error: 'Failed to add word' }, { status: 500 });
  }
}
