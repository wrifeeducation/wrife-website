import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

async function generateUniqueUsername(pool: any, classId: number, firstName: string, lastName: string): Promise<string> {
  const first = firstName.toLowerCase().replace(/[^a-z]/g, '').substring(0, 3) || 'usr';
  const last = lastName?.toLowerCase().replace(/[^a-z]/g, '').substring(0, 3) || 'x';
  
  for (let attempt = 0; attempt < 20; attempt++) {
    const random = Math.floor(Math.random() * 1000);
    const username = `${first}${last}${random}`;
    
    const existing = await pool.query(
      'SELECT id FROM pupils WHERE class_id = $1 AND LOWER(username) = LOWER($2)',
      [classId, username]
    );
    
    if (existing.rows.length === 0) {
      return username;
    }
  }
  
  const timestamp = Date.now().toString(36).slice(-5);
  return `${first}${timestamp}`;
}

function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = getPool();
    
    const classCheck = await pool.query(
      'SELECT id FROM classes WHERE id = $1 AND teacher_id = $2',
      [classId, user.id]
    );
    
    if (classCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const result = await pool.query(
      `SELECT p.id, p.first_name, p.last_name, p.display_name, p.username, 
              p.year_group, p.is_active, p.last_login_at, p.created_at,
              (SELECT COUNT(*) FROM pupil_activity_log pal WHERE pal.pupil_id = p.id) as activity_count,
              (SELECT COUNT(*) FROM submissions s WHERE s.pupil_id = p.id AND s.status = 'submitted') as submissions_count
       FROM pupils p
       WHERE p.class_id = $1
       ORDER BY p.first_name, p.last_name`,
      [classId]
    );

    return NextResponse.json({ pupils: result.rows });
  } catch (error) {
    console.error('Error fetching pupils:', error);
    return NextResponse.json({ error: 'Failed to fetch pupils' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, yearGroup } = body;

    if (!firstName) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 });
    }

    const pool = getPool();
    
    const classResult = await pool.query(
      'SELECT id, class_code, year_group FROM classes WHERE id = $1 AND teacher_id = $2',
      [classId, user.id]
    );
    
    if (classResult.rows.length === 0) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const classData = classResult.rows[0];
    const pupilYearGroup = yearGroup || classData.year_group;
    const username = await generateUniqueUsername(pool, parseInt(classId), firstName, lastName || '');
    const pin = generatePin();
    const passwordHash = await bcrypt.hash(pin, 10);
    const displayName = lastName ? `${firstName} ${lastName}` : firstName;

    const result = await pool.query(
      `INSERT INTO pupils (class_id, first_name, last_name, display_name, username, password_hash, year_group)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, first_name, last_name, display_name, username, year_group, is_active, created_at`,
      [classId, firstName, lastName || null, displayName, username, passwordHash, pupilYearGroup]
    );

    return NextResponse.json({ 
      pupil: result.rows[0],
      credentials: {
        classCode: classData.class_code,
        username: username,
        pin: pin
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating pupil:', error);
    return NextResponse.json({ error: 'Failed to create pupil' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pupils } = body;

    if (!Array.isArray(pupils) || pupils.length === 0) {
      return NextResponse.json({ error: 'Pupils array is required' }, { status: 400 });
    }

    const pool = getPool();
    
    const classResult = await pool.query(
      'SELECT id, class_code, year_group FROM classes WHERE id = $1 AND teacher_id = $2',
      [classId, user.id]
    );
    
    if (classResult.rows.length === 0) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const classData = classResult.rows[0];
    const createdPupils: any[] = [];

    for (const pupil of pupils) {
      const { firstName, lastName } = pupil;
      if (!firstName) continue;

      const pupilYearGroup = pupil.yearGroup || classData.year_group;
      const username = await generateUniqueUsername(pool, parseInt(classId), firstName, lastName || '');
      const pin = generatePin();
      const passwordHash = await bcrypt.hash(pin, 10);
      const displayName = lastName ? `${firstName} ${lastName}` : firstName;

      const result = await pool.query(
        `INSERT INTO pupils (class_id, first_name, last_name, display_name, username, password_hash, year_group)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, first_name, last_name, display_name, username, year_group`,
        [classId, firstName, lastName || null, displayName, username, passwordHash, pupilYearGroup]
      );

      createdPupils.push({
        ...result.rows[0],
        credentials: {
          classCode: classData.class_code,
          username: username,
          pin: pin
        }
      });
    }

    return NextResponse.json({ 
      pupils: createdPupils,
      count: createdPupils.length
    }, { status: 201 });
  } catch (error) {
    console.error('Error bulk creating pupils:', error);
    return NextResponse.json({ error: 'Failed to create pupils' }, { status: 500 });
  }
}
