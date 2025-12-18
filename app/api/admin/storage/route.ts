import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
      const { data: lesson } = await supabaseAdmin
        .from('lessons')
        .select('lesson_number, part')
        .eq('id', parseInt(lessonId))
        .single();

      const lessonLabel = lesson 
        ? `Lesson ${lesson.lesson_number}${lesson.part || ''}`
        : `Lesson ${lessonId}`;

      const { error: deleteError } = await supabaseAdmin
        .from('lesson_files')
        .delete()
        .eq('lesson_id', parseInt(lessonId))
        .eq('file_type', 'interactive_practice');

      if (deleteError) {
        console.error('Error deleting old lesson file:', deleteError);
      }

      const { data: insertData, error: linkError } = await supabaseAdmin
        .from('lesson_files')
        .insert({
          lesson_id: parseInt(lessonId),
          file_type: 'interactive_practice',
          file_name: `Interactive Practice - ${lessonLabel}`,
          file_url: urlData.publicUrl,
        })
        .select()
        .single();

      if (linkError) {
        console.error('Error linking file to lesson:', linkError);
        return NextResponse.json({
          success: true,
          filePath: uploadData.path,
          publicUrl: urlData.publicUrl,
          linkedToLesson: false,
          linkError: linkError.message,
        });
      }

      console.log('Successfully linked file to lesson:', insertData);
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
