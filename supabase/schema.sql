-- ==============================================================================
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
      description = excluded.description, is_active = excluded.is_active;
