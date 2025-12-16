'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

interface User {
  id: string;
  email: string;
  role: string;
  display_name?: string;
  school_id?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  getDashboardPath: () => string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  getDashboardPath: () => '/login',
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthContext] Initializing, checking session...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthContext] getSession result:', session ? `User: ${session.user.id}` : 'No session');
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AuthContext] onAuthStateChange:', _event, session ? `User: ${session.user.id}` : 'No session');
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'school_admin') return '/admin/school';
    if (user.role === 'teacher') return '/dashboard';
    if (user.role === 'pupil') return '/pupil/dashboard';
    return '/dashboard';
  };

  async function fetchUserProfile(userId: string) {
    console.log('[AuthContext] Fetching profile for user:', userId);
    
    try {
      const response = await fetch(`/api/auth/profile?userId=${userId}`);
      const data = await response.json();
      
      console.log('[AuthContext] Profile API response:', data);
      
      if (data.profile) {
        setUser({
          id: data.profile.id,
          email: data.profile.email,
          role: data.profile.role,
          display_name: data.profile.display_name,
          school_id: data.profile.school_id,
        });
        console.log('[AuthContext] User set successfully:', data.profile.role);
      } else {
        console.log('[AuthContext] No profile found for user:', userId);
      }
    } catch (error) {
      console.error('[AuthContext] Error fetching profile:', error);
    }
    
    setLoading(false);
    console.log('[AuthContext] Loading set to false');
  }

  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('SignIn response:', { data, error });
      return { error };
    } catch (err) {
      console.error('SignIn exception:', err);
      return { error: err };
    }
  }

  async function signUp(email: string, password: string, displayName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    // If signup successful, create a profile entry
    if (!error && data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: email,
          display_name: displayName,
          role: 'teacher', // Default role for new signups
          school_id: null, // Can be assigned later by admin
        });
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    return { error };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, getDashboardPath }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
