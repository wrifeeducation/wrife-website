"use client";

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import MetricCard from "../../components/MetricCard";
import Navbar from "../../components/Navbar";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirectTo=/dashboard');
    }
  }, [user, loading, router]);

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
        <header className="mb-6 sm:mb-8">
          <h1
            className="text-xl sm:text-2xl font-extrabold mb-1"
            style={{ color: "var(--wrife-text-main)" }}
          >
            Year 4 Maple — Dashboard
          </h1>
          <p
            className="text-xs sm:text-sm"
            style={{ color: "var(--wrife-text-muted)" }}
          >
            Quick view of today's writing activity and progress
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <MetricCard
            label="PWP today"
            value="22 / 30"
            tone="blue"
          />
          <MetricCard
            label="Drafts awaiting review"
            value="5"
            tone="yellow"
          />
          <MetricCard
            label="Average score"
            value="2.8 / 4"
            tone="green"
          />
          <MetricCard
            label="Top skill gap"
            value="Cohesion"
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
            <h2
              className="text-base sm:text-lg font-bold mb-3 sm:mb-4"
              style={{ color: "var(--wrife-text-main)" }}
            >
              Class progress over time
            </h2>
            <div
              className="h-40 sm:h-48 flex items-center justify-center rounded-xl overflow-x-auto"
              style={{
                backgroundColor: "var(--wrife-bg)",
                border: "1px dashed var(--wrife-border)",
              }}
            >
              <p
                className="text-xs sm:text-sm"
                style={{ color: "var(--wrife-text-muted)" }}
              >
                (Chart will be added in future update)
              </p>
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
              Recent submissions
            </h2>
            <ul className="space-y-3">
              <li
                className="text-sm pb-3"
                style={{
                  color: "var(--wrife-text-main)",
                  borderBottom: "1px solid var(--wrife-border)",
                }}
              >
                <span className="font-medium">Amir</span>
                <span style={{ color: "var(--wrife-text-muted)" }}> — L41 Writing my first draft</span>
              </li>
              <li
                className="text-sm pb-3"
                style={{
                  color: "var(--wrife-text-main)",
                  borderBottom: "1px solid var(--wrife-border)",
                }}
              >
                <span className="font-medium">Sophie</span>
                <span style={{ color: "var(--wrife-text-muted)" }}> — L27a Paragraph structure</span>
              </li>
              <li
                className="text-sm"
                style={{ color: "var(--wrife-text-main)" }}
              >
                <span className="font-medium">James</span>
                <span style={{ color: "var(--wrife-text-muted)" }}> — L35 Story development</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
