import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface AppUser {
  id: string;
  email?: string;
  fullName?: string;
  phone?: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  supabaseUser: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; success: boolean }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null; success: boolean; confirmationRequired?: boolean }>;
  signInAsGuest: (guestName?: string) => void;
  signOut: () => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_STORAGE_KEY = 'as_realty_guest_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [guestUser, setGuestUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session and auth state listener
  useEffect(() => {
    // Check for saved guest user
    try {
      const savedGuest = localStorage.getItem(GUEST_STORAGE_KEY);
      if (savedGuest) {
        setGuestUser(JSON.parse(savedGuest));
      }
    } catch (_) {
      // Ignore localStorage parse errors
    }

    // Get active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      setIsLoading(false);
    }).catch((err) => {
      console.info('[Supabase Auth] Session fetch note:', err?.message);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        // If logged in via Supabase, clear guest state
        setGuestUser(null);
        localStorage.removeItem(GUEST_STORAGE_KEY);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { error, success: false };
      }

      setSession(data.session);
      setSupabaseUser(data.user);
      setGuestUser(null);
      localStorage.removeItem(GUEST_STORAGE_KEY);
      setIsLoading(false);
      return { error: null, success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { error: err as AuthError, success: false };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { error, success: false };
      }

      const confirmationRequired = !data.session && !!data.user;
      if (data.session) {
        setSession(data.session);
        setSupabaseUser(data.user);
        setGuestUser(null);
        localStorage.removeItem(GUEST_STORAGE_KEY);
      }

      setIsLoading(false);
      return { error: null, success: true, confirmationRequired };
    } catch (err: any) {
      setIsLoading(false);
      return { error: err as AuthError, success: false };
    }
  };

  const signInAsGuest = (guestName = 'VIP Guest') => {
    const guest: AppUser = {
      id: `guest_${Date.now()}`,
      fullName: guestName,
      email: 'guest@asrealtynagpur.com',
      isGuest: true,
    };
    setGuestUser(guest);
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guest));
    } catch (_) {}
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (_) {}
    setSession(null);
    setSupabaseUser(null);
    setGuestUser(null);
    localStorage.removeItem(GUEST_STORAGE_KEY);
    setIsLoading(false);
  };

  // Resolve current active user representation
  const currentUser: AppUser | null = supabaseUser
    ? {
        id: supabaseUser.id,
        email: supabaseUser.email,
        fullName:
          supabaseUser.user_metadata?.full_name ||
          supabaseUser.user_metadata?.name ||
          supabaseUser.email?.split('@')[0] ||
          'Client',
        isGuest: false,
      }
    : guestUser;

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        supabaseUser,
        session,
        isLoading,
        signIn,
        signUp,
        signInAsGuest,
        signOut,
        isConfigured: true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
