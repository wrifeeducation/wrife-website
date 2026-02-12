'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from './supabase';

interface User {
  id: string;
  email: string;
  role: string;
  display_name?: string;
  school_id?: string;
  membership_tier?: string;
  school_tier?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, displayName: string, emailRedirectTo?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  getDashboardPath: () => string;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  getDashboardPath: () => '/login',
  refreshProfile: async () => {},
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
        fetchUserProfile(session.user.id, session.user.email);
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
        fetchUserProfile(session.user.id, session.user.email);
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

  async function fetchUserProfile(userId: string, email?: string) {
    console.log('[AuthContext] Fetching profile for user:', userId);
    
    try {
      let url = `/api/auth/profile?userId=${userId}`;
      if (email) {
        url += `&email=${encodeURIComponent(email)}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('[AuthContext] Profile API response:', data);
      
      if (data.profile) {
        setUser({
          id: data.profile.id,
          email: data.profile.email,
          role: data.profile.role,
          display_name: data.profile.display_name,
          school_id: data.profile.school_id,
          membership_tier: data.profile.membership_tier || 'free',
          school_tier: data.profile.school_tier || null,
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

  async function signUp(email: string, password: string, displayName: string, emailRedirectTo?: string) {
    if (!supabaseClient) return { error: new Error('Client not initialized') };
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
        ...(emailRedirectTo ? { emailRedirectTo } : {}),
      },
    });

    if (!error && data.user) {
      try {
        const response = await fetch('/api/auth/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.user.id,
            email: email,
            display_name: displayName,
            role: 'teacher',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[AuthContext] Error creating profile:', errorData.error);
        } else {
          console.log('[AuthContext] Profile created successfully');
        }
      } catch (err) {
        console.error('[AuthContext] Error calling profile API:', err);
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

  async function refreshProfile(): Promise<void> {
    if (!user) {
      console.log('[AuthContext] refreshProfile called but no user');
      return;
    }
    
    console.log('[AuthContext] Refreshing profile for user:', user.id);
    await fetchUserProfile(user.id, user.email);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, getDashboardPath, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
