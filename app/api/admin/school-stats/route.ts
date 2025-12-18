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
      const [teachersResult, classesResult] = await Promise.all([
        supabaseAdmin
          .from('profiles')
          .select('id, email, display_name, first_name, last_name, created_at')
          .eq('school_id', schoolId)
          .eq('role', 'teacher'),
        supabaseAdmin
          .from('classes')
          .select('id')
          .eq('school_id', schoolId)
      ]);

      if (teachersResult.error) {
        return NextResponse.json({ error: teachersResult.error.message }, { status: 500 });
      }
      if (classesResult.error) {
        return NextResponse.json({ error: classesResult.error.message }, { status: 500 });
      }

      let pupils: any[] = [];
      const classIds = (classesResult.data || []).map(c => c.id);
      
      if (classIds.length > 0) {
        const { data: membersData, error: membersError } = await supabaseAdmin
          .from('class_members')
          .select('id, pupil_id, pupil_name, pupil_email, created_at')
          .in('class_id', classIds);
        
        if (!membersError && membersData) {
          const seenIds = new Set<string>();
          const uniqueMembers: any[] = [];
          const pupilIds: string[] = [];
          
          for (const m of membersData) {
            const id = m.pupil_id || String(m.id);
            if (!seenIds.has(id)) {
              seenIds.add(id);
              uniqueMembers.push(m);
              if (m.pupil_id) {
                pupilIds.push(m.pupil_id);
              }
            }
          }
          
          let pupilsLookup: Record<string, any> = {};
          if (pupilIds.length > 0) {
            const { data: pupilsData } = await supabaseAdmin
              .from('pupils')
              .select('id, first_name, last_name, display_name')
              .in('id', pupilIds);
            
            if (pupilsData) {
              for (const p of pupilsData) {
                pupilsLookup[p.id] = p;
              }
            }
          }
          
          pupils = uniqueMembers.map(m => {
            const pupilData = m.pupil_id ? pupilsLookup[m.pupil_id] : null;
            return {
              id: m.pupil_id || String(m.id),
              email: m.pupil_email || null,
              display_name: pupilData?.display_name || m.pupil_name || null,
              first_name: pupilData?.first_name || null,
              last_name: pupilData?.last_name || null,
              created_at: m.created_at,
            };
          });
        }
      }

      return NextResponse.json({
        teachers: teachersResult.data || [],
        teacherCount: teachersResult.data?.length || 0,
        pupils: pupils,
        pupilCount: pupils.length,
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
        const [teachersResult, classesResult] = await Promise.all([
          supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('school_id', school.id)
            .eq('role', 'teacher'),
          supabaseAdmin
            .from('classes')
            .select('id')
            .eq('school_id', school.id)
        ]);

        if (teachersResult.error) {
          throw new Error(`Failed to fetch teachers for school ${school.id}: ${teachersResult.error.message}`);
        }
        if (classesResult.error) {
          throw new Error(`Failed to fetch classes for school ${school.id}: ${classesResult.error.message}`);
        }

        const teacherCount = (teachersResult.data || []).length;
        
        let pupilCount = 0;
        const classIds = (classesResult.data || []).map(c => c.id);
        
        if (classIds.length > 0) {
          const { data: membersData, error: membersError } = await supabaseAdmin
            .from('class_members')
            .select('id, pupil_id')
            .in('class_id', classIds);
          
          if (!membersError && membersData) {
            const uniquePupils = new Set<string>();
            for (const m of membersData) {
              uniquePupils.add(m.pupil_id || String(m.id));
            }
            pupilCount = uniquePupils.size;
          }
        }

        return {
          ...school,
          teacherCount: teacherCount,
          pupilCount: pupilCount,
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
