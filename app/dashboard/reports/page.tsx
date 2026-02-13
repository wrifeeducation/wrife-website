"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface ClassData {
  id: number;
  name: string;
  year_group: number;
  pupil_count: number;
}

interface WeeklyReport {
  id: number;
  pupilId: string;
  pupilName: string;
  classId: number;
  weekStart: string;
  sentencesWritten: number;
  activitiesCompleted: number;
  masteryRate: number;
  averageScore: number;
  aiSummary: string;
  strengths: string[];
  areasForSupport: string[];
  interventionRecommendations: string[];
  interventionNeeded: boolean;
  createdAt: string;
}

interface InterventionAlert {
  pupilId: string;
  pupilName: string;
  className: string;
  alertType: 'low_engagement' | 'struggling' | 'intervention_needed';
  severity: 'high' | 'medium' | 'low';
  message: string;
  recommendations: string[];
  lastActive: string | null;
}

export default function ReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [alerts, setAlerts] = useState<InterventionAlert[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [weekStart, setWeekStart] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirectTo=/dashboard/reports');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchClasses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClassId) {
      fetchReports();
      fetchAlerts();
    }
  }, [selectedClassId]);

  async function fetchClasses() {
    try {
      const res = await fetch('/api/classes');
      const data = await res.json();
      if (data.classes) {
        setClasses(data.classes);
        if (data.classes.length > 0 && !selectedClassId) {
          setSelectedClassId(data.classes[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  }

  async function fetchReports() {
    if (!selectedClassId) return;
    setLoadingReports(true);
    setError('');
    try {
      const res = await fetch(`/api/teacher/weekly-reports?classId=${selectedClassId}`);
      const data = await res.json();
      if (res.ok) {
        setReports(data.reports || []);
        setWeekStart(data.weekStart || '');
      } else {
        setError(data.error || 'Failed to fetch reports');
      }
    } catch (err) {
      setError('Failed to fetch reports');
    } finally {
      setLoadingReports(false);
    }
  }

  async function fetchAlerts() {
    if (!selectedClassId) return;
    setLoadingAlerts(true);
    try {
      const res = await fetch(`/api/teacher/intervention-alerts?classId=${selectedClassId}`);
      const data = await res.json();
      if (res.ok) {
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoadingAlerts(false);
    }
  }

  async function handleGenerateReports() {
    if (!selectedClassId) return;
    setGenerating(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/teacher/weekly-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: parseInt(selectedClassId) }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Successfully generated ${data.reportsGenerated} reports for this week.`);
        fetchReports();
        fetchAlerts();
      } else {
        setError(data.error || 'Failed to generate reports');
      }
    } catch (err) {
      setError('Failed to generate reports');
    } finally {
      setGenerating(false);
    }
  }

  function getSeverityStyles(severity: string) {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-300 text-red-800';
      case 'medium': return 'bg-amber-50 border-amber-300 text-amber-800';
      case 'low': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  }

  function getSeverityBadge(severity: string) {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'low': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  function getAlertIcon(alertType: string) {
    switch (alertType) {
      case 'intervention_needed': return '🚨';
      case 'low_engagement': return '📉';
      case 'struggling': return '⚠️';
      default: return '❗';
    }
  }

  function getAlertTypeLabel(alertType: string) {
    switch (alertType) {
      case 'intervention_needed': return 'Intervention Needed';
      case 'low_engagement': return 'Low Engagement';
      case 'struggling': return 'Struggling';
      default: return alertType;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)]">
              Weekly Progress Reports
            </h1>
            <p className="text-sm text-[var(--wrife-text-muted)]">
              AI-powered insights into your pupils&apos; writing progress
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="rounded-xl border border-[var(--wrife-border)] px-4 py-2 text-sm bg-white text-[var(--wrife-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
            >
              <option value="">Select a class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} (Year {cls.year_group})
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerateReports}
              disabled={!selectedClassId || generating}
              className="rounded-full bg-[var(--wrife-blue)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {generating ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                  Generating...
                </>
              ) : (
                "Generate This Week's Reports"
              )}
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
            <button onClick={() => setError('')} className="float-right font-bold">×</button>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            {successMsg}
            <button onClick={() => setSuccessMsg('')} className="float-right font-bold">×</button>
          </div>
        )}

        {!selectedClassId && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📊</p>
            <p className="text-lg font-semibold text-[var(--wrife-text-main)]">Select a class to view reports</p>
            <p className="text-sm text-[var(--wrife-text-muted)] mt-1">Choose a class from the dropdown above to see weekly progress reports and alerts.</p>
          </div>
        )}

        {selectedClassId && (
          <>
            {loadingAlerts ? (
              <div className="mb-6 flex justify-center py-4">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-amber-500 border-r-transparent"></div>
              </div>
            ) : alerts.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-3 flex items-center gap-2">
                  <span>🔔</span> Intervention Alerts
                  <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{alerts.length}</span>
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {alerts.map((alert, idx) => (
                    <div key={`${alert.pupilId}-${alert.alertType}-${idx}`} className={`rounded-xl border p-4 ${getSeverityStyles(alert.severity)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getAlertIcon(alert.alertType)}</span>
                          <div>
                            <p className="font-bold text-sm">{alert.pupilName}</p>
                            <p className="text-xs opacity-75">{alert.className}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getSeverityBadge(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                          <span className="text-xs opacity-60 bg-white/50 px-2 py-0.5 rounded-full">
                            {getAlertTypeLabel(alert.alertType)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{alert.message}</p>
                      {alert.recommendations.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-current/10">
                          <p className="text-xs font-semibold mb-1 opacity-75">Recommendations:</p>
                          <ul className="text-xs space-y-0.5">
                            {alert.recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="mt-0.5">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {alert.lastActive && (
                        <p className="text-xs mt-2 opacity-60">Last active: {alert.lastActive}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[var(--wrife-text-main)] flex items-center gap-2">
                  <span>📋</span> Weekly Reports
                  {weekStart && <span className="text-xs font-normal text-[var(--wrife-text-muted)]">Week of {weekStart}</span>}
                </h2>
              </div>

              {loadingReports ? (
                <div className="flex justify-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-[var(--wrife-border)]">
                  <p className="text-4xl mb-3">📝</p>
                  <p className="font-semibold text-[var(--wrife-text-main)]">No reports for this week yet</p>
                  <p className="text-sm text-[var(--wrife-text-muted)] mt-1 mb-4">
                    Click &quot;Generate This Week&apos;s Reports&quot; to create AI-powered progress reports for your pupils.
                  </p>
                  <button
                    onClick={handleGenerateReports}
                    disabled={generating}
                    className="rounded-full bg-[var(--wrife-blue)] px-6 py-2 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
                  >
                    {generating ? 'Generating...' : "Generate Reports"}
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {reports.map((report) => (
                    <div key={report.id} className="bg-white rounded-2xl border border-[var(--wrife-border)] shadow-sm overflow-hidden">
                      <div className={`px-4 py-3 flex items-center justify-between ${report.interventionNeeded ? 'bg-red-50 border-b border-red-200' : 'bg-[var(--wrife-blue-soft)] border-b border-[var(--wrife-border)]'}`}>
                        <h3 className="font-bold text-sm text-[var(--wrife-text-main)]">{report.pupilName}</h3>
                        {report.interventionNeeded && (
                          <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            ⚠️ Needs Support
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <p className="text-lg font-bold text-[var(--wrife-blue)]">{report.sentencesWritten}</p>
                            <p className="text-[10px] text-[var(--wrife-text-muted)]">Sessions</p>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded-lg">
                            <p className="text-lg font-bold text-green-600">{report.activitiesCompleted}</p>
                            <p className="text-[10px] text-[var(--wrife-text-muted)]">Activities</p>
                          </div>
                          <div className="text-center p-2 bg-purple-50 rounded-lg">
                            <p className="text-lg font-bold text-purple-600">{report.masteryRate}%</p>
                            <p className="text-[10px] text-[var(--wrife-text-muted)]">Mastery</p>
                          </div>
                        </div>

                        {report.aiSummary && (
                          <p className="text-xs text-[var(--wrife-text-muted)] mb-3 leading-relaxed">
                            {report.aiSummary}
                          </p>
                        )}

                        {report.strengths && report.strengths.length > 0 && (
                          <div className="mb-2">
                            <p className="text-[10px] font-semibold text-green-700 mb-1">Strengths</p>
                            <div className="flex flex-wrap gap-1">
                              {report.strengths.map((s, i) => (
                                <span key={i} className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {report.areasForSupport && report.areasForSupport.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold text-amber-700 mb-1">Areas for Support</p>
                            <div className="flex flex-wrap gap-1">
                              {report.areasForSupport.map((a, i) => (
                                <span key={i} className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                  {a}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
