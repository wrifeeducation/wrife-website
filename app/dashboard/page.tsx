"use client";

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from "../../components/Navbar";
import OwlMascot from "@/components/mascots/OwlMascot";
import { supabase } from '@/lib/supabase';

interface RecentSubmission {
  id: number;
  pupil_name: string;
  assignment_title: string;
  submitted_at: string;
  banding_score?: number;
}

interface DashboardStats {
  totalPupils: number;
  activePupils: number;
  pendingReviews: number;
  completedAssignments: number;
  totalClasses: number;
  bandingBreakdown: {
    secure: number;
    greaterDepth: number;
    developing: number;
    emerging: number;
  };
}

function DonutChart({ data }: { data: { secure: number; greaterDepth: number; developing: number; emerging: number } }) {
  const total = data.secure + data.greaterDepth + data.developing + data.emerging;
  if (total === 0) {
    return (
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--wrife-border)" strokeWidth="3" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-[var(--wrife-text-muted)]">No data</span>
        </div>
      </div>
    );
  }

  const securePercent = (data.secure / total) * 100;
  const greaterDepthPercent = (data.greaterDepth / total) * 100;
  const developingPercent = (data.developing / total) * 100;
  const emergingPercent = (data.emerging / total) * 100;

  let offset = 0;
  const segments = [
    { percent: securePercent, color: 'var(--wrife-green)' },
    { percent: greaterDepthPercent, color: 'var(--wrife-blue)' },
    { percent: developingPercent, color: 'var(--wrife-yellow)' },
    { percent: emergingPercent, color: 'var(--wrife-coral)' },
  ];

  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        {segments.map((segment, i) => {
          const dashArray = `${segment.percent} ${100 - segment.percent}`;
          const currentOffset = offset;
          offset += segment.percent;
          return segment.percent > 0 ? (
            <circle
              key={i}
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke={segment.color}
              strokeWidth="3"
              strokeDasharray={dashArray}
              strokeDashoffset={-currentOffset}
            />
          ) : null;
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-[var(--wrife-text-main)]">{total}</span>
      </div>
    </div>
  );
}

function BandBadge({ score }: { score: number }) {
  const bands = [
    { label: 'Emerging', bg: 'bg-[var(--wrife-coral-soft)]', text: 'text-[var(--wrife-coral)]' },
    { label: 'Developing', bg: 'bg-[var(--wrife-yellow-soft)]', text: 'text-[var(--wrife-yellow)]' },
    { label: 'Secure', bg: 'bg-[var(--wrife-green-soft)]', text: 'text-[var(--wrife-green)]' },
    { label: 'Greater Depth', bg: 'bg-[var(--wrife-blue-soft)]', text: 'text-[var(--wrife-blue)]' },
  ];
  const band = bands[Math.min(score - 1, 3)] || bands[0];
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${band.bg} ${band.text}`}>
      {band.label}
    </span>
  );
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
    bandingBreakdown: { secure: 0, greaterDepth: 0, developing: 0, emerging: 0 },
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
      const bandingBreakdown = { secure: 0, greaterDepth: 0, developing: 0, emerging: 0 };

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

            const { data: assessments } = await supabase
              .from('ai_assessments')
              .select('submission_id, banding_score')
              .in('submission_id', submissionsData.map(s => s.id));

            const assessmentMap = new Map(assessments?.map(a => [a.submission_id, a.banding_score]) || []);

            assessments?.forEach(a => {
              if (a.banding_score === 4) bandingBreakdown.greaterDepth++;
              else if (a.banding_score === 3) bandingBreakdown.secure++;
              else if (a.banding_score === 2) bandingBreakdown.developing++;
              else if (a.banding_score === 1) bandingBreakdown.emerging++;
            });

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
                  banding_score: assessmentMap.get(sub.id),
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
        bandingBreakdown,
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
              style={{ color: "var(--wrife-text-main)", fontFamily: 'var(--font-display)' }}
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
          <div className="flex gap-3">
            <Link href="/">
              <button className="rounded-full bg-[var(--wrife-yellow)] px-5 py-2.5 text-sm font-bold text-[var(--wrife-text-main)] shadow-soft hover:opacity-90 transition">
                + Start New Assessment
              </button>
            </Link>
            <Link href="/dashboard/help">
              <button className="rounded-full border border-[var(--wrife-border)] px-4 py-2 text-sm font-semibold text-[var(--wrife-text-muted)] hover:bg-gray-50 transition">
                ? Help
              </button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div
            className="lg:col-span-2 rounded-2xl p-5 sm:p-6"
            style={{
              backgroundColor: "var(--wrife-surface)",
              boxShadow: "var(--shadow-card)",
              border: "1px solid var(--wrife-border)",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--wrife-text-main)", fontFamily: 'var(--font-display)' }}
              >
                Recent Assessments
              </h2>
              <Link href="/classes" className="text-sm text-[var(--wrife-blue)] font-semibold hover:underline">
                View all →
              </Link>
            </div>
            {dataLoading ? (
              <div className="flex justify-center py-8">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
              </div>
            ) : recentSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[var(--wrife-text-muted)]">
                  No assessments yet. Assign lessons to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--wrife-bg)] border border-[var(--wrife-border)]"
                  >
                    <div>
                      <p className="font-semibold text-[var(--wrife-text-main)]">{sub.pupil_name}</p>
                      <p className="text-xs text-[var(--wrife-text-muted)]">{sub.assignment_title}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {sub.banding_score && <BandBadge score={sub.banding_score} />}
                      <span className="text-xs text-[var(--wrife-text-muted)]">
                        {new Date(sub.submitted_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className="rounded-2xl p-5 sm:p-6"
            style={{
              backgroundColor: "var(--wrife-surface)",
              boxShadow: "var(--shadow-card)",
              border: "1px solid var(--wrife-border)",
            }}
          >
            <h2
              className="text-lg font-bold mb-4"
              style={{ color: "var(--wrife-text-main)", fontFamily: 'var(--font-display)' }}
            >
              Class Overview
            </h2>
            <div className="flex items-center justify-center gap-4">
              <DonutChart data={stats.bandingBreakdown} />
              <OwlMascot size="lg" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--wrife-green)]"></div>
                <span className="text-xs text-[var(--wrife-text-muted)]">Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--wrife-blue)]"></div>
                <span className="text-xs text-[var(--wrife-text-muted)]">Greater Depth</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--wrife-yellow)]"></div>
                <span className="text-xs text-[var(--wrife-text-muted)]">Developing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--wrife-coral)]"></div>
                <span className="text-xs text-[var(--wrife-text-muted)]">Emerging</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div
            className="lg:col-span-2 rounded-2xl p-4 sm:p-6"
            style={{
              backgroundColor: "var(--wrife-surface)",
              boxShadow: "var(--shadow-card)",
              border: "1px solid var(--wrife-border)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--wrife-text-main)", fontFamily: 'var(--font-display)' }}
              >
                Quick Actions
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link href="/classes">
                <div className="p-4 rounded-xl border border-[var(--wrife-border)] hover:bg-[var(--wrife-blue-soft)] transition cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-[var(--wrife-blue-soft)] flex items-center justify-center mb-2">
                    <span className="text-xl">📚</span>
                  </div>
                  <h3 className="font-semibold text-[var(--wrife-text-main)]">My Classes</h3>
                  <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
                    View and manage your classes
                  </p>
                </div>
              </Link>
              <Link href="/">
                <div className="p-4 rounded-xl border border-[var(--wrife-border)] hover:bg-[var(--wrife-yellow-soft)] transition cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-[var(--wrife-yellow-soft)] flex items-center justify-center mb-2">
                    <span className="text-xl">📖</span>
                  </div>
                  <h3 className="font-semibold text-[var(--wrife-text-main)]">Lesson Library</h3>
                  <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
                    Browse 67 writing lessons
                  </p>
                </div>
              </Link>
              <Link href="/classes/new">
                <div className="p-4 rounded-xl border border-[var(--wrife-border)] hover:bg-[var(--wrife-green-soft)] transition cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-[var(--wrife-green-soft)] flex items-center justify-center mb-2">
                    <span className="text-xl">➕</span>
                  </div>
                  <h3 className="font-semibold text-[var(--wrife-text-main)]">Create Class</h3>
                  <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
                    Set up a new class with a code
                  </p>
                </div>
              </Link>
              <Link href="/dashboard/help">
                <div className="p-4 rounded-xl border border-[var(--wrife-border)] hover:bg-[var(--wrife-coral-soft)] transition cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-[var(--wrife-coral-soft)] flex items-center justify-center mb-2">
                    <span className="text-xl">❓</span>
                  </div>
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
              backgroundColor: "var(--wrife-green-soft)",
              boxShadow: "var(--shadow-card)",
              border: "1px solid var(--wrife-green)",
            }}
          >
            <h2
              className="text-lg font-bold mb-4"
              style={{ color: "var(--wrife-text-main)", fontFamily: 'var(--font-display)' }}
            >
              Upcoming Lessons
            </h2>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 border border-[var(--wrife-border)]">
                <p className="font-semibold text-sm text-[var(--wrife-text-main)]">Lesson 1: Introduction</p>
                <p className="text-xs text-[var(--wrife-text-muted)]">Getting started with writing</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-[var(--wrife-border)]">
                <p className="font-semibold text-sm text-[var(--wrife-text-main)]">Lesson 2: Sentences</p>
                <p className="text-xs text-[var(--wrife-text-muted)]">Building strong sentences</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-[var(--wrife-border)]">
                <p className="font-semibold text-sm text-[var(--wrife-text-main)]">Lesson 3: Paragraphs</p>
                <p className="text-xs text-[var(--wrife-text-muted)]">Organising your ideas</p>
              </div>
            </div>
            <Link href="/" className="block mt-4 text-center text-sm text-[var(--wrife-blue)] font-semibold hover:underline">
              Browse all lessons →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
