'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { adminFetch } from '@/lib/admin-fetch';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Registration {
  id: string;
  school_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  num_pupils: number | null;
  num_teachers: number | null;
  year_groups: string[];
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  school_id: string | null;
  admin_notes: string | null;
  created_at: string;
}

interface ApproveForm {
  name: string;
  domain: string;
  teacher_limit: number;
  pupil_limit: number;
  subscription_tier: string;
  admin_notes: string;
}

export default function AdminRegistrationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approveForm, setApproveForm] = useState<ApproveForm>({
    name: '', domain: '', teacher_limit: 10, pupil_limit: 300, subscription_tier: 'trial', admin_notes: '',
  });
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ id: string; ok: boolean; msg: string } | null>(null);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/admin/registrations?status=${statusFilter}`);
      const data = await res.json();
      setRegistrations(data.registrations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) { router.push('/admin/login'); return; }
      if (user.role !== 'admin') { router.push('/dashboard'); return; }
      fetchRegistrations();
    }
  }, [user, authLoading, router, fetchRegistrations]);

  function startApprove(reg: Registration) {
    setApprovingId(reg.id);
    setRejectId(null);
    setApproveForm({
      name: reg.school_name,
      domain: reg.website?.replace(/^https?:\/\//, '').split('/')[0] || '',
      teacher_limit: reg.num_teachers || 10,
      pupil_limit: reg.num_pupils || 300,
      subscription_tier: 'trial',
      admin_notes: '',
    });
    setExpandedId(reg.id);
  }

  async function handleApprove(id: string) {
    setSaving(true);
    try {
      const res = await adminFetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action: 'approve',
          admin_notes: approveForm.admin_notes,
          schoolData: {
            name: approveForm.name,
            domain: approveForm.domain,
            teacher_limit: approveForm.teacher_limit,
            pupil_limit: approveForm.pupil_limit,
            subscription_tier: approveForm.subscription_tier,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFeedback({ id, ok: true, msg: `School account created! → /admin/schools/${data.schoolId}` });
      setApprovingId(null);
      fetchRegistrations();
    } catch (err: any) {
      setFeedback({ id, ok: false, msg: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleReject(id: string) {
    setSaving(true);
    try {
      const res = await adminFetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'reject', admin_notes: rejectNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFeedback({ id, ok: true, msg: 'Registration rejected.' });
      setRejectId(null);
      fetchRegistrations();
    } catch (err: any) {
      setFeedback({ id, ok: false, msg: err.message });
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) return null;
  if (!user || user.role !== 'admin') return null;

  const pending = registrations.filter(r => r.status === 'pending').length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--wrife-bg)] py-8">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <Link href="/admin" className="text-sm text-[var(--wrife-blue)] hover:underline mb-1 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)]">
                School Registrations
                {pending > 0 && (
                  <span className="ml-2 text-sm font-bold bg-red-100 text-red-600 px-2.5 py-1 rounded-full">
                    {pending} pending
                  </span>
                )}
              </h1>
            </div>
            <a
              href="/school-register"
              target="_blank"
              className="rounded-full border border-[var(--wrife-blue)] px-4 py-2 text-sm font-semibold text-[var(--wrife-blue)] hover:bg-[var(--wrife-blue-soft)] transition"
            >
              View Public Form →
            </a>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition capitalize ${
                  statusFilter === f
                    ? f === 'pending' ? 'bg-yellow-500 text-white'
                    : f === 'approved' ? 'bg-green-500 text-white'
                    : f === 'rejected' ? 'bg-red-500 text-white'
                    : 'bg-[var(--wrife-blue)] text-white'
                    : 'bg-white border border-[var(--wrife-border)] text-[var(--wrife-text-muted)] hover:border-[var(--wrife-blue)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : registrations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[var(--wrife-border)] p-12 text-center">
              <p className="text-3xl mb-3">📬</p>
              <p className="font-bold text-[var(--wrife-text-main)]">
                No {statusFilter !== 'all' ? statusFilter : ''} registrations
              </p>
              <p className="text-sm text-[var(--wrife-text-muted)] mt-1">
                Share the registration link with schools to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {registrations.map(reg => (
                <div key={reg.id} className="bg-white rounded-2xl border border-[var(--wrife-border)] overflow-hidden">
                  {/* Summary row */}
                  <div
                    className="px-6 py-4 flex flex-wrap items-center gap-4 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => setExpandedId(expandedId === reg.id ? null : reg.id)}
                  >
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[var(--wrife-text-main)]">{reg.school_name}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          reg.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          reg.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {reg.status}
                        </span>
                        <span className="text-sm text-[var(--wrife-text-main)] transform transition-transform" style={{ display: 'inline-block', transform: expandedId === reg.id ? 'rotate(180deg)' : '' }}>▾</span>
                      </div>
                      <p className="text-sm text-[var(--wrife-text-muted)]">
                        {reg.contact_name} · {reg.email}
                      </p>
                    </div>
                    <div className="text-xs text-[var(--wrife-text-muted)]">
                      {reg.num_pupils ? `${reg.num_pupils} pupils` : ''}
                      {reg.num_teachers ? ` · ${reg.num_teachers} teachers` : ''}
                    </div>
                    <div className="text-xs text-[var(--wrife-text-muted)]">
                      {new Date(reg.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    {reg.status === 'pending' && (
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => startApprove(reg)}
                          className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 text-xs font-semibold hover:bg-green-100 transition"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => { setRejectId(reg.id); setRejectNotes(''); setApprovingId(null); setExpandedId(reg.id); }}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 transition"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                    {reg.status === 'approved' && reg.school_id && (
                      <Link
                        href={`/admin/schools/${reg.school_id}`}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-[var(--wrife-blue)] border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition"
                        onClick={e => e.stopPropagation()}
                      >
                        View School →
                      </Link>
                    )}
                  </div>

                  {/* Expanded details */}
                  {expandedId === reg.id && (
                    <div className="border-t border-[var(--wrife-border)] bg-gray-50 px-6 py-5 space-y-4">
                      {/* Info grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        {reg.phone && (
                          <div>
                            <p className="text-xs text-[var(--wrife-text-muted)]">Phone</p>
                            <p className="font-medium text-[var(--wrife-text-main)]">{reg.phone}</p>
                          </div>
                        )}
                        {reg.website && (
                          <div>
                            <p className="text-xs text-[var(--wrife-text-muted)]">Website</p>
                            <a href={reg.website} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--wrife-blue)] hover:underline">{reg.website}</a>
                          </div>
                        )}
                        {reg.year_groups?.length > 0 && (
                          <div>
                            <p className="text-xs text-[var(--wrife-text-muted)]">Year Groups</p>
                            <p className="font-medium text-[var(--wrife-text-main)]">{reg.year_groups.join(', ')}</p>
                          </div>
                        )}
                      </div>

                      {reg.message && (
                        <div>
                          <p className="text-xs text-[var(--wrife-text-muted)] mb-1">Message</p>
                          <p className="text-sm bg-white border border-[var(--wrife-border)] rounded-lg p-3 text-[var(--wrife-text-main)]">
                            {reg.message}
                          </p>
                        </div>
                      )}

                      {reg.admin_notes && (
                        <div>
                          <p className="text-xs text-[var(--wrife-text-muted)] mb-1">Admin Notes</p>
                          <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900">
                            {reg.admin_notes}
                          </p>
                        </div>
                      )}

                      {/* Feedback */}
                      {feedback?.id === reg.id && (
                        <div className={`rounded-xl p-3 text-sm font-medium ${feedback.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                          {feedback.msg}
                        </div>
                      )}

                      {/* Approve form */}
                      {approvingId === reg.id && reg.status === 'pending' && (
                        <div className="bg-white border border-green-200 rounded-xl p-5 space-y-4">
                          <h4 className="font-bold text-[var(--wrife-text-main)] text-sm">Create School Account</h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-[var(--wrife-text-main)] mb-1">School Name</label>
                              <input
                                type="text"
                                value={approveForm.name}
                                onChange={e => setApproveForm(p => ({ ...p, name: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-[var(--wrife-text-main)] mb-1">Domain</label>
                              <input
                                type="text"
                                value={approveForm.domain}
                                onChange={e => setApproveForm(p => ({ ...p, domain: e.target.value }))}
                                placeholder="stmarys.co.uk"
                                className="w-full px-3 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-[var(--wrife-text-main)] mb-1">Teacher Limit</label>
                              <input
                                type="number"
                                min="1"
                                value={approveForm.teacher_limit}
                                onChange={e => setApproveForm(p => ({ ...p, teacher_limit: parseInt(e.target.value) || 10 }))}
                                className="w-full px-3 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-[var(--wrife-text-main)] mb-1">Pupil Limit</label>
                              <input
                                type="number"
                                min="1"
                                value={approveForm.pupil_limit}
                                onChange={e => setApproveForm(p => ({ ...p, pupil_limit: parseInt(e.target.value) || 300 }))}
                                className="w-full px-3 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-[var(--wrife-text-main)] mb-1">Subscription Tier</label>
                              <select
                                value={approveForm.subscription_tier}
                                onChange={e => setApproveForm(p => ({ ...p, subscription_tier: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                              >
                                <option value="trial">Trial</option>
                                <option value="basic">Basic</option>
                                <option value="pro">Pro</option>
                                <option value="enterprise">Enterprise</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[var(--wrife-text-main)] mb-1">Admin Notes (optional)</label>
                            <textarea
                              rows={2}
                              value={approveForm.admin_notes}
                              onChange={e => setApproveForm(p => ({ ...p, admin_notes: e.target.value }))}
                              className="w-full px-3 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] resize-none"
                            />
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => handleApprove(reg.id)}
                              disabled={saving}
                              className="rounded-full bg-green-600 px-5 py-2 text-xs font-bold text-white hover:opacity-90 transition disabled:opacity-50"
                            >
                              {saving ? 'Creating…' : '✓ Create School Account'}
                            </button>
                            <button
                              onClick={() => setApprovingId(null)}
                              className="rounded-full border border-[var(--wrife-border)] px-5 py-2 text-xs font-semibold text-[var(--wrife-text-main)] hover:bg-gray-50 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Reject form */}
                      {rejectId === reg.id && reg.status === 'pending' && (
                        <div className="bg-white border border-red-200 rounded-xl p-5 space-y-3">
                          <h4 className="font-bold text-[var(--wrife-text-main)] text-sm">Reject Registration</h4>
                          <div>
                            <label className="block text-xs font-semibold text-[var(--wrife-text-main)] mb-1">Reason / Notes (optional)</label>
                            <textarea
                              rows={2}
                              value={rejectNotes}
                              onChange={e => setRejectNotes(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleReject(reg.id)}
                              disabled={saving}
                              className="rounded-full bg-red-600 px-5 py-2 text-xs font-bold text-white hover:opacity-90 transition disabled:opacity-50"
                            >
                              {saving ? 'Saving…' : 'Confirm Reject'}
                            </button>
                            <button
                              onClick={() => setRejectId(null)}
                              className="rounded-full border border-[var(--wrife-border)] px-5 py-2 text-xs font-semibold text-[var(--wrife-text-main)] hover:bg-gray-50 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
