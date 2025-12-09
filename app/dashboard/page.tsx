"use client";

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import MetricCard from "../../components/MetricCard";
import Navbar from "../../components/Navbar";
import { supabase } from '@/lib/supabase';

interface RecentSubmission {
  id: number;
  pupil_name: string;
  assignment_title: string;
  submitted_at: string;
}

interface DashboardStats {
  totalPupils: number;
  activePupils: number;
  pendingReviews: number;
  completedAssignments: number;
  totalClasses: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalPupils: 0,
    activePupils: 0,
    pendingReviews: 0,
    completedAssignments: 0,
    totalClasses: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirectTo=/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  async function fetchDashboardData() {
    if (!user) return;

    try {
      const { data: classes } = await supabase
        .from('classes')
        .select('id')
        .eq('teacher_id', user.id);

      const classIds = classes?.map(c => c.id) || [];
      const totalClasses = classIds.length;

      let totalPupils = 0;
      if (classIds.length > 0) {
        const { count } = await supabase
          .from('class_members')
          .select('*', { count: 'exact', head: true })
          .in('class_id', classIds);
        totalPupils = count || 0;
      }

      let pendingReviews = 0;
      let completedAssignments = 0;
      const submissions: RecentSubmission[] = [];

      if (classIds.length > 0) {
        const { data: assignments } = await supabase
          .from('assignments')
          .select('id, title')
          .in('class_id', classIds);

        const assignmentIds = assignments?.map(a => a.id) || [];
        const assignmentMap = new Map(assignments?.map(a => [a.id, a.title]) || []);

        if (assignmentIds.length > 0) {
          const { data: submissionsData } = await supabase
            .from('submissions')
            .select('*')
            .in('assignment_id', assignmentIds)
            .order('submitted_at', { ascending: false })
            .limit(10);

          if (submissionsData) {
            pendingReviews = submissionsData.filter(s => s.status === 'submitted').length;
            completedAssignments = submissionsData.filter(s => s.status === 'reviewed').length;

            for (const sub of submissionsData.slice(0, 5)) {
              if (sub.submitted_at) {
                const { data: member } = await supabase
                  .from('class_members')
                  .select('pupil_name')
                  .eq('id', sub.pupil_id)
                  .single();

                submissions.push({
                  id: sub.id,
                  pupil_name: member?.pupil_name || 'Unknown',
                  assignment_title: assignmentMap.get(sub.assignment_id) || 'Assignment',
                  submitted_at: sub.submitted_at,
                });
              }
            }
          }
        }
      }

      setStats({
        totalPupils,
        activePupils: totalPupils,
        pendingReviews,
        completedAssignments,
        totalClasses,
      });
      setRecentSubmissions(submissions);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setDataLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
          <p className="mt-4 text-sm text-[var(--wrife-text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--wrife-bg)" }}>
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
        <header className="mb-6 sm:mb-8 flex items-start justify-between">
          <div>
            <h1
              className="text-xl sm:text-2xl font-extrabold mb-1"
              style={{ color: "var(--wrife-text-main)" }}
            >
              Welcome, {user.display_name || 'Teacher'}
            </h1>
            <p
              className="text-xs sm:text-sm"
              style={{ color: "var(--wrife-text-muted)" }}
            >
              Quick view of your writing activity and progress
            </p>
          </div>
          <Link href="/dashboard/help">
            <button className="rounded-full border border-[var(--wrife-border)] px-4 py-2 text-sm font-semibold text-[var(--wrife-text-muted)] hover:bg-gray-50 transition">
              ? Help
            </button>
          </Link>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <MetricCard
            label="Total Classes"
            value={dataLoading ? "..." : stats.totalClasses.toString()}
            tone="blue"
          />
          <MetricCard
            label="Total Pupils"
            value={dataLoading ? "..." : stats.totalPupils.toString()}
            tone="green"
          />
          <MetricCard
            label="Pending Reviews"
            value={dataLoading ? "..." : stats.pendingReviews.toString()}
            tone="yellow"
          />
          <MetricCard
            label="Completed"
            value={dataLoading ? "..." : stats.completedAssignments.toString()}
            tone="coral"
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div
            className="lg:col-span-2 rounded-2xl p-4 sm:p-6"
            style={{
              backgroundColor: "var(--wrife-surface)",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
              border: "1px solid var(--wrife-border)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-base sm:text-lg font-bold"
                style={{ color: "var(--wrife-text-main)" }}
              >
                Quick Actions
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link href="/classes">
                <div className="p-4 rounded-xl border border-[var(--wrife-border)] hover:bg-gray-50 transition cursor-pointer">
                  <div className="text-2xl mb-2">📚</div>
                  <h3 className="font-semibold text-[var(--wrife-text-main)]">My Classes</h3>
                  <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
                    View and manage your classes
                  </p>
                </div>
              </Link>
              <Link href="/">
                <div className="p-4 rounded-xl border border-[var(--wrife-border)] hover:bg-gray-50 transition cursor-pointer">
                  <div className="text-2xl mb-2">📖</div>
                  <h3 className="font-semibold text-[var(--wrife-text-main)]">Lesson Library</h3>
                  <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
                    Browse 67 writing lessons
                  </p>
                </div>
              </Link>
              <Link href="/classes/new">
                <div className="p-4 rounded-xl border border-[var(--wrife-border)] hover:bg-gray-50 transition cursor-pointer">
                  <div className="text-2xl mb-2">➕</div>
                  <h3 className="font-semibold text-[var(--wrife-text-main)]">Create Class</h3>
                  <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
                    Set up a new class with a code
                  </p>
                </div>
              </Link>
              <Link href="/dashboard/help">
                <div className="p-4 rounded-xl border border-[var(--wrife-border)] hover:bg-gray-50 transition cursor-pointer">
                  <div className="text-2xl mb-2">❓</div>
                  <h3 className="font-semibold text-[var(--wrife-text-main)]">Help Guide</h3>
                  <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
                    Learn how to use WriFe
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <div
            className="rounded-2xl p-4 sm:p-6"
            style={{
              backgroundColor: "var(--wrife-surface)",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
              border: "1px solid var(--wrife-border)",
            }}
          >
            <h2
              className="text-base sm:text-lg font-bold mb-3 sm:mb-4"
              style={{ color: "var(--wrife-text-main)" }}
            >
              Recent Submissions
            </h2>
            {dataLoading ? (
              <div className="flex justify-center py-8">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
              </div>
            ) : recentSubmissions.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-[var(--wrife-text-muted)]">
                  No submissions yet
                </p>
                <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
                  Assign lessons to classes to get started
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {recentSubmissions.map((sub, index) => (
                  <li
                    key={sub.id}
                    className="text-sm pb-3"
                    style={{
                      color: "var(--wrife-text-main)",
                      borderBottom: index < recentSubmissions.length - 1 ? "1px solid var(--wrife-border)" : "none",
                    }}
                  >
                    <span className="font-medium">{sub.pupil_name}</span>
                    <span style={{ color: "var(--wrife-text-muted)" }}> — {sub.assignment_title}</span>
                    <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
                      {new Date(sub.submitted_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
