import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { generateCompletion, parseJSONResponse } from '@/lib/llm-provider';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    if (!classId) {
      return NextResponse.json({ error: 'classId is required' }, { status: 400 });
    }

    const pool = getPool();

    const classCheck = await pool.query(
      'SELECT id, name FROM classes WHERE id = $1 AND teacher_id = $2',
      [classId, user.id]
    );
    if (classCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Class not found or access denied' }, { status: 403 });
    }

    const weekStart = searchParams.get('weekStart') || getCurrentWeekStart();

    const result = await pool.query(
      `SELECT wpr.*, p.first_name, p.last_name, p.display_name
       FROM weekly_progress_reports wpr
       JOIN pupils p ON wpr.pupil_id = p.id
       WHERE wpr.class_id = $1 AND wpr.week_start = $2
       ORDER BY p.first_name, p.last_name`,
      [classId, weekStart]
    );

    const reports = result.rows.map(row => ({
      id: row.id,
      pupilId: row.pupil_id,
      pupilName: row.display_name || `${row.first_name} ${row.last_name || ''}`.trim(),
      classId: row.class_id,
      weekStart: row.week_start,
      sentencesWritten: row.sentences_written,
      activitiesCompleted: row.activities_completed,
      masteryRate: parseFloat(row.mastery_rate) || 0,
      averageScore: parseFloat(row.average_score) || 0,
      aiSummary: row.ai_summary,
      strengths: row.strengths || [],
      areasForSupport: row.areas_for_support || [],
      interventionRecommendations: row.intervention_recommendations || [],
      interventionNeeded: row.intervention_needed,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ reports, weekStart });
  } catch (error: any) {
    console.error('Error fetching weekly reports:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { classId } = body;
    if (!classId) {
      return NextResponse.json({ error: 'classId is required' }, { status: 400 });
    }

    const pool = getPool();

    const classCheck = await pool.query(
      'SELECT id, name FROM classes WHERE id = $1 AND teacher_id = $2',
      [classId, user.id]
    );
    if (classCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Class not found or access denied' }, { status: 403 });
    }
    const className = classCheck.rows[0].name;

    const pupilsResult = await pool.query(
      `SELECT p.id, p.first_name, p.last_name, p.display_name
       FROM class_members cm
       JOIN pupils p ON cm.pupil_id = p.id
       WHERE cm.class_id = $1`,
      [classId]
    );

    if (pupilsResult.rows.length === 0) {
      return NextResponse.json({ error: 'No pupils found in this class' }, { status: 400 });
    }

    const weekStart = getCurrentWeekStart();
    let reportsGenerated = 0;

    for (const pupil of pupilsResult.rows) {
      const pupilName = pupil.display_name || `${pupil.first_name} ${pupil.last_name || ''}`.trim();

      const sessionsResult = await pool.query(
        `SELECT COUNT(*) as session_count, 
                COALESCE(AVG(ai_score), 0) as avg_score
         FROM writing_coach_sessions 
         WHERE pupil_id = $1 AND created_at >= $2::date`,
        [pupil.id, weekStart]
      );
      const sentencesWritten = parseInt(sessionsResult.rows[0].session_count) || 0;
      const averageScore = parseFloat(sessionsResult.rows[0].avg_score) || 0;

      const pwpResult = await pool.query(
        `SELECT COUNT(*) as completed_count
         FROM pwp_sessions
         WHERE pupil_id = $1 AND status = 'completed' AND started_at >= $2::date`,
        [pupil.id, weekStart]
      );
      const pwpCompleted = parseInt(pwpResult.rows[0].completed_count) || 0;

      const dwpResult = await pool.query(
        `SELECT COUNT(*) as completed_count,
                COUNT(CASE WHEN passed = true THEN 1 END) as mastered_count
         FROM writing_attempts
         WHERE pupil_id = $1 AND status = 'submitted' AND created_at >= $2::date`,
        [pupil.id, weekStart]
      );
      const dwpCompleted = parseInt(dwpResult.rows[0].completed_count) || 0;
      const dwpMastered = parseInt(dwpResult.rows[0].mastered_count) || 0;

      const activitiesCompleted = pwpCompleted + dwpCompleted;
      const totalActivities = activitiesCompleted > 0 ? activitiesCompleted : 1;
      const masteryCount = dwpMastered + (pwpCompleted > 0 ? Math.round(pwpCompleted * 0.7) : 0);
      const masteryRate = activitiesCompleted > 0 ? Math.round((masteryCount / totalActivities) * 100) : 0;

      const interventionNeeded = masteryRate < 60 || sentencesWritten < 2 || averageScore < 50;

      let aiAnalysis = {
        summary: `${pupilName} completed ${sentencesWritten} writing coach sessions and ${activitiesCompleted} activities this week with a mastery rate of ${masteryRate}%.`,
        strengths: [] as string[],
        areasForSupport: [] as string[],
        interventionRecommendations: [] as string[],
      };

      try {
        const llmResponse = await generateCompletion({
          messages: [
            {
              role: 'system',
              content: `You are an educational analyst for primary school writing. Analyze the pupil's weekly progress data and return a JSON object with exactly these fields:
- "summary": One paragraph describing the pupil's week of writing practice
- "strengths": An array of 1-3 specific strengths observed
- "areasForSupport": An array of 1-2 areas where the pupil needs support
- "interventionRecommendations": An array of 1-2 specific actionable recommendations for the teacher

Be encouraging but honest. Use UK English. Keep language professional but warm.`
            },
            {
              role: 'user',
              content: `Analyze this pupil's weekly progress:
- Pupil name: ${pupilName}
- Class: ${className}
- Writing coach sessions completed: ${sentencesWritten}
- Average writing score: ${averageScore.toFixed(1)}%
- PWP activities completed: ${pwpCompleted}
- DWP activities completed: ${dwpCompleted}
- DWP activities passed: ${dwpMastered}
- Overall mastery rate: ${masteryRate}%
- Intervention flagged: ${interventionNeeded ? 'Yes' : 'No'}

Return your analysis as a JSON object.`
            }
          ],
          temperature: 0.7,
          maxTokens: 800,
          jsonMode: true,
        });

        aiAnalysis = parseJSONResponse(llmResponse.content, aiAnalysis);
      } catch (llmError) {
        console.error(`LLM analysis failed for pupil ${pupil.id}:`, llmError);
        if (sentencesWritten >= 3) aiAnalysis.strengths.push('Good engagement with writing coach sessions');
        if (masteryRate >= 70) aiAnalysis.strengths.push('Strong mastery rate');
        if (sentencesWritten < 2) aiAnalysis.areasForSupport.push('Needs encouragement to use writing coach more frequently');
        if (masteryRate < 60) aiAnalysis.areasForSupport.push('Mastery rate below target - may need additional support');
        if (interventionNeeded) aiAnalysis.interventionRecommendations.push('Schedule a 1:1 check-in to discuss progress');
      }

      await pool.query(
        `INSERT INTO weekly_progress_reports 
         (pupil_id, class_id, week_start, sentences_written, activities_completed, mastery_rate, average_score, ai_summary, strengths, areas_for_support, intervention_recommendations, intervention_needed, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, now())
         ON CONFLICT (pupil_id, class_id, week_start)
         DO UPDATE SET 
           sentences_written = EXCLUDED.sentences_written,
           activities_completed = EXCLUDED.activities_completed,
           mastery_rate = EXCLUDED.mastery_rate,
           average_score = EXCLUDED.average_score,
           ai_summary = EXCLUDED.ai_summary,
           strengths = EXCLUDED.strengths,
           areas_for_support = EXCLUDED.areas_for_support,
           intervention_recommendations = EXCLUDED.intervention_recommendations,
           intervention_needed = EXCLUDED.intervention_needed,
           updated_at = now()`,
        [
          pupil.id,
          classId,
          weekStart,
          sentencesWritten,
          activitiesCompleted,
          masteryRate,
          averageScore,
          aiAnalysis.summary,
          JSON.stringify(aiAnalysis.strengths || []),
          JSON.stringify(aiAnalysis.areasForSupport || []),
          JSON.stringify(aiAnalysis.interventionRecommendations || []),
          interventionNeeded,
        ]
      );
      reportsGenerated++;
    }

    return NextResponse.json({
      success: true,
      reportsGenerated,
      weekStart,
    });
  } catch (error: any) {
    console.error('Error generating weekly reports:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate reports' }, { status: 500 });
  }
}

function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}
