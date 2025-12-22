import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.PROD_DATABASE_URL || process.env.DATABASE_URL,
});

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const BUCKET_NAME = 'practice-activities';

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
      console.error('Auth error:', authError);
      return { authorized: false, error: 'Unauthorized - Please log in' };
    }

    // Try to find profile by user ID first
    let { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // If not found by ID, try by email (handles cross-environment accounts)
    if (profileError?.code === 'PGRST116' && user.email) {
      const emailResult = await supabaseAdmin
        .from('profiles')
        .select('role')
        .ilike('email', user.email)
        .single();
      
      if (!emailResult.error) {
        profile = emailResult.data;
        profileError = null;
      }
    }

    if (profileError || !profile || profile.role !== 'admin') {
      return { authorized: false, error: 'Forbidden - Admin access required' };
    }

    return { authorized: true };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { authorized: false, error: 'Authentication failed' };
  }
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
    const fileName = formData.get('fileName') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

    if (!bucketExists) {
      const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
        allowedMimeTypes: ['text/html', 'text/css', 'application/javascript', 'image/*'],
      });

      if (createError) {
        console.error('Error creating bucket:', createError);
        return NextResponse.json({ error: 'Failed to create storage bucket' }, { status: 500 });
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const sanitizedFileName = fileName || file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = lessonId ? `lesson-${lessonId}/${sanitizedFileName}` : sanitizedFileName;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type || 'text/html',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    if (lessonId) {
      // Query lesson info from PostgreSQL
      const lessonResult = await pool.query(
        'SELECT lesson_number, part FROM lessons WHERE id = $1',
        [parseInt(lessonId)]
      );
      const lesson = lessonResult.rows[0];

      const lessonLabel = lesson 
        ? `Lesson ${lesson.lesson_number}${lesson.part || ''}`
        : `Lesson ${lessonId}`;

      // Delete existing interactive_practice file for this lesson
      try {
        await pool.query(
          'DELETE FROM lesson_files WHERE lesson_id = $1 AND file_type = $2',
          [parseInt(lessonId), 'interactive_practice']
        );
      } catch (deleteError) {
        console.error('Error deleting old lesson file:', deleteError);
      }

      // Insert new file record into PostgreSQL
      try {
        const insertResult = await pool.query(
          'INSERT INTO lesson_files (lesson_id, file_type, file_name, file_url) VALUES ($1, $2, $3, $4) RETURNING *',
          [parseInt(lessonId), 'interactive_practice', `Interactive Practice - ${lessonLabel}`, urlData.publicUrl]
        );
        console.log('Successfully linked file to lesson:', insertResult.rows[0]);
      } catch (linkError: any) {
        console.error('Error linking file to lesson:', linkError);
        return NextResponse.json({
          success: true,
          filePath: uploadData.path,
          publicUrl: urlData.publicUrl,
          linkedToLesson: false,
          linkError: linkError.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      filePath: uploadData.path,
      publicUrl: urlData.publicUrl,
      linkedToLesson: !!lessonId,
    });
  } catch (error) {
    console.error('Storage API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authCheck = await verifyAdmin(request);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

    if (!bucketExists) {
      return NextResponse.json({ files: [], bucketExists: false });
    }

    const { data: files, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

    if (error) {
      console.error('Error listing files:', error);
      return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
    }

    const filesWithUrls = await Promise.all(
      (files || []).map(async (file) => {
        if (file.id === null) {
          const { data: subFiles } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .list(file.name, { limit: 100 });

          return {
            ...file,
            isFolder: true,
            subFiles: subFiles?.map(sf => ({
              ...sf,
              publicUrl: supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(`${file.name}/${sf.name}`).data.publicUrl,
            })),
          };
        }

        const { data: urlData } = supabaseAdmin.storage
          .from(BUCKET_NAME)
          .getPublicUrl(file.name);

        return {
          ...file,
          isFolder: false,
          publicUrl: urlData.publicUrl,
        };
      })
    );

    return NextResponse.json({ files: filesWithUrls, bucketExists: true });
  } catch (error) {
    console.error('Storage API error:', error);
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
    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json({ error: 'File path required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Storage API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
