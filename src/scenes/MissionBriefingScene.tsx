import React from 'react';
import { Clock, HelpCircle, FileText, ArrowRight, Target, Flame } from 'lucide-react';
import { LevelInfo, TeamProgress } from '../types/game';
import { GameImage } from '../components/common/GameImage';
import { audioManager } from '../audio/audioManager';

interface MissionBriefingSceneProps {
  levelInfo: LevelInfo;
  progress: TeamProgress;
  timerSeconds?: number;
  onSelectTimer?: (seconds: number | undefined) => void;
  onStartMission: () => void;
  onBackToMap: () => void;
}

export const MissionBriefingScene: React.FC<MissionBriefingSceneProps> = ({
  levelInfo,
  progress,
  timerSeconds,
  onSelectTimer,
  onStartMission,
  onBackToMap,
}) => {
  const handleStart = () => {
    audioManager.playSfx('generator_active');
    onStartMission();
  };

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-[26px] bg-white shadow-xl shadow-slate-200/50 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 transition-all">
        {/* Ilustrasi Generator Perkalian */}
        <GameImage
          src="/img/generator-perkalian.jpg"
          alt="Generator Perkalian"
          caption="Reaktor Generator Perkalian Kota Data — Mode Siaga"
          aspectRatio="16/9"
          themeType="generator"
        />

        <div className="p-5 sm:p-7">
          {/* Header & Mission Name */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="inline-block rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                Briefing Misi Sektor {levelInfo.badge}
              </span>
              <span className="text-xl">{levelInfo.icon}</span>
            </div>

            <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {levelInfo.title}
            </h1>
            <p className="mt-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {levelInfo.subtitle}
            </p>
          </div>

          {/* Core Objectives Box */}
          <div className="mb-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-start gap-2.5">
              <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Tujuan Pembelajaran
                </h4>
                <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  "{levelInfo.targetObjective}"
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {/* Perkiraan Waktu */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-center shadow-xs">
              <Clock className="mx-auto h-4 w-4 text-slate-500 mb-1" />
              <div className="text-xs font-black text-slate-900 dark:text-white">
                ~{levelInfo.estimatedMinutes} Menit
              </div>
              <span className="text-[10px] text-slate-400">Durasi</span>
            </div>

            {/* Jumlah Tantangan */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-center shadow-xs">
              <Flame className="mx-auto h-4 w-4 text-amber-500 mb-1" />
              <div className="text-xs font-black text-slate-900 dark:text-white">
                {levelInfo.totalQuestions} Soal
              </div>
              <span className="text-[10px] text-slate-400">Tantangan</span>
            </div>

            {/* Token Petunjuk */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-center shadow-xs">
              <HelpCircle className="mx-auto h-4 w-4 text-sky-500 mb-1" />
              <div className="text-xs font-black text-slate-900 dark:text-white">
                {progress.hintTokens} Token
              </div>
              <span className="text-[10px] text-slate-400">Tersedia</span>
            </div>
          </div>

          {/* Mode Waktu (Opsional) */}
          <div className="mb-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Mode Waktu (Opsional)
              </span>
              <span className="text-[10px] text-slate-400">
                Bonus skor +20% / +10% jika menjawab cepat
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Bebas', sec: undefined },
                { label: '60 dtk', sec: 60 },
                { label: '90 dtk', sec: 90 },
                { label: '120 dtk', sec: 120 },
              ].map((opt) => {
                const isSelected = timerSeconds === opt.sec;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      audioManager.playSfx('click');
                      onSelectTimer?.(opt.sec);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mandatory Paper Worksheet Reminder */}
          <div className="mb-6 flex items-start gap-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 p-4">
            <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <strong className="block font-bold mb-0.5">
                Pengingat Kerja Kelompok di Lembar Kertas:
              </strong>
              Tuliskan cara perhitungan, penjabaran, dan alasan diskusi di lembar kerja fisik kelompok kalian sebelum menginput jawaban ke dalam aplikasi game.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleStart}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 dark:hover:bg-indigo-500 active:scale-98 transition cursor-pointer"
            >
              <span>Mulai Tantangan Sektor ⚡</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                audioManager.playSfx('click');
                onBackToMap();
              }}
              className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
            >
              Kembali ke Peta Kota
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
