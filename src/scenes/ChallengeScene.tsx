import React, { useState, useEffect } from 'react';
import { Lightbulb, Check, AlertCircle, ArrowRight, ArrowLeft, Info, CheckCircle2, Clock } from 'lucide-react';
import { LevelInfo, QuestionData, TeamProgress } from '../types/game';
import { MathView } from '../components/common/MathView';
import { GameImage } from '../components/common/GameImage';
import { verifyAnswer } from '../lib/normalize';
import { formatPowerText } from '../lib/superscript';
import { audioManager } from '../audio/audioManager';
import { GAME_LEVELS } from '../data/levels';
import { AnswerReward } from '../lib/scoring';

interface ChallengeSceneProps {
  questions: QuestionData[];
  currentIndex: number;
  progress: TeamProgress;
  timerSeconds?: number;
  lastReward?: AnswerReward | null;
  levelInfo?: LevelInfo;
  onAnswerSubmit: (
    questionId: string,
    userAnswer: string,
    reason: string,
    isCorrect: boolean,
    hintUsed: boolean,
    elapsedSeconds?: number
  ) => void;
  onNextQuestion: () => void;
  onFinishLevel: () => void;
  onUseHint: (questionId: string) => void;
  onBackToMap: () => void;
}

export const ChallengeScene: React.FC<ChallengeSceneProps> = ({
  questions,
  currentIndex,
  progress,
  timerSeconds,
  lastReward,
  levelInfo,
  onAnswerSubmit,
  onNextQuestion,
  onFinishLevel,
  onUseHint,
  onBackToMap,
}) => {
  const currentQuestion = questions[currentIndex] || questions[0];
  const total = questions.length;
  const isLastQuestion = currentIndex === total - 1;

  // Level info for points and penalty display
  const currentLevelInfo =
    levelInfo ||
    GAME_LEVELS.find((l) => l.id === currentQuestion.level) ||
    GAME_LEVELS[0];
  const isSectorCompleted = progress.completedLevels?.includes(currentQuestion.level);
  const wasPreviouslyCorrect = Boolean(progress.attempts[currentQuestion.id]?.isCorrect);

  // Local form state
  const [userAnswer, setUserAnswer] = useState('');
  const [reason, setReason] = useState('');
  const [hasChecked, setHasChecked] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [hintNotification, setHintNotification] = useState<string | null>(null);

  // Timer tracking per question
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Check if hint has already been unlocked for this question
  const isHintUnlocked = progress.unlockedHints?.includes(currentQuestion.id);

  // Reset or initialize state when question changes
  useEffect(() => {
    setUserAnswer('');
    setReason('');
    setHasChecked(false);
    setIsAnswerCorrect(false);
    setHintNotification(null);
    setElapsedSeconds(0);
  }, [currentQuestion.id]);

  // Timer interval: counts elapsedSeconds up while question is unanswered
  useEffect(() => {
    if (hasChecked && isAnswerCorrect) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        if (timerSeconds !== undefined && timerSeconds > 0 && prev >= timerSeconds) {
          return timerSeconds;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasChecked, isAnswerCorrect, timerSeconds, currentQuestion.id]);

  const handleHintClick = () => {
    if (isHintUnlocked) {
      setHintNotification(
        'Petunjuk untuk soal ini sudah pernah digunakan dan tetap tersedia di bawah soal.'
      );
      audioManager.playSfx('click');
      return;
    }

    if (progress.hintTokens <= 0) {
      setHintNotification('Token petunjuk kelompok kalian telah habis. Coba diskusikan bersama tim!');
      audioManager.playSfx('wrong');
      return;
    }

    audioManager.playSfx('hint');
    onUseHint(currentQuestion.id);
  };

  const isFormValid = userAnswer.trim().length > 0 && reason.trim().length > 0;

  const handleCheckAnswer = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      audioManager.playSfx('wrong');
      return;
    }

    const { isCorrect } = verifyAnswer(
      userAnswer,
      currentQuestion.acceptableAnswers,
      currentQuestion.expectedNumericValue,
      { allowNumericEquivalent: currentQuestion.allowNumericEquivalent }
    );

    setHasChecked(true);
    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      audioManager.playSfx('correct');
    } else {
      audioManager.playSfx('wrong');
    }

    onAnswerSubmit(
      currentQuestion.id,
      userAnswer.trim(),
      reason.trim(),
      isCorrect,
      isHintUnlocked,
      elapsedSeconds
    );
  };

  const handleProceed = () => {
    audioManager.playSfx('click');
    if (isLastQuestion) {
      onFinishLevel();
    } else {
      onNextQuestion();
    }
  };

  const progressPercent = ((currentIndex + 1) / total) * 100;

  return (
    <div className="w-full space-y-4">
      {/* Banner Sektor yang Sudah Dituntaskan */}
      {isSectorCompleted && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 p-3.5 text-xs text-amber-900 dark:text-amber-200">
          <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <span className="leading-relaxed">
            <strong>Sektor ini sudah pernah dituntaskan.</strong> Soal yang sudah dijawab benar tidak memberi poin tambahan; soal yang masih salah tetap bisa diperbaiki.
          </span>
        </div>
      )}

      {/* Top Header & Progress */}
      <div className="overflow-hidden rounded-[26px] bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 border border-slate-100 dark:border-slate-800 transition-all">
        {/* Gambar Kartu Tantangan */}
        <GameImage
          src={
            hasChecked && isAnswerCorrect
              ? '/img/jawaban-benar.jpg'
              : hasChecked && !isAnswerCorrect
              ? '/img/jawaban-kurang-tepat.jpg'
              : '/img/kartu-tantangan.jpg'
          }
          alt="Kartu Tantangan"
          caption={`Tantangan ${currentIndex + 1} dari ${total} — Sektor ${currentQuestion.level.toUpperCase()}`}
          aspectRatio="16/9"
          themeType={
            hasChecked && isAnswerCorrect
              ? 'correct'
              : hasChecked && !isAnswerCorrect
              ? 'wrong'
              : 'challenge'
          }
        />

        <div className="p-5 sm:p-7">
          {/* Soal Meta: Nomor Soal, Badge Tingkat, Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Tantangan {currentIndex + 1} dari {total}
              </span>

              <div className="flex items-center gap-2">
                {timerSeconds !== undefined && timerSeconds > 0 && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      Math.max(0, timerSeconds - elapsedSeconds) <= 10
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 animate-pulse'
                        : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300'
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>{Math.max(0, timerSeconds - elapsedSeconds)}s</span>
                  </span>
                )}
                {wasPreviouslyCorrect && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Sudah dijawab benar sebelumnya — tanpa tambahan poin</span>
                  </span>
                )}
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 capitalize">
                  Tingkat {currentQuestion.level}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Keterangan Waktu Habis */}
            {timerSeconds !== undefined &&
              timerSeconds > 0 &&
              elapsedSeconds >= timerSeconds &&
              !(hasChecked && isAnswerCorrect) && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-3 py-2 text-xs font-bold text-amber-800 dark:text-amber-200">
                  <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Waktu habis — bonus waktu hangus</span>
                </div>
              )}
          </div>

          {/* Title & Instruction (Bebas bocoran LaTeX) */}
          <div className="mb-5">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {formatPowerText(currentQuestion.title)}
            </h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {formatPowerText(currentQuestion.instruction)}
            </p>
          </div>

          {/* LaTeX Math Display Card */}
          <div className="my-5 flex flex-col items-center justify-center rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 p-5 border border-indigo-200/60 dark:border-indigo-900/60 text-slate-900 dark:text-white">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1">
              Rumusan Masalah
            </span>
            <div className="text-xl sm:text-2xl font-black py-2">
              <MathView latex={currentQuestion.latexProblem} />
            </div>
          </div>

          {/* Form Input Jawaban & Alasan */}
          <form onSubmit={handleCheckAnswer} className="space-y-4">
            {/* Input Jawaban */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Jawaban Kelompok <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={hasChecked && isAnswerCorrect}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Contoh: 2^5 atau 32 atau a^4"
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition disabled:opacity-75"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Mendukung tanda perkalian (* atau x atau ×) dan simbol pangkat (^ atau 2⁵).
              </p>
            </div>

            {/* Textarea Alasan (Wajib Diisi Sebelum Memeriksa) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Alasan / Cara Kerja Kelompok <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                disabled={hasChecked && isAnswerCorrect}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Berikan alasan jawaban kalian"
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition disabled:opacity-75 resize-none"
              />
            </div>

            {/* Hint Notification Message */}
            {hintNotification && (
              <div className="rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 p-3 text-xs text-sky-800 dark:text-sky-300">
                {hintNotification}
              </div>
            )}

            {/* Petunjuk Terbuka (Tetap Tersedia dan Bebas Bocoran LaTeX) */}
            {isHintUnlocked && (
              <div className="rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-900/60 p-4 transition-all">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs mb-1">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  <span>Petunjuk Transmisi Aria:</span>
                </div>
                <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                  {formatPowerText(currentQuestion.hint)}
                </p>
              </div>
            )}

            {/* Feedback Setelah Pemeriksaan */}
            {hasChecked && (
              <div
                className={`rounded-2xl p-4 border transition-all ${
                  isAnswerCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs mb-1">
                  {isAnswerCorrect ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>
                        {wasPreviouslyCorrect
                          ? 'Poin soal ini sudah diperoleh sebelumnya — tidak ada tambahan poin/energi.'
                          : lastReward
                          ? `Jawaban Benar! +${lastReward.total} Poin (+${lastReward.points} dasar${
                              lastReward.noHintBonus > 0 ? ` +${lastReward.noHintBonus} tanpa petunjuk` : ''
                            }${lastReward.timeBonus > 0 ? ` +${lastReward.timeBonus} bonus waktu` : ''}) & +25 Energi`
                          : `Jawaban Benar! +${currentLevelInfo.pointsPerQuestion} Poin & +25 Energi`}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-rose-600" />
                      <span>
                        Jawaban Kurang Tepat (-{currentLevelInfo.penaltyPerWrong} Poin) — Silakan Coba Lagi
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs leading-relaxed opacity-90 mt-1">
                  {isAnswerCorrect
                    ? formatPowerText(currentQuestion.explanation)
                    : 'Diskusikan kembali bersama tim kalian dan periksa lembar kerja kertas. Petunjuk di atas tetap terbuka untuk memandu langkah perhitungan.'}
                </p>
              </div>
            )}

            {/* Action Buttons: Tombol Petunjuk & Tombol Periksa / Lanjut */}
            <div className="pt-2 flex flex-col gap-2.5">
              {/* Check Answer Button OR Next Button */}
              {!(hasChecked && isAnswerCorrect) ? (
                <div>
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 dark:hover:bg-indigo-500 active:scale-98 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Periksa Jawaban 🔍</span>
                  </button>
                  {!isFormValid && (
                    <p className="mt-1.5 text-center text-[11px] text-slate-500 dark:text-slate-400">
                      Isi jawaban dan alasan/cara kerja kelompok terlebih dahulu.
                    </p>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleProceed}
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 active:scale-98 transition cursor-pointer"
                >
                  <span>
                    {isLastQuestion ? 'Lihat Hasil Misi 🏆' : 'Lanjut Tantangan Berikutnya'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}

              {/* Tombol Petunjuk */}
              {!(hasChecked && isAnswerCorrect) && (
                <button
                  type="button"
                  onClick={handleHintClick}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <span>
                    {isHintUnlocked
                      ? 'Lihat Petunjuk (Sudah Dibuka)'
                      : `Buka Petunjuk (${progress.hintTokens} Token Tersisa)`}
                  </span>
                </button>
              )}
            </div>
          </form>

          {/* Bottom Back Button */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
            <button
              onClick={() => {
                audioManager.playSfx('click');
                onBackToMap();
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Peta Kota</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
