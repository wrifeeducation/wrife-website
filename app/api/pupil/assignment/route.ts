import { NextRequest, NextResponse } from 'next/server';
import { validatePupilSession } from '@/lib/pupil-auth';
import { getPool } from '@/lib/db';

function getGoogleDriveFileId(shareUrl: string): string | null {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = shareUrl.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

function getGoogleDrivePreviewUrl(shareUrl: string): string | null {
  const fileId = getGoogleDriveFileId(shareUrl);
  return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
}

export async function POST(request: NextRequest) {
  try {
    const { assignmentId, pupilId } = await request.json();

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    const pool = getPool();

    const assignmentResult = await pool.query(
      `SELECT a.id, a.lesson_id, a.class_id, a.teacher_id, a.title, a.instructions, a.due_date, a.created_at
       FROM assignments a WHERE a.id = $1`,
      [assignmentId]
    );

    if (assignmentResult.rows.length === 0) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const assignment = assignmentResult.rows[0];

    let lessonFiles: any[] = [];
    let interactiveHtml: string | null = null;

    if (assignment.lesson_id) {
      const filesResult = await pool.query(
        `SELECT * FROM lesson_files WHERE lesson_id = $1 AND file_type LIKE '%interactive_practice%'`,
        [assignment.lesson_id]
      );
      lessonFiles = filesResult.rows || [];
      if (lessonFiles.length > 0 && lessonFiles[0].file_url) {
        interactiveHtml = lessonFiles[0].file_url;
      }
    }

    let submission = null;
    let assessment = null;

    if (pupilId) {
      try {
        const subResult = await pool.query(
          `SELECT id, assignment_id, pupil_id, content, status, submitted_at, teacher_feedback, created_at, updated_at
           FROM submissions WHERE assignment_id = $1 AND pupil_id = $2`,
          [assignmentId, pupilId]
        );

        if (subResult.rows.length > 0) {
          submission = subResult.rows[0];

          if (submission.status === 'reviewed') {
            const assessResult = await pool.query(
              `SELECT * FROM ai_assessments WHERE submission_id = $1 LIMIT 1`,
              [submission.id]
            );
            if (assessResult.rows.length > 0) {
              assessment = assessResult.rows[0];
            }
          }
        }
      } catch (err) {
        console.log('Could not load submission:', err);
      }
    }

    return NextResponse.json({ assignment, lessonFiles, interactiveHtml, submission, assessment });
  } catch (error: any) {
    console.error('Fetch assignment error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

async function verifyPupilExists(pupilId: string): Promise<boolean> {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT id FROM pupils WHERE id = $1 LIMIT 1', [pupilId]);
    return result.rows.length > 0;
  } catch {
    return false;
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { assignmentId, pupilId, content, status } = await request.json();

    if (!assignmentId || !pupilId) {
      return NextResponse.json({ error: 'Assignment ID and pupil ID required' }, { status: 400 });
    }

    const sessionCheck = await validatePupilSession(pupilId);
    if (!sessionCheck.valid) {
      const exists = await verifyPupilExists(pupilId);
      if (!exists) {
        return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
      }
      console.warn(`[assignment-put] Pupil ${pupilId} has no active session but exists — allowing save`);
    }

    const pool = getPool();

    const existingResult = await pool.query(
      `SELECT id FROM submissions WHERE assignment_id = $1 AND pupil_id = $2`,
      [assignmentId, pupilId]
    );

    let submission;

    if (existingResult.rows.length > 0) {
      const existingId = existingResult.rows[0].id;
      const updateFields: string[] = ['content = $1', 'status = $2', 'updated_at = now()'];
      const updateValues: any[] = [content, status];

      if (status === 'submitted') {
        updateFields.push('submitted_at = now()');
      }

      const updateResult = await pool.query(
        `UPDATE submissions SET ${updateFields.join(', ')} WHERE id = $${updateValues.length + 1} RETURNING *`,
        [...updateValues, existingId]
      );
      submission = updateResult.rows[0];
    } else {
      const insertResult = await pool.query(
        `INSERT INTO submissions (assignment_id, pupil_id, content, status, submitted_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [assignmentId, pupilId, content, status, status === 'submitted' ? new Date() : null]
      );
      submission = insertResult.rows[0];
    }

    return NextResponse.json({ submission });
  } catch (error: any) {
    console.error('Save submission error:', error);
    return NextResponse.json({ error: 'Could not save submission' }, { status: 500 });
  }
}
