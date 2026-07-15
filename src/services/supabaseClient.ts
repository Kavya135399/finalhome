import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured =
  typeof supabaseUrl === 'string' &&
  /^https?:\/\//.test(supabaseUrl) &&
  typeof supabaseAnonKey === 'string' &&
  supabaseAnonKey.length > 0;

function missingConfigError() {
  return new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}

const disabledSupabase = {
  auth: {
    getSession: async () => ({
      data: { session: null },
      error: null,
    }),
    onAuthStateChange: () => ({
      data: {
        subscription: {
          unsubscribe: () => undefined,
        },
      },
    }),
    signInWithPassword: async () => ({
      data: { user: null, session: null },
      error: missingConfigError(),
    }),
    signUp: async () => ({
      data: { user: null, session: null },
      error: missingConfigError(),
    }),
    signOut: async () => ({
      error: null,
    }),
    resetPasswordForEmail: async () => ({
      data: {},
      error: missingConfigError(),
    }),
  },
} as unknown as SupabaseClient;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : disabledSupabase;
