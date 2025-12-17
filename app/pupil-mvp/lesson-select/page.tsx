'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';

interface Lesson {
  lesson_number: number;
  lesson_name: string;
  pwp_formula_count_min: number;
  pwp_formula_count_max: number;
  subject_assignment_type: string;
  subject_ideas: string[];
}

export default function LessonSelect() {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [pupilName, setPupilName] = useState('');
  const supabaseRef = useRef<SupabaseClient | null>(null);

  useEffect(() => {
    const init = async () => {
      const pupilId = sessionStorage.getItem('pupilId');
      const name = sessionStorage.getItem('pupilName');

      if (!pupilId) {
        router.push('/pupil-mvp');
        return;
      }

      setPupilName(name || '');
      
      const { createClient } = await import('@/lib/supabase');
      supabaseRef.current = createClient();
      
      const { data, error } = await supabaseRef.current
        .from('curriculum_map')
        .select('*')
        .gte('lesson_number', 10)
        .lte('lesson_number', 15)
        .order('lesson_number');

      if (!error && data) {
        setLessons(data);
      }
      setLoading(false);
    };
    
    init();
  }, [router]);

  const startLesson = (lessonNumber: number) => {
    router.push(`/pupil-mvp/pwp?lesson=${lessonNumber}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lessons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-blue-600">
            Welcome, {pupilName}!
          </h1>
          <p className="text-gray-600 mt-2">Choose a lesson to practice:</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <button
              key={lesson.lesson_number}
              onClick={() => startLesson(lesson.lesson_number)}
              className="bg-white rounded-lg shadow-lg p-6 text-left hover:shadow-xl transition-shadow hover:border-2 hover:border-blue-400"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold text-blue-600">
                  L{lesson.lesson_number}
                </span>
                <span className="text-sm text-gray-500">
                  {lesson.pwp_formula_count_min} formulas
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">
                {lesson.lesson_name}
              </h3>
              <p className="text-sm text-gray-600">
                {lesson.subject_assignment_type === 'given'
                  ? '📌 Subject assigned'
                  : '✏️ Choose your subject'}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
