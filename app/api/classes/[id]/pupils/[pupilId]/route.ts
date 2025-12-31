import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pupilId: string }> }
) {
  try {
    const { id: classId, pupilId } = await params;
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
      `SELECT p.*, c.class_code,
              (SELECT COUNT(*) FROM pupil_activity_log pal WHERE pal.pupil_id = p.id) as activity_count,
              (SELECT COUNT(*) FROM submissions s WHERE s.pupil_id = p.id) as total_submissions,
              (SELECT COUNT(*) FROM submissions s WHERE s.pupil_id = p.id AND s.status = 'submitted') as completed_submissions
       FROM pupils p
       JOIN classes c ON p.class_id = c.id
       WHERE p.id = $1 AND p.class_id = $2`,
      [pupilId, classId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Pupil not found' }, { status: 404 });
    }

    const pupil = result.rows[0];
    delete pupil.password_hash;

    return NextResponse.json({ pupil });
  } catch (error) {
    console.error('Error fetching pupil:', error);
    return NextResponse.json({ error: 'Failed to fetch pupil' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pupilId: string }> }
) {
  try {
    const { id: classId, pupilId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, isActive } = body;

    const pool = getPool();
    
    const classCheck = await pool.query(
      'SELECT id FROM classes WHERE id = $1 AND teacher_id = $2',
      [classId, user.id]
    );
    
    if (classCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const displayName = firstName && lastName ? `${firstName} ${lastName}` : firstName || undefined;

    const result = await pool.query(
      `UPDATE pupils 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           display_name = COALESCE($3, display_name),
           is_active = COALESCE($4, is_active),
           updated_at = NOW()
       WHERE id = $5 AND class_id = $6
       RETURNING id, first_name, last_name, display_name, username, year_group, is_active`,
      [firstName, lastName, displayName, isActive, pupilId, classId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Pupil not found' }, { status: 404 });
    }

    return NextResponse.json({ pupil: result.rows[0] });
  } catch (error) {
    console.error('Error updating pupil:', error);
    return NextResponse.json({ error: 'Failed to update pupil' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pupilId: string }> }
) {
  try {
    const { id: classId, pupilId } = await params;
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
      'DELETE FROM pupils WHERE id = $1 AND class_id = $2 RETURNING id',
      [pupilId, classId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Pupil not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pupil:', error);
    return NextResponse.json({ error: 'Failed to delete pupil' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pupilId: string }> }
) {
  try {
    const { id: classId, pupilId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action !== 'reset-password') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const pool = getPool();
    
    const classCheck = await pool.query(
      'SELECT c.id, c.class_code FROM classes c WHERE c.id = $1 AND c.teacher_id = $2',
      [classId, user.id]
    );
    
    if (classCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const newPin = generatePin();
    const passwordHash = await bcrypt.hash(newPin, 10);

    const result = await pool.query(
      `UPDATE pupils 
       SET password_hash = $1, updated_at = NOW()
       WHERE id = $2 AND class_id = $3
       RETURNING id, first_name, last_name, display_name, username`,
      [passwordHash, pupilId, classId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Pupil not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      pupil: result.rows[0],
      credentials: {
        classCode: classCheck.rows[0].class_code,
        username: result.rows[0].username,
        pin: newPin
      }
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
