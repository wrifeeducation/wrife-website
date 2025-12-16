import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin, AuthError } from '@/lib/admin-auth';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();

    const result = await pool.query(
      'SELECT * FROM progressive_activities ORDER BY level ASC'
    );

    return NextResponse.json({ activities: result.rows || [] });
  } catch (error: any) {
    console.error('Error fetching PWP activities:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    const body = await request.json();

    const result = await pool.query(
      `INSERT INTO progressive_activities 
       (level, level_name, grammar_focus, sentence_structure, instructions, examples, practice_prompts, year_group_min, year_group_max)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        body.level,
        body.level_name,
        body.grammar_focus,
        body.sentence_structure,
        body.instructions,
        JSON.stringify(body.examples || []),
        JSON.stringify(body.practice_prompts || []),
        body.year_group_min,
        body.year_group_max
      ]
    );

    return NextResponse.json({ success: true, id: result.rows[0]?.id });
  } catch (error: any) {
    console.error('Error creating PWP activity:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Activity ID is required' }, { status: 400 });
    }

    await pool.query(
      `UPDATE progressive_activities SET
       level = $1, level_name = $2, grammar_focus = $3, sentence_structure = $4,
       instructions = $5, examples = $6, practice_prompts = $7,
       year_group_min = $8, year_group_max = $9
       WHERE id = $10`,
      [
        updates.level,
        updates.level_name,
        updates.grammar_focus,
        updates.sentence_structure,
        updates.instructions,
        JSON.stringify(updates.examples || []),
        JSON.stringify(updates.practice_prompts || []),
        updates.year_group_min,
        updates.year_group_max,
        id
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating PWP activity:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Activity ID is required' }, { status: 400 });
    }

    await pool.query('DELETE FROM progressive_activities WHERE id = $1', [parseInt(id)]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting PWP activity:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
