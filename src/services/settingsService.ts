/**
 * Pengaturan lokal persisten untuk sesi kelas dan konfigurasi guru/aplikasi
 */

const STORAGE_KEYS = {
  SESSION_CODE: 'ekspedisi_teacher_session_code',
  LAST_EPISODE: 'ekspedisi_active_episode',
};

export const settingsService = {
  getSessionCode(): string {
    try {
      const code = localStorage.getItem(STORAGE_KEYS.SESSION_CODE);
      return code && code.trim().length > 0 ? code.trim() : 'KOTA-DATA-01';
    } catch {
      return 'KOTA-DATA-01';
    }
  },

  setSessionCode(code: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION_CODE, code.trim());
    } catch {
      // ignore storage error
    }
  },

  getActiveEpisode(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_EPISODE) || 'episode-1';
    } catch {
      return 'episode-1';
    }
  },

  setActiveEpisode(episodeId: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_EPISODE, episodeId);
    } catch {
      // ignore
    }
  },
};
