import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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

    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('assignments')
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (assignmentError) {
      console.error('Assignment error:', assignmentError);
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    let lessonFiles: any[] = [];
    let interactiveHtml: string | null = null;
    
    if (assignment.lesson_id) {
      const { data: filesData } = await supabaseAdmin
        .from('lesson_files')
        .select('*')
        .eq('lesson_id', assignment.lesson_id)
        .like('file_type', '%interactive_practice%');
      lessonFiles = filesData || [];
      
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
        const { data: submissionData } = await supabaseAdmin
          .from('submissions')
          .select('*')
          .eq('assignment_id', assignmentId)
          .eq('pupil_id', pupilId)
          .single();

        if (submissionData) {
          submission = submissionData;

          if (submissionData.status === 'reviewed') {
            const { data: assessmentData } = await supabaseAdmin
              .from('ai_assessments')
              .select('*')
              .eq('submission_id', submissionData.id)
              .single();
            
            if (assessmentData) {
              assessment = assessmentData;
            }
          }
        }
      } catch (err) {
        console.log('Submissions table may not exist');
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

    const { data: existingSubmission } = await supabaseAdmin
      .from('submissions')
      .select('id')
      .eq('assignment_id', assignmentId)
      .eq('pupil_id', pupilId)
      .single();

    let submission;
    
    if (existingSubmission) {
      const updateData: any = { content, status };
      if (status === 'submitted') {
        updateData.submitted_at = new Date().toISOString();
      }
      
      const { data, error } = await supabaseAdmin
        .from('submissions')
        .update(updateData)
        .eq('id', existingSubmission.id)
        .select()
        .single();
      
      if (error) throw error;
      submission = data;
    } else {
      const insertData: any = {
        assignment_id: assignmentId,
        pupil_id: pupilId,
        content,
        status
      };
      if (status === 'submitted') {
        insertData.submitted_at = new Date().toISOString();
      }
      
      const { data, error } = await supabaseAdmin
        .from('submissions')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      submission = data;
    }

    return NextResponse.json({ submission });
  } catch (error) {
    console.error('Save submission error:', error);
    return NextResponse.json({ error: 'Could not save submission' }, { status: 500 });
  }
}
