import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { pupilId, wordBank } = await request.json();

    if (!pupilId || !wordBank) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pool = getPool();

    await pool.query(
      `UPDATE pupil_profiles
       SET personal_word_bank = $1, updated_at = NOW()
       WHERE pupil_id = $2`,
      [JSON.stringify(wordBank), pupilId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update word bank error:', error);
    return NextResponse.json({ error: 'Failed to update word bank' }, { status: 500 });
  }
}
