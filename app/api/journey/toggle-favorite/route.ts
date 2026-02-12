import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { sentenceId } = await request.json();

    if (!sentenceId) {
      return NextResponse.json({ error: 'Sentence ID required' }, { status: 400 });
    }

    const pool = getPool();

    await pool.query(
      'UPDATE pwp_sentences SET is_favorite = NOT COALESCE(is_favorite, false) WHERE id = $1',
      [sentenceId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 });
  }
}
