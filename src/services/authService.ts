import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  display_name: string;
  role: 'teacher' | 'student' | 'admin';
}

export const authService = {
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  async signIn(email: string, password: string):Promise<{ session: Session | null; user: User | null; error: Error | null }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { session: null, user: null, error: new Error('Supabase belum terkonfigurasi.') };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { session: null, user: null, error: new Error(error.message) };
      }

      return { session: data.session, user: data.user, error: null };
    } catch (err: any) {
      return { session: null, user: null, error: new Error(err?.message || 'Gagal masuk akun guru.') };
    }
  },

  async signOut(): Promise<{ error: Error | null }> {
    const supabase = getSupabase();
    if (!supabase) return { error: null };

    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { error: new Error(err?.message || 'Gagal keluar.') };
    }
  },

  async getSession(): Promise<Session | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch {
      return null;
    }
  },

  async getUser(): Promise<User | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch {
      return null;
    }
  },

  async getProfile(): Promise<UserProfile | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const user = await this.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, role')
        .eq('id', user.id)
        .maybeSingle();

      if (error || !data) {
        return {
          id: user.id,
          display_name: user.user_metadata?.display_name || user.email || 'Guru Matematika',
          role: 'teacher',
        };
      }

      return data as UserProfile;
    } catch {
      return null;
    }
  },

  onAuthStateChange(callback: (session: Session | null) => void) {
    const supabase = getSupabase();
    if (!supabase) {
      return { unsubscribe: () => {} };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  },
};
