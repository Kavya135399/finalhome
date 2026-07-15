import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';
import type { Role } from '../types';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, role: Role) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const LOCAL_USERS_KEY = 'homeseva.localUsers';
const LOCAL_CURRENT_USER_KEY = 'homeseva.currentUser';

interface LocalStoredUser extends AuthUser {
  password: string;
}

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

function readLocalUsers(): LocalStoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) ?? '[]') as LocalStoredUser[];
  } catch {
    return [];
  }
}

function writeLocalUsers(users: LocalStoredUser[]) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
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

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      const normalizedEmail = email.trim().toLowerCase();
      const foundUser = readLocalUsers().find((u) => u.email === normalizedEmail && u.password === password);
      if (!foundUser) throw new Error('Invalid email or password');
      const { password: _password, ...authUser } = foundUser;
      setLocalUser(authUser);
      saveCurrentLocalUser(authUser);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (name: string, email: string, password: string, role: Role) => {
    if (!isSupabaseConfigured) {
      const normalizedEmail = email.trim().toLowerCase();
      const users = readLocalUsers();
      if (users.some((u) => u.email === normalizedEmail)) {
        throw new Error('An account with this email already exists');
      }

      users.push({
        id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `local-${Date.now()}`,
        email: normalizedEmail,
        name: name.trim(),
        role,
        password,
      });
      writeLocalUsers(users);
      return;
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
      return;
    }

    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      const normalizedEmail = email.trim().toLowerCase();
      const exists = readLocalUsers().some((u) => u.email === normalizedEmail);
      if (!exists) throw new Error('No local account found for this email');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
