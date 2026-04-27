'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

const NC_EXPECTATIONS: Record<number, { min: number; max: number; label: string }> = {
  1: { min: 1,  max: 10, label: 'Tiers 1–2: Word & phrase building' },
  2: { min: 11, max: 17, label: 'Tier 3: Basic sentence writing' },
  3: { min: 18, max: 24, label: 'Tier 4: Conjunctions & expansion' },
  4: { min: 25, max: 28, label: 'Tier 5: Sequencing & cohesion' },
  5: { min: 29, max: 33, label: 'Tier 6: Story structure' },
  6: { min: 34, max: 40, label: 'Tiers 7–8: Complex sentences & extended writing' },
};

const JUDGEMENT_STYLES = {
  above:        { badge: 'bg-green-100 text-green-800 border border-green-200',     bar: 'bg-green-500',  label: 'Above expectation' },
  at:           { badge: 'bg-blue-100 text-blue-800 border border-blue-200',         bar: 'bg-blue-500',   label: 'Working at expectation' },
  below:        { badge: 'bg-red-100 text-red-800 border border-red-200',            bar: 'bg-red-400',    label: 'Below expectation' },
  not_assessed: { badge: 'bg-gray-100 text-gray-500 border border-gray-200',         bar: 'bg-gray-300',   label: 'Not assessed' },
};

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<{ classData: any; reportData: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [view, setView] = useState<'class' | 'individual'>('class');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/classes/${resolvedParams.id}/report`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, resolvedParams.id]);

  async function downloadWord() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/classes/${resolvedParams.id}/report?format=docx`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `WriFe-Progress-Report-${data?.classData?.name || 'Class'}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not generate Word document. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  const termLabel = (() => {
    const m = new Date().getMonth();
    if (m >= 8) return 'Autumn Term';
    if (m >= 3) return 'Summer Term';
    return 'Spring Term';
  })();

  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Could not load report data.</p>
      </div>
    );
  }

  const { classData, reportData } = data;
  const counts = { above: 0, at: 0, below: 0, not_assessed: 0 };
  for (const rd of reportData) counts[rd.judgement as keyof typeof counts]++;

  return (
    <>
      {/* ── Action bar (hidden when printing) ── */}
      <div className="no-print bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href={`/classes/${resolvedParams.id}?tab=progress`} className="text-sm text-blue-600 hover:underline">
            ← Back to class
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => setView('class')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${view === 'class' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              Class overview
            </button>
            <button
              onClick={() => setView('individual')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${view === 'individual' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              Individual pupils
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadWord}
            disabled={downloading}
            className="px-4 py-1.5 rounded-full text-sm font-semibold border border-blue-300 text-blue-700 hover:bg-blue-50 transition disabled:opacity-50"
          >
            {downloading ? 'Generating…' : '⬇ Download Word'}
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            🖨 Print / Save PDF
          </button>
        </div>
      </div>

      {/* ── Report content ── */}
      <div className="report-page bg-white min-h-screen px-12 py-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between pb-5 mb-8" style={{ borderBottom: '3px solid #2E5AFF' }}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">W</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Writing Progress Report</h1>
                <p className="text-sm text-gray-500">National Curriculum KS1 &amp; KS2</p>
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p className="font-semibold text-gray-900 text-base">{classData.name} — Year {classData.year_group}</p>
            <p>{classData.teacher_name || classData.teacher_email}</p>
            <p>{termLabel} {new Date().getFullYear()} &nbsp;·&nbsp; {today}</p>
          </div>
        </div>

        {/* ── CLASS OVERVIEW VIEW ── */}
        {view === 'class' && (
          <>
            {/* Summary tiles */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Pupils assessed', value: reportData.length, color: 'bg-gray-50 border-gray-200' },
                { label: 'Above expectation', value: counts.above, color: 'bg-green-50 border-green-200' },
                { label: 'Working at expectation', value: counts.at, color: 'bg-blue-50 border-blue-200' },
                { label: 'Below expectation', value: counts.below, color: 'bg-red-50 border-red-200' },
              ].map(tile => (
                <div key={tile.label} className={`rounded-xl border p-4 text-center ${tile.color}`}>
                  <p className="text-3xl font-bold text-gray-900">{tile.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{tile.label}</p>
                </div>
              ))}
            </div>

            {/* NC Level map */}
            <div className="mb-8">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">NC level mapping — DWP</h2>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(NC_EXPECTATIONS).map(([yr, exp]) => (
                  <div key={yr} className="border border-gray-200 rounded-lg px-3 py-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-900">Year {yr}</span>
                      <span className="text-xs font-semibold text-blue-700">L{exp.min}–{exp.max}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{exp.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Class table */}
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">All pupils</h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Pupil</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700">Year</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700">DWP level</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700">DWP avg %</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700">PWP band</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700">Writing</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700">Judgement</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((rd: any) => {
                  const js = JUDGEMENT_STYLES[rd.judgement as keyof typeof JUDGEMENT_STYLES];
                  return (
                    <tr key={rd.pupil.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-medium text-gray-900">{rd.pupil.name}</td>
                      <td className="text-center py-2.5 px-2 text-gray-600">Y{rd.pupil.year_group}</td>
                      <td className="text-center py-2.5 px-2 text-gray-700">
                        {rd.dwp.highestLevelPassed ? `L${rd.dwp.highestLevelPassed}` : '–'}
                      </td>
                      <td className="text-center py-2.5 px-2 text-gray-600">
                        {rd.dwp.avgPct !== null ? `${rd.dwp.avgPct}%` : '–'}
                      </td>
                      <td className="text-center py-2.5 px-2 text-gray-600">{rd.pwp.bandLabel}</td>
                      <td className="text-center py-2.5 px-2 text-gray-600">
                        {rd.writing.total > 0 ? `${rd.writing.submitted}/${rd.writing.total}` : '–'}
                      </td>
                      <td className="text-center py-2.5 px-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${js.badge}`}>
                          {js.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {/* ── INDIVIDUAL VIEW ── */}
        {view === 'individual' && (
          <div className="space-y-10">
            {reportData.map((rd: any, idx: number) => {
              const js = JUDGEMENT_STYLES[rd.judgement as keyof typeof JUDGEMENT_STYLES];
              const exp = NC_EXPECTATIONS[rd.pupil.year_group];
              return (
                <div key={rd.pupil.id} className={`${idx > 0 ? 'page-break-before' : ''}`}>
                  {/* Pupil header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{rd.pupil.name}</h2>
                      <p className="text-sm text-gray-500">Year {rd.pupil.year_group}</p>
                    </div>
                    <span className={`text-sm font-bold px-4 py-1.5 rounded-full ${js.badge}`}>
                      {js.label}
                    </span>
                  </div>

                  {/* Three pillars */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="border border-blue-200 bg-blue-50 rounded-lg p-3">
                      <p className="text-xs font-bold text-blue-700 mb-2">Daily Writing (DWP)</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {rd.dwp.highestLevelPassed ? `Level ${rd.dwp.highestLevelPassed}` : 'Not started'}
                      </p>
                      {rd.dwp.levelInfo && <p className="text-xs text-gray-500 mt-0.5">{rd.dwp.levelInfo.activity_name}</p>}
                      <p className="text-xs text-gray-500 mt-1">
                        {rd.dwp.attempts} attempts · {rd.dwp.passedCount} passed
                        {rd.dwp.avgPct !== null ? ` · ${rd.dwp.avgPct}% avg` : ''}
                      </p>
                    </div>
                    <div className="border border-purple-200 bg-purple-50 rounded-lg p-3">
                      <p className="text-xs font-bold text-purple-700 mb-2">Sentence Practice (PWP)</p>
                      <p className="text-sm font-semibold text-gray-900">{rd.pwp.bandLabel}</p>
                      {rd.pwp.highestLevel && <p className="text-xs text-gray-500 mt-0.5">PWP Level {rd.pwp.highestLevel}</p>}
                      <p className="text-xs text-gray-500 mt-1">{rd.pwp.submittedCount} activities submitted</p>
                    </div>
                    <div className="border border-green-200 bg-green-50 rounded-lg p-3">
                      <p className="text-xs font-bold text-green-700 mb-2">Written Assignments</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {rd.writing.total > 0 ? `${rd.writing.submitted} of ${rd.writing.total}` : 'None set'}
                      </p>
                      {rd.writing.reviewed > 0 && <p className="text-xs text-gray-500 mt-0.5">{rd.writing.reviewed} reviewed</p>}
                    </div>
                  </div>

                  {/* NC expectation banner */}
                  {exp && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mb-4 flex items-center justify-between text-xs">
                      <span className="text-gray-600">Year {rd.pupil.year_group} expectation:</span>
                      <span className="font-semibold text-gray-800">DWP Levels {exp.min}–{exp.max} &nbsp;·&nbsp; {exp.label}</span>
                    </div>
                  )}

                  {/* NC objectives checklist */}
                  <div className="mb-5">
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                      Year {rd.pupil.year_group} NC writing objectives
                    </h3>
                    <div className="space-y-1">
                      {(rd.ncObjectives as string[]).map((obj: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 text-sm border border-gray-100 rounded-lg px-3 py-2">
                          <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded border border-gray-300 bg-white"></span>
                          <span className="text-gray-700">{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Teacher notes lines */}
                  <div className="mb-3">
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Teacher notes &amp; next steps</h3>
                    <div className="space-y-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="border-b border-gray-200 h-8" />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-400">
          <span>WriFe Education · wrife.co.uk</span>
          <span>{classData.name} · Year {classData.year_group} · {termLabel} {new Date().getFullYear()}</span>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .report-page { padding: 0 !important; max-width: 100% !important; }
          .page-break-before { page-break-before: always; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </>
  );
}
