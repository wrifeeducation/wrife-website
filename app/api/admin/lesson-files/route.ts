import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
  'application/msword',
  'application/vnd.ms-excel',
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
    const fileType = getFileType(file.name);

    const { data: existingFiles } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .list(folderPath, { limit: 100 });

    if (existingFiles) {
      const sameTypeFiles = existingFiles.filter(f => 
        f.id !== null && getFileType(f.name) === fileType && f.name !== sanitizedFileName
      );
      
      if (sameTypeFiles.length > 0) {
        const filesToDelete = sameTypeFiles.map(f => `${folderPath}/${f.name}`);
        await supabaseAdmin.storage.from(BUCKET_NAME).remove(filesToDelete);
      }
    }

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

    await supabaseAdmin
      .from('lesson_files')
      .delete()
      .eq('lesson_id', parseInt(lessonId))
      .eq('file_type', fileType);

    await supabaseAdmin
      .from('lesson_files')
      .insert({
        lesson_id: parseInt(lessonId),
        file_type: fileType,
        file_name: sanitizedFileName,
        file_url: urlData.publicUrl,
      });

    return NextResponse.json({
      success: true,
      filePath: uploadData.path,
      publicUrl: urlData.publicUrl,
      fileType: fileType,
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

    await supabaseAdmin
      .from('lesson_files')
      .delete()
      .eq('lesson_id', parseInt(lessonId))
      .eq('file_name', fileName);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lesson files API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
