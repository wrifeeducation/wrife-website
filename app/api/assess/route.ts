/**
 * POST /api/assess
 * Teacher-triggered AI assessment for a lesson submission.
 *
 * Body:    { submission_id: string }
 * Returns: { success: true, assessment: AIAssessmentRow }
 *
 * Scores six criteria on a 1–4 scale (1=Emerging … 4=Greater Depth):
 *   composition, vocabulary, grammar, punctuation, spelling,
 *   purpose_audience_effect
 * Overall band is derived as the rounded average.
 *
 * Display-friendly content (strengths, improvements, improved_example,
 * mechanical_edits, teacher_rationale) is stored in raw_ai_response JSONB.
 *
 * NOTE: This endpoint generates the AI assessment only — it does NOT approve
 * the feedback or change submission.status. Teachers approve separately via
 * POST /api/teacher/submissions/approve.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getPool } from '@/lib/db';
import { generateCompletion, getCurrentProviderInfo } from '@/lib/llm-provider';

// ─── Auth ───────────────────────────────────────────────────────────────────

async function getTeacherProfile() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const pool = getPool();
  const res = await pool.query(
    'SELECT id, role FROM profiles WHERE id = $1 LIMIT 1',
    [user.id],
  );
  return res.rows[0] as { id: string; role: string } | undefined;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function clampBand(v: unknown): number {
  const n = typeof v === 'number' ? v : parseInt(String(v), 10);
  return isNaN(n) ? 2 : Math.max(1, Math.min(4, n));
}

function deriveOverallBand(scores: number[]): number {
  const avg = scores.reduce((s, n) => s + n, 0) / scores.length;
  if (avg >= 3.5) return 4;
  if (avg >= 2.5) return 3;
  if (avg >= 1.5) return 2;
  return 1;
}

function toStrArr(v: unknown, fallback: string[]): string[] {
  if (Array.isArray(v)) return (v as unknown[]).map(String).filter(Boolean);
  if (typeof v === 'string' && v.trim()) return [v];
  return fallback;
}

// ─── POST ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const teacher = await getTeacherProfile();
    if (!teacher || !['teacher', 'school_admin', 'admin'].includes(teacher.role)) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const body = await request.json() as { submission_id?: string };
    const { submission_id } = body;
    if (!submission_id) {
      return NextResponse.json({ error: 'submission_id is required' }, { status: 400 });
    }

    const pool = getPool();

    // ── Fetch submission + assignment + lesson ──────────────────────────────
    const subRes = await pool.query(
      `SELECT
         s.id, s.content, s.pupil_id,
         a.id        AS assignment_id,
         a.title     AS assignment_title,
         a.class_id,
         a.teacher_id,
         COALESCE(l.year_group_min, 4) AS year_group
       FROM submissions s
       JOIN assignments a ON a.id = s.assignment_id
       LEFT JOIN lessons l ON l.id = a.lesson_id
       WHERE s.id = $1
       LIMIT 1`,
      [submission_id],
    );

    if (subRes.rows.length === 0) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const sub = subRes.rows[0] as {
      id: string;
      content: string | null;
      pupil_id: string;
      assignment_id: string;
      assignment_title: string;
      class_id: string;
      teacher_id: string;
      year_group: number;
    };

    // Admins bypass ownership check
    if (teacher.role !== 'admin') {
      const owns = await pool.query(
        'SELECT 1 FROM classes WHERE id = $1 AND teacher_id = $2 LIMIT 1',
        [sub.class_id, teacher.id],
      );
      if (owns.rows.length === 0) {
        return NextResponse.json({ error: 'You do not own this class' }, { status: 403 });
      }
    }

    if (!sub.content?.trim()) {
      return NextResponse.json({ error: 'Submission has no content to assess' }, { status: 400 });
    }

    const yg = sub.year_group;

    // ── Build AI prompt ─────────────────────────────────────────────────────
    const systemPrompt = `You are an expert UK primary school writing teacher assessing pupil work for Year ${yg} (aged ${yg + 4}–${yg + 5}).

Your assessment must be age-appropriate, encouraging, and specific — quote phrases from the pupil's actual writing wherever possible. Identify ONE main improvement focus, not a long list.

Score each criterion 1–4:
  1 = Emerging   2 = Developing   3 = Secure   4 = Greater Depth

Criteria:
- composition_score: structure, ideas, organisation, coherence
- vocabulary_score: word choice, variety, precision, effect
- grammar_score: sentence construction, syntax, tense consistency
- punctuation_score: accuracy of capitals, full stops, commas, speech marks etc.
- spelling_score: spelling accuracy relative to Year ${yg} expectations
- purpose_audience_effect_score: audience awareness, purpose, overall effect

Return ONLY valid JSON — no markdown, no commentary:
{
  "composition_score": 1|2|3|4,
  "vocabulary_score": 1|2|3|4,
  "grammar_score": 1|2|3|4,
  "punctuation_score": 1|2|3|4,
  "spelling_score": 1|2|3|4,
  "purpose_audience_effect_score": 1|2|3|4,
  "strengths": ["specific strength quoting pupil's words", "second strength"],
  "improvements": ["one main improvement with a concrete suggestion"],
  "improved_example": "A rewritten 1–2 sentence example showing the improvement",
  "mechanical_edits": ["specific spelling/punctuation note if needed — omit if none"],
  "teacher_rationale": "2–3 sentence professional summary for the teacher's records"
}`;

    const userPrompt = `Assignment: ${sub.assignment_title}

Pupil's writing (Year ${yg}):
"""
${sub.content}
"""

Assess this work.`;

    // ── Call LLM ─────────────────────────────────────────────────────────────
    const llmRes = await generateCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      maxTokens: 1200,
      jsonMode: true,
    });

    const { provider, model } = getCurrentProviderInfo();
    const rawText = llmRes.content ?? '';

    // Parse — strip markdown fences if present
    let parsed: Record<string, unknown>;
    try {
      const cleaned = rawText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/, '')
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Could not parse AI response');
      parsed = JSON.parse(match[0]);
    }

    const comp  = clampBand(parsed.composition_score);
    const vocab = clampBand(parsed.vocabulary_score);
    const gram  = clampBand(parsed.grammar_score);
    const punc  = clampBand(parsed.punctuation_score);
    const spell = clampBand(parsed.spelling_score);
    const purp  = clampBand(parsed.purpose_audience_effect_score);
    const band  = deriveOverallBand([comp, vocab, gram, punc, spell, purp]);

    const rawAiResponse = {
      strengths:         toStrArr(parsed.strengths, ['Good effort!']),
      improvements:      toStrArr(parsed.improvements, ['Keep practising!']),
      improved_example:  typeof parsed.improved_example === 'string' ? parsed.improved_example : '',
      mechanical_edits:  toStrArr(parsed.mechanical_edits, []),
      teacher_rationale: typeof parsed.teacher_rationale === 'string'
        ? parsed.teacher_rationale
        : '',
    };

    // ── Upsert into ai_assessments (piece_id is the unique key) ────────────
    const upsertRes = await pool.query(
      `INSERT INTO ai_assessments (
         piece_id, year_group_assessed,
         composition_score, vocabulary_score, grammar_score,
         punctuation_score, spelling_score, purpose_audience_effect_score,
         overall_band, raw_ai_response, model_used, assessed_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now())
       ON CONFLICT (piece_id) DO UPDATE SET
         composition_score             = EXCLUDED.composition_score,
         vocabulary_score              = EXCLUDED.vocabulary_score,
         grammar_score                 = EXCLUDED.grammar_score,
         punctuation_score             = EXCLUDED.punctuation_score,
         spelling_score                = EXCLUDED.spelling_score,
         purpose_audience_effect_score = EXCLUDED.purpose_audience_effect_score,
         overall_band                  = EXCLUDED.overall_band,
         raw_ai_response               = EXCLUDED.raw_ai_response,
         model_used                    = EXCLUDED.model_used,
         assessed_at                   = now()
       RETURNING *`,
      [
        submission_id, yg,
        comp, vocab, gram, punc, spell, purp,
        band,
        JSON.stringify(rawAiResponse),
        `${provider}/${model}`,
      ],
    );

    console.log(`[/api/assess] assessed submission ${submission_id} via ${provider}/${model}`);
    return NextResponse.json({ success: true, assessment: upsertRes.rows[0] });
  } catch (err: unknown) {
    console.error('[/api/assess] error:', err);
    const message = err instanceof Error ? err.message : 'Assessment failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
