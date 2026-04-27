import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getPool } from '@/lib/db';
import { generateCompletion, getCurrentProviderInfo } from '@/lib/llm-provider';

interface PWPAssessmentResult {
  grammar_accuracy: number;
  structure_correctness: number;
  feedback: string;
  corrections: string[];
  improved_example: string;
}

export async function POST(request: NextRequest) {
  try {
    // ── 1. Authenticate teacher via Supabase ──────────────────────────────
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - please log in' }, { status: 401 });
    }

    const pool = getPool();

    // Resolve profile (id or email fallback)
    let profileRow: { id: string; role: string } | null = null;
    const byId = await pool.query('SELECT id, role FROM profiles WHERE id = $1 LIMIT 1', [user.id]);
    if (byId.rows.length > 0) {
      profileRow = byId.rows[0];
    } else if (user.email) {
      const byEmail = await pool.query(
        'SELECT id, role FROM profiles WHERE LOWER(email) = LOWER($1) LIMIT 1',
        [user.email]
      );
      if (byEmail.rows.length > 0) profileRow = byEmail.rows[0];
    }

    if (!profileRow || !['teacher', 'admin', 'school_admin'].includes(profileRow.role)) {
      return NextResponse.json({ error: 'Teacher access required' }, { status: 403 });
    }

    const teacherProfileId = profileRow.id;

    // ── 2. Parse body ─────────────────────────────────────────────────────
    const { pwp_submission_id } = await request.json();
    if (!pwp_submission_id) {
      return NextResponse.json({ error: 'Missing pwp_submission_id' }, { status: 400 });
    }

    // ── 3. Fetch submission + assignment + activity via pool ───────────────
    const subResult = await pool.query(
      `SELECT
         ps.id AS submission_id,
         ps.content,
         ps.pupil_id,
         ps.pwp_assignment_id,
         pa.class_id,
         pg.level,
         pg.level_name,
         pg.grammar_focus,
         pg.sentence_structure,
         pg.instructions AS activity_instructions
       FROM pwp_submissions ps
       JOIN pwp_assignments pa ON pa.id = ps.pwp_assignment_id
       JOIN progressive_activities pg ON pg.id = pa.activity_id
       WHERE ps.id = $1
       LIMIT 1`,
      [pwp_submission_id]
    );

    if (subResult.rows.length === 0) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const sub = subResult.rows[0];

    // Permission: admin can assess anything; teacher must own the class
    if (profileRow.role === 'teacher') {
      const classCheck = await pool.query(
        'SELECT id FROM classes WHERE id = $1 AND teacher_id = $2 LIMIT 1',
        [sub.class_id, teacherProfileId]
      );
      if (classCheck.rows.length === 0) {
        return NextResponse.json({ error: 'You do not have permission to assess this submission' }, { status: 403 });
      }
    }

    // ── 4. Run AI assessment ──────────────────────────────────────────────
    const prompt = `You are an expert primary school writing teacher in the UK specialising in grammar instruction. Assess the following pupil writing for their Progressive Writing Practice activity.

ACTIVITY DETAILS:
Level: ${sub.level} - ${sub.level_name}
Grammar Focus: ${sub.grammar_focus}
Expected Sentence Structure: ${sub.sentence_structure}
Instructions Given: ${sub.activity_instructions}

PUPIL'S WRITING:
"""
${sub.content}
"""

Assess whether the pupil correctly uses the target sentence structure (${sub.sentence_structure}).

Return ONLY valid JSON:
{
  "grammar_accuracy": 3,
  "structure_correctness": 3,
  "feedback": "Encouraging, specific feedback about their use of the target structure (2-3 sentences, age-appropriate)",
  "corrections": ["specific correction if needed, or empty array"],
  "improved_example": "Rewrite one of their sentences showing the correct or more sophisticated structure"
}

Scoring (1-4):
1 = Working towards - Does not use the target structure correctly
2 = Expected - Uses the target structure with some errors
3 = Greater depth - Uses the target structure correctly and confidently
4 = Mastery - Uses the target structure with sophistication and variety

Be encouraging and age-appropriate.`;

    const { provider, model } = getCurrentProviderInfo();
    console.log(`PWP Assessment using ${provider} (${model})`);

    const llmResponse = await generateCompletion({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      jsonMode: true,
    });

    const responseText = llmResponse.content || '';

    let assessment: PWPAssessmentResult;
    try {
      const cleaned = responseText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/, '')
        .trim();
      assessment = JSON.parse(cleaned);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        assessment = {
          grammar_accuracy: 2,
          structure_correctness: 2,
          feedback: 'Good effort on this writing task. Keep practising!',
          corrections: [],
          improved_example: 'Continue working on your sentence structure.',
        };
      } else {
        try { assessment = JSON.parse(jsonMatch[0]); }
        catch { assessment = { grammar_accuracy: 2, structure_correctness: 2, feedback: 'Good effort!', corrections: [], improved_example: '' }; }
      }
    }

    // Normalise
    assessment.grammar_accuracy = Math.min(4, Math.max(1, Math.round(assessment.grammar_accuracy || 2)));
    assessment.structure_correctness = Math.min(4, Math.max(1, Math.round(assessment.structure_correctness || 2)));
    if (!Array.isArray(assessment.corrections)) assessment.corrections = [];

    // ── 5. Save assessment via pool ───────────────────────────────────────
    const insertResult = await pool.query(
      `INSERT INTO pwp_assessments
         (pwp_submission_id, teacher_id, grammar_accuracy, structure_correctness,
          feedback, corrections, improved_example, raw_response)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        pwp_submission_id,
        teacherProfileId,
        assessment.grammar_accuracy,
        assessment.structure_correctness,
        assessment.feedback,
        JSON.stringify(assessment.corrections),
        assessment.improved_example,
        JSON.stringify({ provider, model, content: responseText }),
      ]
    );

    const savedAssessment = insertResult.rows[0];

    // ── 6. Mark submission as reviewed ───────────────────────────────────
    await pool.query(
      `UPDATE pwp_submissions SET status = 'reviewed', submitted_at = COALESCE(submitted_at, NOW())
       WHERE id = $1`,
      [pwp_submission_id]
    );

    return NextResponse.json({ success: true, assessment: savedAssessment });

  } catch (error: any) {
    console.error('PWP Assessment error:', error);
    return NextResponse.json({ error: error.message || 'Assessment failed' }, { status: 500 });
  }
}
