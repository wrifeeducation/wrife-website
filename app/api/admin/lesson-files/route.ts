import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const BUCKET_NAME = 'lesson-files';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'text/html',
  'text/css',
  'application/javascript',
  'image/*',
];

async function verifyAdmin(request: NextRequest): Promise<{ authorized: boolean; error?: string }> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authorized: false, error: 'Unauthorized - Please log in' };
    }

    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return { authorized: false, error: 'Unauthorized - Please log in' };
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return { authorized: false, error: 'Forbidden - Admin access required' };
    }

    return { authorized: true };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { authorized: false, error: 'Authentication failed' };
  }
}

function getFileType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  const typeMap: Record<string, string> = {
    'pdf': 'pdf',
    'docx': 'docx',
    'doc': 'docx',
    'xlsx': 'xlsx',
    'xls': 'xlsx',
    'html': 'html',
    'htm': 'html',
    'pptx': 'pptx',
    'ppt': 'pptx',
  };
  return typeMap[ext] || ext;
}

function getMimeType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  const mimeMap: Record<string, string> = {
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'doc': 'application/msword',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'xls': 'application/vnd.ms-excel',
    'html': 'text/html',
    'htm': 'text/html',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'ppt': 'application/vnd.ms-powerpoint',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

function detectFileCategoryFromName(filename: string): string {
  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.includes('worksheet') && lowerFilename.includes('challenge')) {
    return 'worksheet_challenge';
  }
  if (lowerFilename.includes('worksheet') && lowerFilename.includes('support')) {
    return 'worksheet_support';
  }
  if (lowerFilename.includes('worksheet') && lowerFilename.includes('core')) {
    return 'worksheet_core';
  }
  if (lowerFilename.includes('worksheet')) {
    return 'worksheet_core';
  }
  
  if (lowerFilename.includes('presentation')) {
    return 'presentation';
  }
  
  if (lowerFilename.includes('assessment')) {
    return 'assessment';
  }
  
  if (lowerFilename.includes('progress') && lowerFilename.includes('tracker')) {
    return 'progress_tracker';
  }
  if (lowerFilename.includes('progress_tracker')) {
    return 'progress_tracker';
  }
  
  if (lowerFilename.includes('teacher') && lowerFilename.includes('guide')) {
    return 'teacher_guide';
  }
  if (lowerFilename.includes('teaching') && lowerFilename.includes('guide')) {
    return 'teacher_guide';
  }
  
  if (lowerFilename.endsWith('.html') || lowerFilename.endsWith('.htm')) {
    return 'interactive_practice';
  }
  
  return 'teacher_guide';
}

