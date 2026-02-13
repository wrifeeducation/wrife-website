import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { validatePupilSession } from '@/lib/pupil-auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ word: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const pupilId = searchParams.get('pupilId');
    const category = searchParams.get('category');

    if (!pupilId) {
      return NextResponse.json({ error: 'Missing pupilId parameter' }, { status: 400 });
    }

    const session = await validatePupilSession(pupilId);
    if (!session.valid) {
      return NextResponse.json({ error: 'Invalid or expired pupil session' }, { status: 401 });
    }

    if (!category) {
      return NextResponse.json({ error: 'Category query parameter is required' }, { status: 400 });
    }

    const validCategories = ['people', 'places', 'things'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Category must be people, places, or things' }, { status: 400 });
    }

    const { word } = await params;
    const decodedWord = decodeURIComponent(word);

    const pool = getPool();
    await pool.query(
      'DELETE FROM pupil_word_banks WHERE pupil_id = $1 AND category = $2 AND word = $3',
      [pupilId, category, decodedWord]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting word from bank:', error);
    return NextResponse.json({ error: 'Failed to delete word' }, { status: 500 });
  }
}
