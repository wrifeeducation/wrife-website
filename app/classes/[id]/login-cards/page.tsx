'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Class {
  id: string;
  name: string;
  year_group: number;
  class_code: string;
  school_name: string | null;
}

interface Pupil {
  id: string;
  first_name: string;
  last_name: string | null;
  year_group: number;
}

export default function LoginCardsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [classData, setClassData] = useState<Class | null>(null);
  const [pupils, setPupils] = useState<Pupil[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchClassData();
    fetchPupils();
  }, [user, resolvedParams.id, router]);

  async function fetchClassData() {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (error) throw error;
      setClassData(data);
    } catch (err) {
      console.error('Error fetching class:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPupils() {
    try {
      const { data: members, error } = await supabase
        .from('class_members')
        .select('pupil_id, pupils(*)')
        .eq('class_id', resolvedParams.id);

      if (error) throw error;

      const pupilsData = members?.map((m: any) => m.pupils).filter(Boolean) || [];
      pupilsData.sort((a: Pupil, b: Pupil) => {
        const nameA = `${a.first_name} ${a.last_name || ''}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name || ''}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
      setPupils(pupilsData);
    } catch (err) {
      console.error('Error fetching pupils:', err);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-800">Class not found</p>
          <Link href="/classes" className="text-sm text-blue-500 hover:underline mt-2 inline-block">
            Back to classes
          </Link>
        </div>
      </div>
    );
  }

  const loginUrl = 'wrife.co.uk/pupil/login';
  const fullLoginUrl = 'https://wrife.co.uk/pupil/login';

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-page {
            page-break-inside: avoid;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="no-print bg-gray-100 py-4 px-6 border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <Link href={`/classes/${resolvedParams.id}`} className="text-sm text-blue-500 hover:underline">
              Back to {classData.name}
            </Link>
            <h1 className="text-xl font-bold text-gray-800 mt-1">
              Pupil Login Cards - {classData.name}
            </h1>
            <p className="text-sm text-gray-500">{pupils.length} pupils</p>
          </div>
          <button
            onClick={handlePrint}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Cards
          </button>
        </div>
      </div>

      <div className="bg-white min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {pupils.map((pupil) => (
              <div
                key={pupil.id}
                className="print-page border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gradient-to-br from-blue-50 to-white"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                    {pupil.first_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      {pupil.first_name} {pupil.last_name || ''}
                    </p>
                    <p className="text-xs text-gray-500">{classData.name}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3">
                  <p className="text-xs text-gray-500 mb-1">Your Class Code:</p>
                  <p className="text-2xl font-mono font-bold text-blue-600 tracking-wider">
                    {classData.class_code}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Go to:</p>
                  <p className="text-sm font-semibold text-blue-600">{loginUrl}</p>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <ol className="text-xs text-gray-600 space-y-1">
                    <li>1. Go to <span className="font-semibold">{loginUrl}</span></li>
                    <li>2. Enter class code: <span className="font-mono font-bold">{classData.class_code}</span></li>
                    <li>3. Find and click your name</li>
                  </ol>
                </div>
              </div>
            ))}
          </div>

          {pupils.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No pupils in this class yet.</p>
              <Link 
                href={`/classes/${resolvedParams.id}`} 
                className="text-blue-500 hover:underline text-sm mt-2 inline-block"
              >
                Add pupils to generate login cards
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