export async function POST(request: NextRequest) {
  const authCheck = await verifyAdmin(request);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: 401 });
  }
  
  const supabaseAdmin = getSupabaseAdmin();
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const lessonId = formData.get('lessonId') as string;
    const fileCategory = formData.get('fileCategory') as string; // canonical type from frontend

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID required' }, { status: 400 });
    }

    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

    if (!bucketExists) {
      const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
      });

      if (createError) {
        console.error('Error creating bucket:', createError);
        return NextResponse.json({ error: 'Failed to create storage bucket' }, { status: 500 });
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const folderPath = `lesson-${lessonId}`;
    const filePath = `${folderPath}/${sanitizedFileName}`;
    const mimeType = getMimeType(file.name);
    
    // Use explicit category if provided and not default, otherwise auto-detect from filename
    const canonicalType = (fileCategory && fileCategory !== 'teacher_guide') 
      ? fileCategory 
      : detectFileCategoryFromName(file.name);

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    // Delete existing file record with same name (if re-uploading)
    try {
      await pool.query(
        'DELETE FROM lesson_files WHERE lesson_id = $1 AND file_name = $2',
        [parseInt(lessonId), sanitizedFileName]
      );
    } catch (deleteError) {
      console.error('Error deleting existing file record:', deleteError);
    }

    // Insert new file record into PostgreSQL with canonical file type
    try {
      await pool.query(
        'INSERT INTO lesson_files (lesson_id, file_type, file_name, file_url) VALUES ($1, $2, $3, $4)',
        [parseInt(lessonId), canonicalType, sanitizedFileName, urlData.publicUrl]
      );
    } catch (insertError: any) {
      console.error('Error inserting file record:', insertError);
      return NextResponse.json({ 
        error: 'File uploaded to storage but failed to save record to database.',
        details: insertError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      filePath: uploadData.path,
      publicUrl: urlData.publicUrl,
      fileType: canonicalType,
      fileName: sanitizedFileName,
    });
  } catch (error) {
    console.error('Lesson files API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authCheck = await verifyAdmin(request);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get('lessonId');

  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

    if (!bucketExists) {
      return NextResponse.json({ files: [], bucketExists: false });
    }

    if (lessonId) {
      const folderPath = `lesson-${lessonId}`;
      const { data: files, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .list(folderPath, { limit: 100, sortBy: { column: 'name', order: 'asc' } });

      if (error) {
        console.error('Error listing files:', error);
        return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
      }

      const filesWithUrls = (files || [])
        .filter(f => f.id !== null)
        .map(file => ({
          name: file.name,
          fileType: getFileType(file.name),
          publicUrl: supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(`${folderPath}/${file.name}`).data.publicUrl,
          createdAt: file.created_at,
          size: file.metadata?.size,
        }));

      return NextResponse.json({ files: filesWithUrls, lessonId });
    }

    const { data: folders, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

    if (error) {
      console.error('Error listing folders:', error);
      return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
    }

    const lessonFolders = (folders || []).filter(f => f.id === null && f.name.startsWith('lesson-'));
    
    const allFiles: Record<string, any[]> = {};
    
    for (const folder of lessonFolders) {
      const lessonIdFromFolder = folder.name.replace('lesson-', '');
      const { data: files } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .list(folder.name, { limit: 100 });
      
      if (files && files.length > 0) {
        allFiles[lessonIdFromFolder] = files
          .filter(f => f.id !== null)
          .map(file => ({
            name: file.name,
            fileType: getFileType(file.name),
            publicUrl: supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(`${folder.name}/${file.name}`).data.publicUrl,
          }));
      }
    }

    return NextResponse.json({ filesByLesson: allFiles, bucketExists: true });
  } catch (error) {
    console.error('Lesson files API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authCheck = await verifyAdmin(request);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: 401 });
  }

  try {
    const { lessonId, fileUrl, fileName, fileType } = await request.json();

    if (!lessonId || !fileUrl) {
      return NextResponse.json({ error: 'Lesson ID and file URL required' }, { status: 400 });
    }

    const parsedLessonId = parseInt(lessonId);
    const resolvedFileType = fileType || 'interactive_practice';

    // Delete any existing file with same lesson_id and file_type to prevent duplicates
    await pool.query(
      'DELETE FROM lesson_files WHERE lesson_id = $1 AND file_type = $2',
      [parsedLessonId, resolvedFileType]
    );

    // Insert file record into PostgreSQL
    await pool.query(
      'INSERT INTO lesson_files (lesson_id, file_type, file_name, file_url) VALUES ($1, $2, $3, $4)',
      [parsedLessonId, resolvedFileType, fileName || 'Linked File', fileUrl]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error linking file to lesson:', error);
    return NextResponse.json({ error: error.message || 'Failed to link file' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authCheck = await verifyAdmin(request);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  try {
    const { lessonId, fileName } = await request.json();

    if (!lessonId || !fileName) {
      return NextResponse.json({ error: 'Lesson ID and file name required' }, { status: 400 });
    }

    const filePath = `lesson-${lessonId}/${fileName}`;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }

    // Delete record from PostgreSQL
    try {
      await pool.query(
        'DELETE FROM lesson_files WHERE lesson_id = $1 AND file_name = $2',
        [parseInt(lessonId), fileName]
      );
    } catch (dbError) {
      console.error('Error deleting file record from database:', dbError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lesson files API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
