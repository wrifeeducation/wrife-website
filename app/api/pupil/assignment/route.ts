import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function getGoogleDriveFileId(shareUrl: string): string | null {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = shareUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

function getGoogleDrivePreviewUrl(shareUrl: string): string | null {
  const fileId = getGoogleDriveFileId(shareUrl);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { assignmentId, pupilId } = await request.json();
    
    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    const assignmentResult = await pool.query(
      'SELECT * FROM assignments WHERE id = $1',
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
      
      if (lessonFiles.length > 0) {
        const practiceFile = lessonFiles[0];
        if (practiceFile?.file_url) {
          interactiveHtml = practiceFile.file_url;
        }
      }
    }

    let submission = null;
    let assessment = null;
    
    if (pupilId) {
      try {
        const submissionResult = await pool.query(
          'SELECT * FROM submissions WHERE assignment_id = $1 AND pupil_id = $2',
          [assignmentId, pupilId]
        );

        if (submissionResult.rows.length > 0) {
          submission = submissionResult.rows[0];

          if (submission.status === 'reviewed') {
            const assessmentResult = await pool.query(
              'SELECT * FROM ai_assessments WHERE submission_id = $1',
              [submission.id]
            );
            
            if (assessmentResult.rows.length > 0) {
              assessment = assessmentResult.rows[0];
            }
          }
        }
      } catch (err) {
        console.log('Error fetching submission:', err);
      }
    }

    return NextResponse.json({
      assignment,
      lessonFiles,
      interactiveHtml,
      submission,
      assessment
    });
  } catch (error) {
    console.error('Fetch assignment error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { assignmentId, pupilId, content, status } = await request.json();
    
    if (!assignmentId || !pupilId) {
      return NextResponse.json({ error: 'Assignment ID and pupil ID required' }, { status: 400 });
    }

    const existingResult = await pool.query(
      'SELECT id FROM submissions WHERE assignment_id = $1 AND pupil_id = $2',
      [assignmentId, pupilId]
    );

    let submission;
    
    if (existingResult.rows.length > 0) {
      const existingId = existingResult.rows[0].id;
      const submittedAt = status === 'submitted' ? new Date().toISOString() : null;
      
      const updateResult = await pool.query(
        `UPDATE submissions 
         SET content = $1, status = $2, submitted_at = COALESCE($3, submitted_at)
         WHERE id = $4
         RETURNING *`,
        [content, status, submittedAt, existingId]
      );
      
      submission = updateResult.rows[0];
    } else {
      const submittedAt = status === 'submitted' ? new Date().toISOString() : null;
      
      const insertResult = await pool.query(
        `INSERT INTO submissions (assignment_id, pupil_id, content, status, submitted_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [assignmentId, pupilId, content, status, submittedAt]
      );
      
      submission = insertResult.rows[0];
    }

    return NextResponse.json({ submission });
  } catch (error) {
    console.error('Save submission error:', error);
    return NextResponse.json({ error: 'Could not save submission' }, { status: 500 });
  }
}
