import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin, supabaseAdmin, AuthError } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();

    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');

    if (admin.role === 'school_admin' && schoolId && schoolId !== admin.schoolId) {
      return NextResponse.json({ error: 'Forbidden: You can only access your own school' }, { status: 403 });
    }

    if (schoolId) {
      const [teachersResult, pupilsResult] = await Promise.all([
        supabaseAdmin
          .from('profiles')
          .select('id, email, display_name, first_name, last_name, created_at')
          .eq('school_id', schoolId)
          .eq('role', 'teacher'),
        supabaseAdmin
          .from('profiles')
          .select('id, email, display_name, first_name, last_name, created_at')
          .eq('school_id', schoolId)
          .eq('role', 'pupil')
      ]);

      if (teachersResult.error) {
        return NextResponse.json({ error: teachersResult.error.message }, { status: 500 });
      }
      if (pupilsResult.error) {
        return NextResponse.json({ error: pupilsResult.error.message }, { status: 500 });
      }

      return NextResponse.json({
        teachers: teachersResult.data || [],
        teacherCount: teachersResult.data?.length || 0,
        pupils: pupilsResult.data || [],
        pupilCount: pupilsResult.data?.length || 0,
      });
    }

    if (admin.role === 'school_admin') {
      return NextResponse.json({ error: 'Forbidden: School admins must specify a school ID' }, { status: 403 });
    }

    const { data: schools, error: schoolsError } = await supabaseAdmin
      .from('schools')
      .select('*')
      .order('name');

    if (schoolsError) {
      return NextResponse.json({ error: schoolsError.message }, { status: 500 });
    }

    const schoolsWithCounts = await Promise.all(
      (schools || []).map(async (school) => {
        const [teachersResult, pupilsResult] = await Promise.all([
          supabaseAdmin
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', school.id)
            .eq('role', 'teacher'),
          supabaseAdmin
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', school.id)
            .eq('role', 'pupil')
        ]);

        if (teachersResult.error) {
          throw new Error(`Failed to fetch teachers for school ${school.id}: ${teachersResult.error.message}`);
        }
        if (pupilsResult.error) {
          throw new Error(`Failed to fetch pupils for school ${school.id}: ${pupilsResult.error.message}`);
        }

        return {
          ...school,
          teacherCount: teachersResult.count || 0,
          pupilCount: pupilsResult.count || 0,
        };
      })
    );

    return NextResponse.json({ schools: schoolsWithCounts });
  } catch (error: any) {
    console.error('Error fetching school stats:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
