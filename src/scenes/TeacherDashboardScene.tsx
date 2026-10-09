import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  KeyRound,
  CheckCircle2,
  Clock,
  Users,
  Zap,
  HelpCircle,
  Database,
  AlertCircle,
  Copy,
  Check,
  Lock,
  LogOut,
  Mail,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { syncService } from '../services/syncService';
import { TeacherSessionSummary, TeacherTeamSummary } from '../types/game';
import {
  isSupabaseConfigured,
  getSupabase,
  getSupabaseUrl,
  getSupabaseHost,
  validateSupabaseUrl,
} from '../services/supabaseClient';
import { authService, UserProfile } from '../services/authService';
import { settingsService } from '../services/settingsService';
import { formatPowerText } from '../lib/superscript';
import { MathView } from '../components/common/MathView';

interface TeacherDashboardSceneProps {
  onBackToGame: () => void;
}

function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard
      .writeText(text)
      .then(() => true)
      .catch(() => fallbackCopy(text));
  }
  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text: string): boolean {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

export const TeacherDashboardScene: React.FC<TeacherDashboardSceneProps> = ({
  onBackToGame,
}) => {
  // Session code state (persisted)
  const [sessionCode, setSessionCode] = useState<string>(() => settingsService.getSessionCode());
  const [dashboardData, setDashboardData] = useState<TeacherSessionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Authentication state
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // UI state
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [selectedTeamForReview, setSelectedTeamForReview] = useState<TeacherTeamSummary | null>(null);

  // Diagnostic state
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    details?: string;
  }>({
    tested: false,
    success: false,
    message: '',
  });

  const isCloudActive = isSupabaseConfigured();

  // Check auth session on mount
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      if (!isCloudActive) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const session = await authService.getSession();
        if (session && mounted) {
          setCurrentUser(session.user);
          const prof = await authService.getProfile();
          if (mounted) setProfile(prof);
          fetchDashboard(sessionCode);
        }
      } catch (err) {
        console.warn('Auth check error:', err);
      } finally {
        if (mounted) setIsCheckingAuth(false);
      }
    }

    checkAuth();

    const { unsubscribe } = authService.onAuthStateChange(async (session) => {
      if (!mounted) return;
      if (session) {
        setCurrentUser(session.user);
        const prof = await authService.getProfile();
        setProfile(prof);
        fetchDashboard(sessionCode);
      } else {
        setCurrentUser(null);
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [isCloudActive]);

  const fetchDashboard = async (code: string) => {
    if (!isCloudActive || !currentUser) return;

    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await syncService.getTeacherDashboardData(code);
      setDashboardData(data);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal memuat data kelas dari Supabase.');
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Harap masukkan email dan kata sandi guru.');
      return;
    }

    setLoginLoading(true);
    setLoginError(null);
    try {
      const { user, error } = await authService.signIn(loginEmail.trim(), loginPassword);
      if (error || !user) {
        setLoginError(error?.message || 'Kombinasi email atau kata sandi tidak valid.');
      } else {
        setCurrentUser(user);
        const prof = await authService.getProfile();
        setProfile(prof);
        fetchDashboard(sessionCode);
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Terjadi kesalahan saat masuk.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    setCurrentUser(null);
    setProfile(null);
    setDashboardData(null);
  };

  const handleGenerateNewCode = () => {
    const randomCode = `KD-${Math.floor(1000 + Math.random() * 9000)}`;
    setSessionCode(randomCode);
    settingsService.setSessionCode(randomCode);
    if (currentUser) {
      fetchDashboard(randomCode);
    }
  };

  const handleCopyCode = async () => {
    const ok = await copyToClipboard(sessionCode);
    if (ok) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    const supabase = getSupabase();

    if (!supabase || !isSupabaseConfigured()) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: 'Variabel Supabase Belum Terpasang',
        details:
          'VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY belum diisi di Secrets/Settings aplikasi. Game saat ini berjalan menggunakan penyimpanan lokal browser.',
      });
      setIsTestingConnection(false);
      return;
    }

    // 0. Validasi format URL
    const currentUrl = getSupabaseUrl();
    const urlValidation = validateSupabaseUrl(currentUrl);
    if (!urlValidation.isValid) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: 'URL Supabase tidak valid. Gunakan format https://<project-ref>.supabase.co (tanpa /rest/v1/).',
        details:
          urlValidation.error ||
          'URL Supabase tidak valid. Gunakan format https://<project-ref>.supabase.co (tanpa /rest/v1/).',
      });
      setIsTestingConnection(false);
      return;
    }

    const formatErrorMessage = (msg?: string) => {
      const text = msg || '';
      if (text.includes('Failed to fetch') || text.includes('NetworkError')) {
        return 'Tidak bisa menjangkau server Supabase. Periksa URL konfigurasi, koneksi internet, dan apakah domain supabase.co diblokir jaringan.';
      }
      return text;
    };

    try {
      // 1. Uji tabel
      const { error: teamsError } = await supabase.from('teams').select('id', { count: 'exact', head: true });
      if (teamsError) {
        const errorText = formatErrorMessage(teamsError.message);
        if (errorText.includes('Tidak bisa menjangkau server Supabase')) {
          setConnectionStatus({
            tested: true,
            success: false,
            message: 'Tidak bisa menjangkau server Supabase. Periksa URL konfigurasi, koneksi internet, dan apakah domain supabase.co diblokir jaringan.',
            details: errorText,
          });
          return;
        }

        if (teamsError.code === '42P01') {
          setConnectionStatus({
            tested: true,
            success: false,
            message: 'Terkoneksi ke Supabase, Namun Tabel Belum Dibuat',
            details:
              'Kredensial URL & Key valid, tetapi tabel database belum dibuat. Silakan salin skrip SQL dan jalankan di SQL Editor Supabase Anda.',
          });
          return;
        } else {
          setConnectionStatus({
            tested: true,
            success: false,
            message: 'Koneksi Tabel Mengalami Kendala',
            details: errorText,
          });
          return;
        }
      }

      // 2. Uji keberadaan fungsi RPC (menggunakan p_id: null agar tidak menulis ke tabel)
      const { error: rpcError } = await supabase.rpc('game_save_team', {
        p_id: null,
        p_name: '__ping__',
        p_color: '#000000',
        p_seed: 0,
        p_session_code: '__ping__',
      });

      if (rpcError) {
        const rpcErrorText = formatErrorMessage(rpcError.message);
        if (rpcErrorText.includes('Tidak bisa menjangkau server Supabase')) {
          setConnectionStatus({
            tested: true,
            success: false,
            message: 'Tidak bisa menjangkau server Supabase. Periksa URL konfigurasi, koneksi internet, dan apakah domain supabase.co diblokir jaringan.',
            details: rpcErrorText,
          });
          return;
        }

        if (rpcError.code === '42883') {
          setConnectionStatus({
            tested: true,
            success: false,
            message: 'Tabel Ditemukan, Namun Fungsi RPC Belum Dibuat',
            details:
              'Tabel ada, tetapi fungsi RPC (game_save_team, dsb.) belum dipasang. Jalankan skrip supabase/schema.sql lengkap di SQL Editor Supabase.',
          });
          return;
        }
      }

      // 3. Status Auth Guru
      const session = await authService.getSession();
      const authInfo = session?.user?.email
        ? `Sesi Guru: Aktif (${session.user.email})`
        : 'Sesi Guru: Belum masuk (login guru diperlukan untuk melihat monitoring siswa).';

      setConnectionStatus({
        tested: true,
        success: true,
        message: 'Koneksi Supabase PostgreSQL & RPC Berhasil!',
        details: `Seluruh tabel dan fungsi RPC keamanan siswa aktif. ${authInfo}`,
      });
    } catch (err: any) {
      const rawMsg = err?.message || String(err || '');
      const formatted = formatErrorMessage(rawMsg);
      const isNetwork = formatted.includes('Tidak bisa menjangkau server Supabase');

      setConnectionStatus({
        tested: true,
        success: false,
        message: isNetwork
          ? 'Tidak bisa menjangkau server Supabase. Periksa URL konfigurasi, koneksi internet, dan apakah domain supabase.co diblokir jaringan.'
          : 'Gagal Menghubungi Supabase',
        details: formatted || 'Pastikan perangkat terhubung internet dan server Supabase aktif.',
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleCopySql = async () => {
    const sqlText = `-- ==============================================================================
-- EKSPEDISI EKSPONEN: Misi Menyelamatkan Kota Data
-- Supabase PostgreSQL Database Schema (Single Source of Truth)
-- ==============================================================================

create extension if not exists "uuid-ossp";

-- Profil guru (terhubung ke auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'teacher' check (role in ('student','teacher','admin')),
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email), 'teacher')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Episodes
create table if not exists public.episodes (
  id text primary key,
  episode_number integer not null unique,
  title text not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Teams (id TEXT, konsisten dengan klien)
create table if not exists public.teams (
  id text primary key,
  session_code text,
  name text not null,
  color text not null,
  seed integer not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.team_members (
  id text primary key,
  team_id text not null references public.teams(id) on delete cascade,
  name text not null,
  role text not null,
  created_at timestamptz default now()
);

create table if not exists public.team_progress (
  id uuid primary key default gen_random_uuid(),
  team_id text not null references public.teams(id) on delete cascade,
  episode_id text not null references public.episodes(id) on delete cascade,
  selected_level text not null check (selected_level in ('jelajah','peneliti','master')),
  current_question_index integer default 0,
  completed boolean default false,
  episode_completed boolean default false,
  completed_levels text[] default '{}',
  score integer default 0,
  energy_tokens integer default 100,
  hint_tokens integer default 5,
  updated_at timestamptz default now(),
  constraint unique_team_episode_level unique (team_id, episode_id, selected_level)
);

create table if not exists public.question_attempts (
  id bigint generated always as identity primary key,
  team_id text not null references public.teams(id) on delete cascade,
  episode_id text not null references public.episodes(id) on delete cascade,
  level text not null,
  question_id text not null,
  answer text,
  reason text,
  is_correct boolean not null default false,
  hint_used boolean default false,
  attempts_count integer default 1,
  answered_at timestamptz default now()
);

create index if not exists idx_teams_session_code on public.teams(session_code);
create index if not exists idx_team_members_team_id on public.team_members(team_id);
create index if not exists idx_team_progress_team_id on public.team_progress(team_id);
create index if not exists idx_question_attempts_team_id on public.question_attempts(team_id);

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.episodes enable row level security;
alter table public.team_progress enable row level security;
alter table public.question_attempts enable row level security;

-- Guru (authenticated) boleh membaca
create policy "episodes read (teacher)" on public.episodes for select to authenticated using (true);
create policy "teams read (teacher)" on public.teams for select to authenticated using (true);
create policy "team_members read (teacher)" on public.team_members for select to authenticated using (true);
create policy "team_progress read (teacher)" on public.team_progress for select to authenticated using (true);
create policy "question_attempts read (teacher)" on public.question_attempts for select to authenticated using (true);
create policy "profiles read own" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles update own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Fungsi tulis (RPC, SECURITY DEFINER) — siswa anonim menulis lewat sini
create or replace function public.game_save_team(
  p_id text, p_name text, p_color text, p_seed integer, p_session_code text
) returns void language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.teams (id, name, color, seed, session_code, updated_at)
  values (p_id, p_name, p_color, p_seed, p_session_code, now())
  on conflict (id) do update
    set name = excluded.name, color = excluded.color, seed = excluded.seed,
        session_code = excluded.session_code, updated_at = now();
end;
$$;

create or replace function public.game_save_team_members(p_team_id text, p_members jsonb)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  delete from public.team_members where team_id = p_team_id;
  insert into public.team_members (id, team_id, name, role)
  select (m->>'id'), p_team_id, m->>'name', m->>'role'
  from jsonb_array_elements(coalesce(p_members,'[]'::jsonb)) as m;
end;
$$;

create or replace function public.game_save_progress(
  p_team_id text, p_episode_id text, p_selected_level text,
  p_current_question_index integer, p_completed boolean, p_episode_completed boolean,
  p_completed_levels text[], p_score integer, p_energy_tokens integer, p_hint_tokens integer
) returns void language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.team_progress (
    team_id, episode_id, selected_level, current_question_index, completed,
    episode_completed, completed_levels, score, energy_tokens, hint_tokens, updated_at
  ) values (
    p_team_id, p_episode_id, p_selected_level, p_current_question_index,
    coalesce(p_completed,false), coalesce(p_episode_completed,false),
    coalesce(p_completed_levels,'{}'), coalesce(p_score,0),
    coalesce(p_energy_tokens,100), coalesce(p_hint_tokens,5), now()
  )
  on conflict (team_id, episode_id, selected_level) do update
    set current_question_index = excluded.current_question_index,
        completed = excluded.completed, episode_completed = excluded.episode_completed,
        completed_levels = excluded.completed_levels, score = excluded.score,
        energy_tokens = excluded.energy_tokens, hint_tokens = excluded.hint_tokens,
        updated_at = now();
end;
$$;

create or replace function public.game_log_attempt(
  p_team_id text, p_episode_id text, p_level text, p_question_id text, p_answer text,
  p_reason text, p_is_correct boolean, p_hint_used boolean, p_attempts_count integer
) returns void language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.question_attempts (
    team_id, episode_id, level, question_id, answer, reason,
    is_correct, hint_used, attempts_count, answered_at
  ) values (
    p_team_id, p_episode_id, p_level, p_question_id, p_answer, p_reason,
    coalesce(p_is_correct,false), coalesce(p_hint_used,false), coalesce(p_attempts_count,1), now()
  );
end;
$$;

grant execute on function public.game_save_team(text,text,text,integer,text) to anon, authenticated;
grant execute on function public.game_save_team_members(text,jsonb) to anon, authenticated;
grant execute on function public.game_save_progress(text,text,text,integer,boolean,boolean,text[],integer,integer,integer) to anon, authenticated;
grant execute on function public.game_log_attempt(text,text,text,text,text,text,boolean,boolean,integer) to anon, authenticated;

-- Seed episode
insert into public.episodes (id, episode_number, title, description, is_active) values
  ('episode-1', 1, 'Menyelamatkan Kota Data', 'Konsep & sifat-sifat perpangkatan.', true),
  ('episode-2', 2, 'Serangan Mikro', 'Pangkat nol/negatif & notasi ilmiah.', true),
  ('episode-3', 3, 'Bahasa Akar', 'Pangkat pecahan, bentuk akar & rasionalisasi.', true),
  ('episode-4', 4, 'Gerbang Inti', 'Penerapan kontekstual & asesmen Bab 1.', true)
on conflict (episode_number) do update
  set id = excluded.id, title = excluded.title,
      description = excluded.description, is_active = excluded.is_active;`;

    const ok = await copyToClipboard(sqlText);
    if (ok) {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Header Card */}
      <div className="overflow-hidden rounded-[26px] bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 border border-slate-100 dark:border-slate-800 p-5 sm:p-6 transition-all">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBackToGame}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Permainan</span>
          </button>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                isCloudActive
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}
            >
              {isCloudActive ? 'Supabase Terdeteksi ☁️' : 'Mode Offline / Lokal 💾'}
            </span>

            {currentUser && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-full border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 cursor-pointer"
                title="Keluar dari Akun Guru"
              >
                <LogOut className="h-3 w-3" />
                <span>Keluar</span>
              </button>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">
            Dashboard Monitoring Guru
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {currentUser
              ? `Masuk sebagai: ${profile?.display_name || currentUser.email}`
              : 'Pantau partisipasi, capaian, dan progres pengerjaan kelompok siswa secara langsung.'}
          </p>
        </div>

        {/* Status Database Diagnostic Card */}
        <div className="mt-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Status Koneksi Supabase PostgreSQL
              </span>
            </div>
            <button
              onClick={handleTestConnection}
              disabled={isTestingConnection}
              className="flex items-center gap-1 rounded-xl bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isTestingConnection ? 'animate-spin' : ''}`} />
              <span>{isTestingConnection ? 'Menguji...' : 'Uji Koneksi'}</span>
            </button>
          </div>

          {getSupabaseHost() && (
            <div className="mb-2 flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Host:</span>
              <code className="rounded bg-slate-200/80 dark:bg-slate-700/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
                {getSupabaseHost()}
              </code>
            </div>
          )}

          {connectionStatus.tested ? (
            <div
              className={`mt-2 rounded-xl p-3 text-xs border ${
                connectionStatus.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {connectionStatus.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                )}
                <span>{connectionStatus.message}</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">{connectionStatus.details}</p>

              {isCloudActive && (
                <div className="mt-3 pt-2 border-t border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-300">
                    Skrip SQL tabel & RPC (supabase/schema.sql):
                  </span>
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-amber-700 cursor-pointer"
                  >
                    {copiedSql ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSql ? 'Tersalin!' : 'Salin Skrip SQL'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isCloudActive
                  ? 'Kredensial Supabase terdeteksi di aplikasi. Klik "Uji Koneksi" untuk memeriksa tabel dan fungsi RPC.'
                  : 'Aplikasi berjalan dalam Mode Offline / Lokal (data tetap tersimpan di browser masing-masing kelompok).'}
              </p>
              {isCloudActive && (
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copiedSql ? 'Skrip Tersalin!' : 'Salin Skrip SQL'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Gerbang Login Guru (Bila Belum Login) */}
        {isCloudActive && !currentUser && !isCheckingAuth && (
          <div className="mt-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 p-5 border border-indigo-200 dark:border-indigo-900/60">
            <div className="flex items-center gap-2 mb-2 text-indigo-900 dark:text-indigo-200 font-bold text-sm">
              <Lock className="h-4 w-4 text-indigo-600" />
              <span>Autentikasi Guru Diperlukan</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Untuk melindungi privasi data kelompok siswa, akses monitoring ruang kelas hanya dapat dibuka oleh akun guru terdaftar.
            </p>

            <form onSubmit={handleLogin} className="space-y-3 max-w-md">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Email Guru
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="guru@sekolah.sch.id"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                    required
                  />
                </div>
              </div>

              {loginError && (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 p-2 text-xs text-rose-800 dark:text-rose-300">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 transition cursor-pointer disabled:opacity-50"
              >
                {loginLoading ? 'Memverifikasi...' : 'Masuk Dashboard Monitoring'}
              </button>
            </form>

            <p className="mt-3 text-[10px] text-slate-400 dark:text-slate-500">
              *Akun guru dapat dibuat melalui Supabase Dashboard (Authentication → Users).
            </p>
          </div>
        )}

        {/* Kode Sesi Kelas Controller (Hanya Tampil Jika Sudah Login atau Mode Offline) */}
        {(currentUser || !isCloudActive) && (
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Kode Sesi Aktif Untuk Siswa
              </span>
              <div className="flex items-center gap-2 mt-1">
                <KeyRound className="h-5 w-5 text-indigo-500" />
                <span className="text-xl sm:text-2xl font-black tracking-widest font-mono text-indigo-600 dark:text-indigo-400 select-all">
                  {sessionCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 cursor-pointer ml-1"
                  title="Salin Kode Sesi"
                >
                  {copiedCode ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCode ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateNewCode}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                <span>Buat Kode Baru</span>
              </button>
              <button
                onClick={() => fetchDashboard(sessionCode)}
                disabled={loading}
                className="flex items-center justify-center rounded-xl bg-slate-900 dark:bg-indigo-600 p-2 text-white hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                title="Segarkan Data"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pesan Kesalahan Query */}
      {errorMessage && (
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 p-4 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => fetchDashboard(sessionCode)}
            className="rounded-lg bg-rose-600 px-2.5 py-1 text-white font-bold text-[11px] hover:bg-rose-700 cursor-pointer shrink-0"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Teams Overview List (Hanya Tampil Jika Sudah Login) */}
      {currentUser && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kelompok Bergabung ({dashboardData?.teams.length || 0})
            </h2>
            <span className="text-[11px] text-slate-400">Pembaruan langsung dari Supabase</span>
          </div>

          {dashboardData?.teams && dashboardData.teams.length > 0 ? (
            dashboardData.teams.map((t) => (
              <div
                key={t.teamId}
                className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="h-3.5 w-3.5 rounded-full ring-2 ring-slate-200 dark:ring-slate-700"
                      style={{ backgroundColor: t.teamColor }}
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {t.teamName}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {t.memberCount} Siswa
                        </span>
                        <span>•</span>
                        <span className="capitalize font-medium text-indigo-600 dark:text-indigo-400">
                          Level {t.currentLevel}
                        </span>
                        <span>•</span>
                        <span>Aktif: {new Date(t.lastActive).toLocaleTimeString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  {t.episode1Completed ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Episode 1 Selesai</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>Sedang Mengerjakan</span>
                    </span>
                  )}
                </div>

                {/* Progress Bar (Total 12 Soal) */}
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                    <span>Progres Kurikulum ({t.completedLevels.length}/3 Tingkat)</span>
                    <span>{t.progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-300"
                      style={{ width: `${t.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Pill Row */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2">
                    <span className="text-[10px] text-slate-400 block">Skor</span>
                    <strong className="text-slate-800 dark:text-slate-100 font-black">{t.score}</strong>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2">
                    <span className="text-[10px] text-slate-400 block">Energi</span>
                    <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                      <Zap className="h-3 w-3 fill-current" />
                      <span>{t.energyTokens}</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2">
                    <span className="text-[10px] text-slate-400 block">Petunjuk</span>
                    <div className="flex items-center justify-center gap-1 text-sky-600 dark:text-sky-400 font-bold">
                      <HelpCircle className="h-3 w-3" />
                      <span>{t.hintsUsed}</span>
                    </div>
                  </div>
                </div>

                {/* Tombol Lihat Jawaban & Alasan */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => setSelectedTeamForReview(selectedTeamForReview?.teamId === t.teamId ? null : t)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Lihat Jawaban & Alasan ({t.attempts.length})</span>
                    {selectedTeamForReview?.teamId === t.teamId ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {/* Detail Jawaban Tim Accordion */}
                {selectedTeamForReview?.teamId === t.teamId && (
                  <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 space-y-2.5">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                      Riwayat Pengerjaan & Alasan Diskusi:
                    </h4>

                    {t.attempts.length > 0 ? (
                      t.attempts.map((att, idx) => (
                        <div
                          key={att.id || idx}
                          className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">
                              Tingkat {att.level} — Soal {att.questionId}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                att.isCorrect
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              {att.isCorrect ? 'Benar ✓' : 'Belum Tepat ✕'} ({att.attemptsCount}x Coba)
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-600 dark:text-slate-400">
                            <strong>Jawaban Kelompok:</strong>{' '}
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {att.answer}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-600 dark:text-slate-400">
                            <strong>Alasan / Cara Kerja:</strong>{' '}
                            <span className="italic text-slate-800 dark:text-slate-200">
                              "{formatPowerText(att.reason)}"
                            </span>
                          </div>

                          {att.hintUsed && (
                            <span className="inline-block text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                              * Menggunakan bantuan petunjuk Aria
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Belum ada jawaban soal yang tercatat untuk kelompok ini.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center bg-white dark:bg-slate-900">
              <p className="text-xs text-slate-500">
                Belum ada kelompok siswa yang terhubung dengan kode sesi{' '}
                <strong className="font-mono text-indigo-600 dark:text-indigo-400">{sessionCode}</strong>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
