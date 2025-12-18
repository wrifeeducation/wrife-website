'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from './supabase';

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
  const [supabaseClient, setSupabaseClient] = useState<any>(null);

  useEffect(() => {
    const client = createClient();
    setSupabaseClient(client);
    let isMounted = true;
    
    console.log('[AuthContext] Initializing, checking session...');
    client.auth.getSession().then(({ data: { session }, error }: any) => {
      if (!isMounted) return;
      
      if (error) {
        console.error('[AuthContext] getSession error:', error);
        if (error.code === 'refresh_token_not_found' || error.message?.includes('Refresh Token')) {
          console.log('[AuthContext] Invalid refresh token, clearing session...');
          client.auth.signOut();
          setUser(null);
          setLoading(false);
          return;
        }
      }
      console.log('[AuthContext] getSession result:', session ? `User: ${session.user.id}` : 'No session');
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch((err: any) => {
      if (!isMounted) return;
      console.error('[AuthContext] getSession exception:', err);
      setLoading(false);
    });

    const { data: { subscription } } = client.auth.onAuthStateChange(async (_event: any, session: any) => {
      if (!isMounted) return;
      console.log('[AuthContext] onAuthStateChange:', _event, session ? `User: ${session.user.id}` : 'No session');
      
      if (_event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else if (_event !== 'INITIAL_SESSION') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
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
    if (!supabaseClient) return { error: new Error('Client not initialized') };
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
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
    if (!supabaseClient) return { error: new Error('Client not initialized') };
    const { data, error } = await supabaseClient.auth.signUp({
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
      const { error: profileError } = await supabaseClient
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
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
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
