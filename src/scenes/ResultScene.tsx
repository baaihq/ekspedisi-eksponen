import React, { useState } from 'react';
import { Award, Zap, HelpCircle, CheckCircle2, MapPin, PartyPopper } from 'lucide-react';
import { TeamData, TeamProgress, QuestionData } from '../types/game';
import { GameImage } from '../components/common/GameImage';
import { audioManager } from '../audio/audioManager';

interface ResultSceneProps {
  team: TeamData;
  progress: TeamProgress;
  questions: QuestionData[];
  onFinishEpisode: () => void;
  onBackToMap: () => void;
}

export const ResultScene: React.FC<ResultSceneProps> = ({
  team,
  progress,
  questions,
  onFinishEpisode,
  onBackToMap,
}) => {
  const [hasCompletedEpisode, setHasCompletedEpisode] = useState(
    Boolean(progress.episode1Completed)
  );

  const completedLevelCount = progress.completedLevels?.length ?? 0;
  const isAllLevelsCompleted = completedLevelCount >= 3;

  // Calculate statistics
  const attempts = progress.attempts || {};
  let correctCount = 0;
  questions.forEach((q) => {
    if (attempts[q.id]?.isCorrect) {
      correctCount++;
    }
  });

  const hintsUsed = 5 - (progress.hintTokens ?? 5);

  const handleFinishEpisodeClick = () => {
    if (hasCompletedEpisode) return;
    audioManager.playSfx('episode_complete');
    setHasCompletedEpisode(true);
    onFinishEpisode();
  };

  return (
    <div className="w-full space-y-4">
      {/* 1. Generator Aktif & Fragmen Inti Card */}
      <div className="overflow-hidden rounded-[26px] bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 border border-slate-100 dark:border-slate-800 transition-all">
        {/* Gambar Generator Aktif & Fragmen Inti */}
        <div className="grid grid-cols-2 gap-1 bg-slate-950">
          <GameImage
            src="/img/generator-aktif.jpg"
            alt="Generator Aktif"
            caption="Generator Perkalian Aktif"
            aspectRatio="4/3"
            themeType="generator_active"
          />
          <GameImage
            src="/img/fragmen-inti.jpg"
            alt="Fragmen Inti"
            caption="Fragmen Inti Pulih"
            aspectRatio="4/3"
            themeType="fragment"
          />
        </div>

        <div className="p-5 sm:p-7">
          {/* Judul & Status */}
          <div className="text-center mb-6">
            <span className="inline-block rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">
              Sektor {progress.selectedLevel.toUpperCase()} Berhasil Dipulihkan
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Generator kembali menyala! ⚡
            </h1>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Kerja sama luar biasa dari Tim <strong className="text-indigo-600 dark:text-indigo-400">{team.name}</strong>!
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5 mb-6">
            {/* Jawaban Benar */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
              <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500 mb-1" />
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {correctCount} / {questions.length}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Jawaban Benar</span>
            </div>

            {/* Token Energi */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
              <Zap className="mx-auto h-4 w-4 text-amber-500 mb-1" />
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {progress.energyTokens}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Token Energi</span>
            </div>

            {/* Petunjuk Digunakan */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
              <HelpCircle className="mx-auto h-4 w-4 text-sky-500 mb-1" />
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {hintsUsed}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Petunjuk Dipakai</span>
            </div>
          </div>

          {/* Ringkasan Setiap Soal */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
              Ringkasan Tantangan Sektor
            </h3>

            <div className="space-y-2">
              {questions.map((q, idx) => {
                const attempt = attempts[q.id];
                const isCorrect = attempt?.isCorrect;

                return (
                  <div
                    key={q.id}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 p-3 text-xs"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <span>Tantangan {idx + 1}:</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {q.title.replace(/Tantangan \d+: /, '')}
                        </span>
                      </div>
                      {attempt && (
                        <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          Jawaban Tim: <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{attempt.userAnswer}</span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 mt-0.5">
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Berhasil</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                          <span>Perlu Evaluasi</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Episode 1 Completion Banner & Button */}
          {hasCompletedEpisode ? (
            <div className="mb-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/60 p-4 text-center">
              <PartyPopper className="mx-auto h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-1" />
              <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                Episode 1 Selesai Tersimpan!
              </h4>
              <p className="mt-0.5 text-xs text-indigo-700 dark:text-indigo-300">
                Data kelompok kalian telah tersimpan rapi untuk evaluasi guru.
              </p>
            </div>
          ) : isAllLevelsCompleted ? (
            <div className="mb-4">
              <button
                onClick={handleFinishEpisodeClick}
                className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 active:scale-98 transition cursor-pointer"
              >
                <Award className="h-4 w-4" />
                <span>Akhiri Episode 1 🎖️</span>
              </button>
            </div>
          ) : null}

          {/* Back to Map Button */}
          <button
            onClick={() => {
              audioManager.playSfx('click');
              onBackToMap();
            }}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-slate-800 text-sm font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-98 transition cursor-pointer"
          >
            <MapPin className="h-4 w-4" />
            <span>Kembali ke Peta Kota Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
