import React, { useState } from 'react';
import { Zap, HelpCircle, CheckCircle2, ChevronRight, Award, LogOut, AlertTriangle, Layers } from 'lucide-react';
import { TeamData, TeamProgress, DifficultyLevel } from '../types/game';
import { GAME_LEVELS } from '../data/levels';
import { EpisodeInfo } from '../data/episodes';
import { GameImage } from '../components/common/GameImage';
import { audioManager } from '../audio/audioManager';

interface MapSceneProps {
  team: TeamData;
  progress: TeamProgress;
  episodes: EpisodeInfo[];
  activeEpisodeId: string;
  onSelectEpisode: (episodeId: string) => void;
  onSelectLevel: (level: DifficultyLevel) => void;
  onResetTeam: () => void;
}

export const MapScene: React.FC<MapSceneProps> = ({
  team,
  progress,
  episodes,
  activeEpisodeId,
  onSelectEpisode,
  onSelectLevel,
  onResetTeam,
}) => {
  const [selectedLevelId, setSelectedLevelId] = useState<DifficultyLevel>(
    progress.selectedLevel || 'jelajah'
  );
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSelect = (level: DifficultyLevel) => {
    setSelectedLevelId(level);
    audioManager.playSfx('level_select');
  };

  const handleConfirm = () => {
    audioManager.playSfx('click');
    onSelectLevel(selectedLevelId);
  };

  const handleConfirmReset = () => {
    setShowResetConfirm(false);
    audioManager.playSfx('click');
    onResetTeam();
  };

  const completedCount = progress.completedLevels?.length || 0;

  return (
    <div className="w-full space-y-4">
      {/* Modal Konfirmasi Ganti Tim */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[26px] bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black">Ganti Kelompok Siswa?</h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Tindakan ini akan mengosongkan data kelompok di perangkat ini dan kembali ke menu awal Persiapan Tim. Data yang sudah tersinkronkan ke cloud tetap tersimpan.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer shadow-md shadow-rose-600/20"
              >
                Ya, Ganti Tim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Status Card Kelompok */}
      <div className="overflow-hidden rounded-[26px] bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 border border-slate-100 dark:border-slate-800 p-4 sm:p-5 transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="h-4 w-4 rounded-full ring-2 ring-slate-200 dark:ring-slate-700 shrink-0"
              style={{ backgroundColor: team.color }}
            />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Tim Ekspedisi
              </span>
              <h2 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                {team.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Skor Tim
              </span>
              <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                {progress.score} Poin
              </div>
            </div>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer ml-1"
              title="Ganti Kelompok di Perangkat Ini"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ganti Tim</span>
            </button>
          </div>
        </div>

        {/* Status Pills: Token Energi, Token Petunjuk, Fragmen Inti */}
        <div className="grid grid-cols-3 gap-2">
          {/* Token Energi */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 p-2.5">
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Zap className="h-4 w-4 fill-current" />
              <span className="text-xs font-black">{progress.energyTokens}</span>
            </div>
            <span className="mt-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
              Energi
            </span>
          </div>

          {/* Token Petunjuk */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-900/50 p-2.5">
            <div className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
              <HelpCircle className="h-4 w-4" />
              <span className="text-xs font-black">{progress.hintTokens}</span>
            </div>
            <span className="mt-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
              Petunjuk
            </span>
          </div>

          {/* Fragmen Inti */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50 p-2.5">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Award className="h-4 w-4" />
              <span className="text-xs font-black">{completedCount} / 3</span>
            </div>
            <span className="mt-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
              Fragmen
            </span>
          </div>
        </div>
      </div>

      {/* 2. Pemilih Episode / Bab Eksponen */}
      <div className="overflow-hidden rounded-[26px] bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 border border-slate-100 dark:border-slate-800 p-4 transition-all">
        <div className="flex items-center gap-2 mb-2.5">
          <Layers className="h-4 w-4 text-indigo-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Modul Episode (Bab 1: Eksponen & Logaritma)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {episodes.map((ep) => {
            const isSelected = activeEpisodeId === ep.id;
            return (
              <button
                key={ep.id}
                type="button"
                onClick={() => {
                  if (ep.isActive) {
                    audioManager.playSfx('click');
                    onSelectEpisode(ep.id);
                  }
                }}
                disabled={!ep.isActive}
                className={`relative flex flex-col items-start p-2.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 dark:border-indigo-500'
                    : ep.isActive
                    ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 cursor-pointer'
                    : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/40 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-black uppercase text-slate-400">
                    Ep. {ep.episodeNumber}
                  </span>
                  {!ep.isActive && (
                    <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 text-[9px] font-bold text-slate-600 dark:text-slate-300">
                      Segera
                    </span>
                  )}
                  {ep.isActive && (
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                      Aktif
                    </span>
                  )}
                </div>
                <strong className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {ep.title}
                </strong>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {ep.theme}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Peta Kota Data Image Card */}
      <div className="overflow-hidden rounded-[26px] bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 border border-slate-100 dark:border-slate-800">
        <GameImage
          src="/img/peta-kota.jpg"
          alt="Peta Kota Data"
          caption="Peta Grid Energi Kota Data — Wilayah Generator Eksponen"
          aspectRatio="16/9"
          themeType="city"
        />

        <div className="p-5">
          <div className="mb-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Pilih Sektor Penyelamatan
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Pulihkan sub-sistem kota secara bertahap mulai dari tingkat dasar hingga master.
            </p>
          </div>

          {/* Tiga Tingkat Kesulitan Cards */}
          <div className="space-y-3">
            {GAME_LEVELS.map((lvl) => {
              const isSelected = selectedLevelId === lvl.id;
              const isDone = progress.completedLevels?.includes(lvl.id);

              return (
                <div
                  key={lvl.id}
                  onClick={() => handleSelect(lvl.id)}
                  className={`group relative flex cursor-pointer items-start gap-3.5 rounded-2xl p-4 transition-all duration-200 ${
                    isSelected
                      ? 'border-2 border-slate-900 bg-slate-50 shadow-md ring-2 ring-slate-900/10 dark:border-indigo-500 dark:bg-slate-800 dark:ring-indigo-500/20 scale-[1.01]'
                      : 'border border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl shadow-xs ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-indigo-600'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    <span>{lvl.icon}</span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {lvl.title}
                        </span>
                        {isDone && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {lvl.badge}
                      </span>
                    </div>

                    <p className="mt-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      {lvl.subtitle}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {lvl.description}
                    </p>
                  </div>

                  {/* Active Selection Ring / Indicator */}
                  <div className="self-center">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white dark:bg-indigo-600'
                          : 'border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isSelected && <ChevronRight className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tombol: Jelajahi Wilayah Ini */}
          <button
            onClick={handleConfirm}
            className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 dark:hover:bg-indigo-500 active:scale-98 transition cursor-pointer"
          >
            <span>Jelajahi Wilayah Ini 🎯</span>
          </button>
        </div>
      </div>
    </div>
  );
};
