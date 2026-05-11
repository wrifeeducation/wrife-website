'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { adminFetch } from '@/lib/admin-fetch';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

interface SchoolStats {
  teachers: User[];
  teacherCount: number;
  pupils: User[];
  pupilCount: number;
}

interface BulkResult {
  email: string;
  name: string;
  ok: boolean;
  message: string;
}

export default function SchoolUsersPage() {
  const router = useRouter();
  const params = useParams();
  const schoolId = params?.id as string || '';
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'teachers' | 'pupils'>('teachers');

  // Bulk CSV import state
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkResults, setBulkResults] = useState<BulkResult[]>([]);
  const [bulkRunning, setBulkRunning] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role !== 'admin' && user.role !== 'school_admin') {
        router.push('/dashboard');
        return;
      }
      fetchUsers();
    }
  }, [user, authLoading, router, schoolId]);

  async function fetchUsers() {
    try {
      const response = await adminFetch(`/api/admin/school-stats?schoolId=${schoolId}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setStats(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    // Skip header row if it looks like one
    const rows = lines[0]?.toLowerCase().includes('first') || lines[0]?.toLowerCase().includes('email')
      ? lines.slice(1)
      : lines;

    const parsed = rows.map(line => {
      // Support comma or tab delimited: first_name, last_name, email
      const cols = line.split(/,|\t/).map(c => c.trim().replace(/^"|"$/g, ''));
      return {
        firstName: cols[0] || '',
        lastName: cols[1] || '',
        email: cols[2] || '',
      };
    }).filter(r => r.email && r.email.includes('@'));

    if (parsed.length === 0) {
      alert('No valid rows found. Format: First Name, Last Name, Email');
      return;
    }

    if (!confirm(`Import ${parsed.length} teacher(s) for this school? A welcome email will be sent to each.`)) return;

    setBulkRunning(true);
    setBulkResults([]);
    const results: BulkResult[] = [];

    for (const row of parsed) {
      try {
        const res = await adminFetch('/api/admin/invite-teacher', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: row.email,
            firstName: row.firstName,
            lastName: row.lastName,
            schoolId,
          }),
        });
        const data = await res.json();
        results.push({
          email: row.email,
          name: [row.firstName, row.lastName].filter(Boolean).join(' '),
          ok: res.ok,
          message: data.message || data.error || '',
        });
      } catch {
        results.push({ email: row.email, name: [row.firstName, row.lastName].filter(Boolean).join(' '), ok: false, message: 'Network error' });
      }
      setBulkResults([...results]);
    }

    setBulkRunning(false);
    fetchUsers();
  }

  async function removeUser(userId: string, role: string) {
    if (!confirm(`Are you sure you want to remove this ${role}?`)) return;
    
    try {
      const response = await adminFetch('/api/admin/remove-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      fetchUsers();
    } catch (err) {
      console.error('Error removing user:', err);
      alert('Failed to remove user');
    }
  }

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--wrife-blue)]"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--wrife-bg)] py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-6">
            <Link href="/admin" className="text-sm text-[var(--wrife-blue)] hover:underline mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)]">Manage Users</h1>
            <p className="text-sm text-[var(--wrife-text-muted)] mt-1">
              View and manage teachers and pupils for this school
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] overflow-hidden">
            <div className="flex border-b border-[var(--wrife-border)]">
              <button
                onClick={() => setActiveTab('teachers')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                  activeTab === 'teachers'
                    ? 'text-[var(--wrife-blue)] border-b-2 border-[var(--wrife-blue)] bg-[var(--wrife-blue-soft)]'
                    : 'text-[var(--wrife-text-muted)] hover:bg-gray-50'
                }`}
              >
                Teachers ({stats?.teacherCount || 0})
              </button>
              <button
                onClick={() => setActiveTab('pupils')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                  activeTab === 'pupils'
                    ? 'text-[var(--wrife-blue)] border-b-2 border-[var(--wrife-blue)] bg-[var(--wrife-blue-soft)]'
                    : 'text-[var(--wrife-text-muted)] hover:bg-gray-50'
                }`}
              >
                Pupils ({stats?.pupilCount || 0})
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'teachers' && (
                <>
                  <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                    <h2 className="font-bold text-[var(--wrife-text-main)]">Teachers</h2>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => { setShowBulkImport(!showBulkImport); setBulkResults([]); }}
                        className="rounded-full border border-teal-500 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 transition"
                      >
                        📋 Bulk Import CSV
                      </button>
                      <Link href={`/admin/schools/${schoolId}/invite-teacher`}>
                        <button className="rounded-full bg-[var(--wrife-blue)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
                          + Invite Teacher
                        </button>
                      </Link>
                    </div>
                  </div>

                  {showBulkImport && (
                    <div className="mb-5 rounded-xl bg-teal-50 border border-teal-200 p-4 space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-teal-800 mb-1">Bulk Teacher Import</p>
                        <p className="text-xs text-teal-700">
                          Upload a CSV with columns: <strong>First Name, Last Name, Email</strong> (one teacher per row, include or omit a header row — both work).
                          A welcome email with a setup link will be sent to each teacher.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          ref={csvInputRef}
                          type="file"
                          accept=".csv,.txt"
                          onChange={handleBulkCsv}
                          className="hidden"
                        />
                        <button
                          onClick={() => csvInputRef.current?.click()}
                          disabled={bulkRunning}
                          className="rounded-full bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:opacity-90 transition disabled:opacity-50"
                        >
                          {bulkRunning ? '⏳ Importing…' : '⬆ Choose CSV File'}
                        </button>
                        <a
                          href="data:text/csv;charset=utf-8,First Name,Last Name,Email%0AJane,Smith,j.smith@school.co.uk%0AJohn,Doe,j.doe@school.co.uk"
                          download="teachers-template.csv"
                          className="text-xs text-teal-700 hover:underline"
                        >
                          Download template
                        </a>
                      </div>

                      {bulkResults.length > 0 && (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {bulkResults.map((r, i) => (
                            <div key={i} className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 ${r.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`}>
                              <span>{r.ok ? '✓' : '✕'}</span>
                              <span className="font-medium">{r.name || r.email}</span>
                              <span className="text-opacity-70">— {r.message}</span>
                            </div>
                          ))}
                          {bulkRunning && (
                            <p className="text-xs text-teal-600 px-3">Processing…</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {stats?.teachers.length === 0 ? (
                    <p className="text-center text-[var(--wrife-text-muted)] py-8">No teachers yet</p>
                  ) : (
                    <div className="space-y-3">
                      {stats?.teachers.map((teacher) => (
                        <div key={teacher.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-semibold text-[var(--wrife-text-main)]">
                              {teacher.display_name || `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || 'Unnamed'}
                            </p>
                            <p className="text-sm text-[var(--wrife-text-muted)]">{teacher.email}</p>
                          </div>
                          <button
                            onClick={() => removeUser(teacher.id, 'teacher')}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'pupils' && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-[var(--wrife-text-main)]">Pupils</h2>
                    <Link href={`/admin/schools/${schoolId}/add-pupil`}>
                      <button className="rounded-full bg-[var(--wrife-blue)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
                        + Add Pupil
                      </button>
                    </Link>
                  </div>
                  
                  {stats?.pupils.length === 0 ? (
                    <p className="text-center text-[var(--wrife-text-muted)] py-8">No pupils yet</p>
                  ) : (
                    <div className="space-y-3">
                      {stats?.pupils.map((pupil) => (
                        <div key={pupil.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-semibold text-[var(--wrife-text-main)]">
                              {pupil.display_name || `${pupil.first_name || ''} ${pupil.last_name || ''}`.trim() || 'Unnamed'}
                            </p>
                            <p className="text-sm text-[var(--wrife-text-muted)]">{pupil.email}</p>
                          </div>
                          <button
                            onClick={() => removeUser(pupil.id, 'pupil')}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
