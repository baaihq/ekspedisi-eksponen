import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let supabaseInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.trim().length > 0 &&
    supabaseAnonKey.trim().length > 0 &&
    !supabaseUrl.includes('your-project') &&
    !supabaseUrl.includes('localhost:54321_dummy')
  );
}

export function getSupabaseUrl(): string | undefined {
  return supabaseUrl;
}

export function getSupabaseHost(): string | null {
  if (!supabaseUrl) return null;
  try {
    const parsed = new URL(supabaseUrl.trim());
    return parsed.hostname;
  } catch {
    const match = supabaseUrl.trim().match(/https?:\/\/([^/:?\s]+)/);
    return match ? match[1] : null;
  }
}

export function validateSupabaseUrl(url?: string): { isValid: boolean; error?: string } {
  if (!url) {
    return {
      isValid: false,
      error: 'URL Supabase tidak valid. Gunakan format https://<project-ref>.supabase.co (tanpa /rest/v1/).',
    };
  }

  // URL tidak boleh berisi /rest/v1, tanda kutip, atau spasi
  if (url.includes('/rest/v1') || url.includes('"') || url.includes("'") || /\s/.test(url)) {
    return {
      isValid: false,
      error: 'URL Supabase tidak valid. Gunakan format https://<project-ref>.supabase.co (tanpa /rest/v1/).',
    };
  }

  const clean = url.trim().replace(/\/+$/, '');
  // URL harus diawali https:// dan berakhiran .supabase.co
  if (!clean.startsWith('https://') || !clean.endsWith('.supabase.co')) {
    return {
      isValid: false,
      error: 'URL Supabase tidak valid. Gunakan format https://<project-ref>.supabase.co (tanpa /rest/v1/).',
    };
  }

  return { isValid: true };
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseInstance && supabaseUrl && supabaseAnonKey) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      supabaseInstance = null;
    }
  }

  return supabaseInstance;
}
