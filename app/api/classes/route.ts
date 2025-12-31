import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

async function generateUniqueClassCode(pool: any, className: string, yearGroup: number): Promise<string> {
  const prefix = className.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
  
  for (let attempt = 0; attempt < 10; attempt++) {
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    const code = `${prefix}${yearGroup}${randomNum}`;
    
    const existing = await pool.query(
      'SELECT id FROM classes WHERE LOWER(class_code) = LOWER($1)',
      [code]
    );
    
    if (existing.rows.length === 0) {
      return code;
    }
  }
  
  const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `${prefix}${yearGroup}${timestamp}`;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = getPool();
    
    const result = await pool.query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM pupils p WHERE p.class_id = c.id) as pupil_count,
              pr.display_name as teacher_name
       FROM classes c
       LEFT JOIN profiles pr ON c.teacher_id = pr.id
       WHERE c.teacher_id = $1
       ORDER BY c.created_at DESC`,
      [user.id]
    );

    return NextResponse.json({ classes: result.rows });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, yearGroup, schoolName } = body;

    if (!name || !yearGroup) {
      return NextResponse.json({ error: 'Name and year group are required' }, { status: 400 });
    }

    const pool = getPool();
    
    const profileResult = await pool.query(
      'SELECT school_id FROM profiles WHERE id = $1',
      [user.id]
    );
    const schoolId = profileResult.rows[0]?.school_id;

    const classCode = await generateUniqueClassCode(pool, name, yearGroup);

    const result = await pool.query(
      `INSERT INTO classes (teacher_id, name, year_group, class_code, school_name, school_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user.id, name, yearGroup, classCode, schoolName || null, schoolId || null]
    );

    return NextResponse.json({ class: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 });
  }
}
