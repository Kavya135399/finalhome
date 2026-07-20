import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';
import { apiClient } from '../services/apiClient';
import type { Role } from '../types';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signUp: (name: string, email: string, password: string, role: Role) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (updatedUser: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const LOCAL_CURRENT_USER_KEY = 'homeseva.currentUser';

function mapUser(user: User | null): AuthUser | null {
  if (!user) return null;
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? '',
    name: meta.name ?? (user.email ? user.email.split('@')[0] : 'User'),
    role: (meta.role as Role) ?? 'customer',
  };
}

function readCurrentLocalUser(): AuthUser | null {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_CURRENT_USER_KEY) ?? 'null') as AuthUser | null;
  } catch {
    return null;
  }
}

function saveCurrentLocalUser(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [localUser, setLocalUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLocalUser(readCurrentLocalUser());
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const user = isSupabaseConfigured ? mapUser(session?.user ?? null) : localUser;

  const signIn = async (email: string, password: string): Promise<AuthUser> => {
    if (!isSupabaseConfigured) {
      try {
        const data = await apiClient.login(email, password);
        setLocalUser(data.user);
        saveCurrentLocalUser(data.user);
        localStorage.setItem('homeseva.token', data.token);
        return data.user;
      } catch (err: any) {
        let msg = err.response?.data?.error || err.message || 'Invalid email or password';
        if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
          msg = 'Network error: Unable to connect to the server. Please check your internet connection or try again later.';
        }
        throw new Error(msg);
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const mapped = mapUser(data.user);
    if (!mapped) throw new Error('User not found');
    return mapped;
  };

  const signUp = async (name: string, email: string, password: string, role: Role) => {
    if (!isSupabaseConfigured) {
      try {
        const data = await apiClient.register(name, email, password, role);
        setLocalUser(data.user);
        saveCurrentLocalUser(data.user);
        localStorage.setItem('homeseva.token', data.token);
        return;
      } catch (err: any) {
        let msg = err.response?.data?.error || err.message || 'Registration failed';
        if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
          msg = 'Network error: Unable to connect to the server. Please check your internet connection or try again later.';
        }
        throw new Error(msg);
      }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setLocalUser(null);
      saveCurrentLocalUser(null);
      localStorage.removeItem('homeseva.token');
      return;
    }

    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      // Mock local password reset
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const updateUser = (updated: Partial<AuthUser>) => {
    if (!isSupabaseConfigured) {
      setLocalUser((prev) => {
        if (!prev) return null;
        const next = { ...prev, ...updated };
        saveCurrentLocalUser(next);
        return next;
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, resetPassword, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
