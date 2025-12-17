'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

function detectSubjectType(subject: string): 'person' | 'animal' | 'place' | 'thing' {
  const capitalizedSubject = subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();
  
  const people = ['Ben', 'Mum', 'Teacher', 'James', 'Tom', 'Sam', 'Sarah', 'Maya', 'Emma'];
  const animals = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Lion', 'Elephant', 'Frog', 'Butterfly', 'Bear'];
  const places = ['Library', 'Park', 'School'];
  const things = ['Book', 'Car', 'Clock'];
  
  if (people.includes(capitalizedSubject)) return 'person';
  if (animals.includes(capitalizedSubject)) return 'animal';
  if (places.includes(capitalizedSubject)) return 'place';
  if (things.includes(capitalizedSubject)) return 'thing';
  
  return 'animal';
}

interface CurriculumData {
  lesson_number: number;
  lesson_name: string;
  subject_ideas: string[];
  subject_assignment_type: string;
}

function PWPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonNumber = searchParams?.get('lesson') ?? null;
  const supabase = useMemo(() => createClient(), []);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentFormula, setCurrentFormula] = useState<number>(1);
  const [formulas, setFormulas] = useState<any[]>([]);
  const [subject, setSubject] = useState('');
  const [pupilSentence, setPupilSentence] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [step, setStep] = useState<'setup' | 'practice' | 'complete'>('setup');
  const [curriculum, setCurriculum] = useState<CurriculumData | null>(null);

  useEffect(() => {
    if (!lessonNumber) {
      router.push('/pupil-mvp/lesson-select');
      return;
    }
    fetchCurriculum();
  }, [lessonNumber, router]);

  const fetchCurriculum = async () => {
    const { data } = await supabase
      .from('curriculum_map')
      .select('*')
      .eq('lesson_number', parseInt(lessonNumber!))
      .single();
    
    if (data) {
      setCurriculum(data);
    }
  };

  const startSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    
    setLoading(true);

    try {
      const pupilId = sessionStorage.getItem('pupilId');

      const response = await fetch('/api/pwp-mvp/start-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pupilId,
          lessonNumber: parseInt(lessonNumber!),
          subject: subject.trim(),
          subjectType: detectSubjectType(subject.trim()),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSessionId(data.sessionId);
        setFormulas(data.formulas);
        setStep('practice');
      } else {
        alert('Failed to start session: ' + data.error);
      }
    } catch (error) {
      alert('Error starting session');
    } finally {
      setLoading(false);
    }
  };

  const handleWordClick = (word: string) => {
    setPupilSentence(prev => prev + (prev ? ' ' : '') + word);
  };

  const submitFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pupilSentence.trim()) return;
    
    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/pwp-mvp/submit-formula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          formulaNumber: currentFormula,
          pupilSentence: pupilSentence.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setFeedback(data.feedback);

        if (data.isCorrect) {
          setTimeout(() => {
            if (data.nextFormula) {
              setCurrentFormula(currentFormula + 1);
              setPupilSentence('');
              setFeedback(null);
            } else {
              completeSession();
            }
          }, 2000);
        }
      }
    } catch (error) {
      alert('Error submitting formula');
    } finally {
      setLoading(false);
    }
  };

  const completeSession = async () => {
    try {
      await fetch('/api/pwp-mvp/complete-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      setStep('complete');
    } catch (error) {
      console.error('Error completing session');
    }
  };

  // SETUP SCREEN
  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">
            Lesson {lessonNumber} PWP
          </h1>
          <p className="text-center text-gray-600 mb-6">
            {curriculum?.lesson_name}
          </p>

          <form onSubmit={startSession} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose your subject for today:
              </label>
              
              {curriculum?.subject_ideas && curriculum.subject_ideas.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {curriculum.subject_ideas.slice(0, 6).map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => setSubject(idea)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                        subject === idea
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              )}

              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Or type your own..."
              />
            </div>

            <button
              type="submit"
              disabled={loading || !subject.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Starting...' : 'Start Practice'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // PRACTICE SCREEN
  if (step === 'practice') {
    const formula = formulas.find((f) => f.number === currentFormula);

    if (!formula) {
      return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-blue-50 p-4">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Formula {currentFormula} of {formulas.length}
              </span>
              <span className="text-sm text-gray-500">
                Subject: <strong>{subject}</strong>
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${((currentFormula - 1) / formulas.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Formula Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Formula {currentFormula}
            </h2>

            {/* Labelled Example */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-gray-600 mb-2">
                LABELLED EXAMPLE:
              </p>
              <p className="text-xl font-bold text-gray-800">
                {formula.example}
              </p>
            </div>

            {/* Word Bank */}
            {formula.wordBank && formula.wordBank.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Your words from before (click to add):
                </p>
                <div className="flex flex-wrap gap-2">
                  {formula.wordBank.map((word: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleWordClick(word)}
                      className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 font-medium border-2 border-yellow-300"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={submitFormula} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YOUR TURN - Write your complete sentence:
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Your sentence: <strong>{pupilSentence || '(empty)'}</strong>
                </p>
                <textarea
                  value={pupilSentence}
                  onChange={(e) => setPupilSentence(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  rows={2}
                  placeholder="Type your sentence here..."
                />
              </div>

              {/* Feedback */}
              {feedback && (
                <div
                  className={`p-4 rounded-lg ${
                    feedback.type === 'success'
                      ? 'bg-green-50 text-green-700 border-2 border-green-200'
                      : 'bg-red-50 text-red-700 border-2 border-red-200'
                  }`}
                >
                  <p className="font-medium">
                    {feedback.type === 'success' ? '✓ ' : '✗ '}
                    {feedback.message}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !pupilSentence.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Checking...' : 'Check Sentence'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // COMPLETE SCREEN
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          Well Done!
        </h1>
        <p className="text-gray-600 mb-6">
          You completed Lesson {lessonNumber} PWP!
        </p>
        <button
          onClick={() => router.push('/pupil-mvp/lesson-select')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Choose Another Lesson
        </button>
      </div>
    </div>
  );
}

export default function PWPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-blue-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <PWPContent />
    </Suspense>
  );
}
