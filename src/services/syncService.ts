import { TeamData, TeamProgress, QuestionAttempt, TeacherSessionSummary, TeacherTeamSummary } from '../types/game';
import { getSupabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  CURRENT_TEAM: 'ekspedisi_current_team',
  CURRENT_PROGRESS: 'ekspedisi_current_progress',
  PROGRESS_MAP: 'ekspedisi_progress_map',
  PENDING_SYNC: 'ekspedisi_pending_sync',
  TEACHER_SESSIONS: 'ekspedisi_teacher_sessions',
};

export type SyncState = 'idle' | 'syncing' | 'synced' | 'error';
type SyncListener = (state: SyncState, errorMessage: string | null) => void;

let currentSyncState: SyncState = 'idle';
let lastSyncError: string | null = null;
const syncListeners: Set<SyncListener> = new Set();

function notifySyncListeners(state: SyncState, err: string | null) {
  currentSyncState = state;
  lastSyncError = err;
  syncListeners.forEach((fn) => {
    try {
      fn(state, err);
    } catch {
      // ignore
    }
  });
}

export const syncService = {
  getSyncState(): SyncState {
    return currentSyncState;
  },

  getLastError(): string | null {
    return lastSyncError;
  },

  onSyncStateChange(listener: SyncListener) {
    syncListeners.add(listener);
    return () => {
      syncListeners.delete(listener);
    };
  },

  /**
   * Save or update team setup locally and to Supabase via RPC game_save_team & game_save_team_members
   */
  async saveTeam(team: TeamData): Promise<void> {
    // 1. Always save to localStorage immediately
    localStorage.setItem(STORAGE_KEYS.CURRENT_TEAM, JSON.stringify(team));

    // 2. If Supabase is configured and online, push via RPC
    const supabase = getSupabase();
    if (supabase && typeof navigator !== 'undefined' && navigator.onLine) {
      notifySyncListeners('syncing', null);
      try {
        const { error: teamError } = await supabase.rpc('game_save_team', {
          p_id: team.id,
          p_name: team.name,
          p_color: team.color,
          p_seed: team.seed,
          p_session_code: team.sessionCode || null,
        });

        if (teamError) {
          throw new Error(teamError.message);
        }

        if (team.members && team.members.length > 0) {
          const membersPayload = team.members.map((m) => ({
            id: m.id,
            name: m.name,
            role: m.role,
          }));

          const { error: membersError } = await supabase.rpc('game_save_team_members', {
            p_team_id: team.id,
            p_members: membersPayload,
          });

          if (membersError) {
            throw new Error(membersError.message);
          }
        }

        notifySyncListeners('synced', null);
      } catch (err: any) {
        const msg = err?.message || 'Gagal menyinkronkan data kelompok ke cloud';
        console.warn('Could not sync team to Supabase, saved locally:', msg);
        notifySyncListeners('error', msg);
      }
    }
  },

  /**
   * Loads current team from localStorage
   */
  loadCurrentTeam(): TeamData | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_TEAM);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Loads all progress mapped by episodeId from localStorage
   * Migrates legacy ekspedisi_current_progress if needed
   */
  loadProgressMap(): Record<string, TeamProgress> {
    try {
      const rawMap = localStorage.getItem(STORAGE_KEYS.PROGRESS_MAP);
      let map: Record<string, TeamProgress> = rawMap ? JSON.parse(rawMap) : {};

      // Migrasi: jika belum ada di map tapi ada di ekspedisi_current_progress lama
      const legacyRaw = localStorage.getItem(STORAGE_KEYS.CURRENT_PROGRESS);
      if (legacyRaw) {
        try {
          const legacy: TeamProgress = JSON.parse(legacyRaw);
          const epId = legacy.episodeId || 'episode-1';
          if (!map[epId]) {
            map[epId] = legacy;
            localStorage.setItem(STORAGE_KEYS.PROGRESS_MAP, JSON.stringify(map));
          }
        } catch {
          // ignore parse error
        }
      }
      return map;
    } catch {
      return {};
    }
  },

  /**
   * Loads progress for a specific episode from the map
   */
  loadProgressForEpisode(episodeId: string): TeamProgress | null {
    const map = this.loadProgressMap();
    return map[episodeId] || null;
  },

  /**
   * Clears current team and all progress locally on this device (for Ganti Tim)
   */
  clearLocalTeam(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_TEAM);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PROGRESS);
      localStorage.removeItem(STORAGE_KEYS.PROGRESS_MAP);
    } catch {
      // ignore
    }
  },

  /**
   * Saves team progress locally (in progress map) and to Supabase via RPC game_save_progress
   */
  async saveProgress(progress: TeamProgress): Promise<void> {
    const episodeId = progress.episodeId || 'episode-1';

    // 1. Simpan di map per-episode dan simpan juga active progress di localStorage
    try {
      const map = this.loadProgressMap();
      map[episodeId] = { ...progress, episodeId };
      localStorage.setItem(STORAGE_KEYS.PROGRESS_MAP, JSON.stringify(map));
      localStorage.setItem(STORAGE_KEYS.CURRENT_PROGRESS, JSON.stringify(map[episodeId]));
    } catch (err) {
      console.warn('Error saving progress to localStorage map:', err);
    }

    // 2. Remote sync via RPC if possible
    const supabase = getSupabase();
    if (supabase && typeof navigator !== 'undefined' && navigator.onLine) {
      notifySyncListeners('syncing', null);
      try {
        const isEpisodeDone = Boolean(
          progress.episode1Completed ||
          (progress.completedLevels && progress.completedLevels.length >= 3)
        );

        const { error } = await supabase.rpc('game_save_progress', {
          p_team_id: progress.teamId,
          p_episode_id: episodeId,
          p_selected_level: progress.selectedLevel,
          p_current_question_index: progress.currentQuestionIndex,
          p_completed: Boolean(progress.completed),
          p_episode_completed: isEpisodeDone,
          p_completed_levels: progress.completedLevels || [],
          p_score: progress.score || 0,
          p_energy_tokens: progress.energyTokens ?? 100,
          p_hint_tokens: progress.hintTokens ?? 5,
        });

        if (error) {
          throw new Error(error.message);
        }

        notifySyncListeners('synced', null);
      } catch (err: any) {
        const msg = err?.message || 'Gagal menyinkronkan progres ke cloud';
        console.warn('Could not sync progress to Supabase:', msg);
        notifySyncListeners('error', msg);
      }
    }
  },

  /**
   * Loads current progress from localStorage (with optional episodeId)
   */
  loadCurrentProgress(episodeId: string = 'episode-1'): TeamProgress | null {
    try {
      const map = this.loadProgressMap();
      if (map[episodeId]) {
        return map[episodeId];
      }
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_PROGRESS);
      if (data) {
        const parsed: TeamProgress = JSON.parse(data);
        if ((parsed.episodeId || 'episode-1') === episodeId) {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Records a question attempt via RPC game_log_attempt
   */
  async recordAttempt(teamId: string, episodeId: string, attempt: QuestionAttempt): Promise<void> {
    const supabase = getSupabase();
    if (supabase && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const { error } = await supabase.rpc('game_log_attempt', {
          p_team_id: teamId,
          p_episode_id: episodeId || 'episode-1',
          p_level: attempt.level,
          p_question_id: attempt.questionId,
          p_answer: attempt.userAnswer,
          p_reason: attempt.reason,
          p_is_correct: Boolean(attempt.isCorrect),
          p_hint_used: Boolean(attempt.hintUsed),
          p_attempts_count: attempt.attemptsCount || 1,
        });

        if (error) {
          console.warn('RPC game_log_attempt returned error:', error.message);
        }
      } catch (err: any) {
        console.warn('Could not log attempt to Supabase:', err?.message);
      }
    }
  },

  /**
   * Gets teacher session data directly from Supabase (AUTHENTICATED ONLY, NO MOCKS)
   */
  async getTeacherDashboardData(sessionCode: string): Promise<TeacherSessionSummary | null> {
    const supabase = getSupabase();

    if (!supabase || !isSupabaseConfigured()) {
      return null;
    }

    const { data: teamsData, error } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        color,
        updated_at,
        team_members (id, name, role),
        team_progress (
          selected_level,
          current_question_index,
          score,
          energy_tokens,
          hint_tokens,
          completed,
          episode_completed,
          completed_levels
        ),
        question_attempts (
          id,
          level,
          question_id,
          answer,
          reason,
          is_correct,
          hint_used,
          attempts_count,
          answered_at
        )
      `)
      .eq('session_code', sessionCode);

    if (error) {
      throw new Error(`Gagal memuat data kelas dari Supabase: ${error.message}`);
    }

    if (!teamsData) {
      return {
        sessionCode,
        teacherName: 'Guru Matematika',
        teams: [],
      };
    }

    const teams: TeacherTeamSummary[] = teamsData.map((t: any) => {
      // Ambang data progres terbaru atau level yang sedang aktif
      const progList: any[] = t.team_progress || [];
      // Ambil record yang paling mutakhir atau record pertama
      const prog = progList[0] || {};

      // Selesai 3 level = Episode 1 Tuntas
      const completedLevelsList: string[] = prog.completed_levels || [];
      const isEpisodeDone = Boolean(prog.episode_completed || completedLevelsList.length >= 3);

      // Hitung persentase progres secara stabil dari akumulasi 12 soal (3 level x 4)
      const baseSolvedCount = completedLevelsList.length * 4;
      const currentLevelSolved = prog.completed ? 0 : Math.min(4, prog.current_question_index || 0);
      const totalSolved = isEpisodeDone ? 12 : Math.min(12, baseSolvedCount + currentLevelSolved);
      const progressPercent = Math.min(100, Math.round((totalSolved / 12) * 100));

      const attemptsList = (t.question_attempts || []).map((att: any) => ({
        id: att.id,
        level: att.level,
        questionId: att.question_id,
        answer: att.answer || '-',
        reason: att.reason || '-',
        isCorrect: Boolean(att.is_correct),
        hintUsed: Boolean(att.hint_used),
        attemptsCount: att.attempts_count || 1,
        answeredAt: att.answered_at || new Date().toISOString(),
      }));

      return {
        teamId: t.id,
        teamName: t.name,
        teamColor: t.color || '#0284c7',
        memberCount: t.team_members?.length || 0,
        members: (t.team_members || []).map((m: any) => ({
          id: m.id,
          name: m.name,
          role: m.role,
        })),
        currentLevel: prog.selected_level || 'jelajah',
        progressPercent,
        score: prog.score || 0,
        energyTokens: prog.energy_tokens ?? 100,
        hintsUsed: Math.max(0, 5 - (prog.hint_tokens ?? 5)),
        episode1Completed: isEpisodeDone,
        completedLevels: completedLevelsList,
        lastActive: t.updated_at || new Date().toISOString(),
        attempts: attemptsList,
      };
    });

    return {
      sessionCode,
      teacherName: 'Guru Matematika',
      teams,
    };
  },
};
