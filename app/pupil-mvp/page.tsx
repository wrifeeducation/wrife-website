'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function PupilLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = useMemo(() => createClient(), []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('role', 'pupil')
        .single();

      if (fetchError || !data) {
        setError('Pupil not found. Check your email.');
        setLoading(false);
        return;
      }

      sessionStorage.setItem('pupilId', data.id);
      sessionStorage.setItem('pupilName', data.display_name || data.email);

      router.push('/pupil-mvp/lesson-select');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          WriFe PWP
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Progressive Writing Practice
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your.name@test.com"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Logging in...' : 'Start PWP'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            Test: Use any pupil email from your class
          </p>
        </div>
      </div>
    </div>
  );
}
