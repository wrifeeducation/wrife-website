'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function TeacherHelpPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
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
            <Link href="/dashboard" className="text-[var(--wrife-blue)] hover:underline text-sm">
              ← Back to Dashboard
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl">📖</span>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)]">Teacher's Guide</h1>
                <p className="text-sm text-[var(--wrife-text-muted)]">Getting started with WriFe</p>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-[var(--wrife-text-muted)] mb-6">
                Welcome to WriFe! This guide will help you set up your classes, add pupils, 
                and start using our 67-lesson writing curriculum.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">1️⃣</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">Creating Your First Class</h2>
                  <p className="text-[var(--wrife-text-muted)] mb-4">
                    Set up a class to organize your pupils and track their progress.
                  </p>
                  <div className="bg-[var(--wrife-bg)] rounded-lg p-4 space-y-2">
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Step 1:</strong> Go to the "Classes" page from the navigation</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Step 2:</strong> Click "Create New Class"</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Step 3:</strong> Enter a class name (e.g., "Year 4 Oak")</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Step 4:</strong> Select the year group (Years 2-6)</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Step 5:</strong> Click "Create Class" - you'll get a unique class code</p>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>Class Code:</strong> A unique 6-character code is generated for each class. Share this with parents so pupils can join.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">2️⃣</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">Adding Pupils to Your Class</h2>
                  <p className="text-[var(--wrife-text-muted)] mb-4">
                    There are two ways to add pupils to your class.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-[var(--wrife-bg)] rounded-lg p-4">
                      <p className="font-semibold text-[var(--wrife-text-main)] mb-2">Option A: Manual Entry</p>
                      <ul className="space-y-1 text-sm text-[var(--wrife-text-muted)]">
                        <li>• Open your class</li>
                        <li>• Click "Add Pupil"</li>
                        <li>• Enter pupil name</li>
                        <li>• Click "Add"</li>
                      </ul>
                    </div>
                    <div className="bg-[var(--wrife-bg)] rounded-lg p-4">
                      <p className="font-semibold text-[var(--wrife-text-main)] mb-2">Option B: Class Code</p>
                      <ul className="space-y-1 text-sm text-[var(--wrife-text-muted)]">
                        <li>• Share class code with parents</li>
                        <li>• Parents register pupil</li>
                        <li>• Pupil enters class code</li>
                        <li>• Pupil joins automatically</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">3️⃣</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">Browsing the Lesson Library</h2>
                  <p className="text-[var(--wrife-text-muted)] mb-4">
                    Access our complete 67-lesson writing curriculum.
                  </p>
                  <div className="bg-[var(--wrife-bg)] rounded-lg p-4 space-y-2">
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Curriculum:</strong> Click "Curriculum" in the navigation bar</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Filter:</strong> Filter by chapter, unit, or year group</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Search:</strong> Use the search bar to find specific lessons</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>View:</strong> Click any lesson card to see details and resources</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">4️⃣</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">Using Lesson Resources</h2>
                  <p className="text-[var(--wrife-text-muted)] mb-4">
                    Each lesson comes with comprehensive teaching materials.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="font-semibold text-blue-700 text-sm">Teacher Guide</p>
                      <p className="text-xs text-blue-600">Step-by-step instructions</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <p className="font-semibold text-green-700 text-sm">Presentation</p>
                      <p className="text-xs text-green-600">Classroom slides</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <p className="font-semibold text-yellow-700 text-sm">Interactive</p>
                      <p className="text-xs text-yellow-600">Practice activities</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <p className="font-semibold text-purple-700 text-sm">Worksheets</p>
                      <p className="text-xs text-purple-600">Printable exercises</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <p className="font-semibold text-orange-700 text-sm">Progress</p>
                      <p className="text-xs text-orange-600">Tracking sheets</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                      <p className="font-semibold text-red-700 text-sm">Assessment</p>
                      <p className="text-xs text-red-600">Evaluation tools</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">5️⃣</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">Managing Your Classes</h2>
                  <p className="text-[var(--wrife-text-muted)] mb-4">
                    Keep your classes organized and up to date.
                  </p>
                  <div className="bg-[var(--wrife-bg)] rounded-lg p-4 space-y-2">
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>View class:</strong> Click on any class to see its details</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Edit pupils:</strong> Add or remove pupils as needed</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Class code:</strong> Copy and share the code anytime</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Multiple classes:</strong> Create as many classes as you need</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💡</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">Tips for Success</h2>
                  <p className="text-[var(--wrife-text-muted)] mb-4">
                    Make the most of WriFe with these best practices.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm text-[var(--wrife-text-main)]">Set up your classes at the start of the term</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm text-[var(--wrife-text-main)]">Review lesson materials before teaching</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm text-[var(--wrife-text-main)]">Use the progress tracker to monitor pupil development</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm text-[var(--wrife-text-main)]">Follow the lesson sequence for best results</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm text-[var(--wrife-text-main)]">Adapt worksheets to your pupils' needs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-[var(--wrife-blue-soft)] rounded-2xl p-6 text-center">
            <p className="text-[var(--wrife-text-main)] mb-4">Need more help?</p>
            <p className="text-sm text-[var(--wrife-text-muted)]">
              Contact support at <span className="text-[var(--wrife-blue)]">support@wrife.com</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
