'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const AuthContext = createContext<any>({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (data) setProfile(data);
    } catch {
      // profile fetch failed silently
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Email/Password Sign Up
  const signUp = async (email: string, password: string, metadata: any = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata?.fullName || '',
          role: metadata?.role || 'site_engineer',
          organisation: metadata?.organisation || 'NHAI — Delhi Region',
          department: metadata?.department || '',
          employee_id: metadata?.employeeId || '',
          phone: metadata?.phone || '',
          avatar_url: metadata?.avatarUrl || ''
        },
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`
      }
    });
    if (error) throw error;
    return data;
  };

  // Email/Password Sign In
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    if (data.user) {
      await fetchProfile(data.user.id);
      // Log sign-in to audit_log
      try {
        await supabase.from('audit_log').insert({
          user_id: data.user.id,
          user_name: data.user.user_metadata?.full_name || email,
          user_role: data.user.user_metadata?.role || 'site_engineer',
          action: 'User Login',
          category: 'auth',
          severity: 'info',
          resource: 'Auth System',
          ip_address: '',
          details: 'Successful login via password'
        });
      } catch { /* audit log failure is non-critical */ }
    }
    return data;
  };

  // Sign Out
  const signOut = async () => {
    if (user) {
      try {
        await supabase.from('audit_log').insert({
          user_id: user.id,
          user_name: user.user_metadata?.full_name || user.email,
          user_role: user.user_metadata?.role || 'site_engineer',
          action: 'User Logout',
          category: 'auth',
          severity: 'info',
          resource: 'Auth System',
          ip_address: '',
          details: 'Session ended by user'
        });
      } catch { /* non-critical */ }
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
    // Clear demo sector on logout
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('kartaa_demo_sector');
    }
    router.push('/about');
  };

  // Get Current User
  const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  };

  // Check if Email is Verified
  const isEmailVerified = () => {
    return user?.email_confirmed_at !== null;
  };

  // Get User Profile from Database
  const getUserProfile = async () => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) throw error;
    setProfile(data);
    return data;
  };

  // Update User Profile
  const updateProfile = async (updates: any) => {
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    setProfile(data);
    return data;
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    isEmailVerified,
    getUserProfile,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
