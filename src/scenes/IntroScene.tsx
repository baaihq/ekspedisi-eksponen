import React, { useState } from 'react';
import { ChevronRight, SkipForward } from 'lucide-react';
import { INTRO_DIALOGUES } from '../data/dialogues';
import { audioManager } from '../audio/audioManager';
import { GameImage } from '../components/common/GameImage';

interface IntroSceneProps {
  onComplete: () => void;
}

export const IntroScene: React.FC<IntroSceneProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentDialogue = INTRO_DIALOGUES[currentIndex] || INTRO_DIALOGUES[0];
  const isLast = currentIndex === INTRO_DIALOGUES.length - 1;

  const handleNext = () => {
    audioManager.playSfx('click');
    if (isLast) {
      audioManager.playSfx('level_select');
      onComplete();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    audioManager.playSfx('click');
    onComplete();
  };

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-[26px] bg-white shadow-xl shadow-slate-200/50 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 transition-all">
        {/* Visual Novel Background / Scene Graphic */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-950">
          <GameImage
            src={currentDialogue.backgroundImage || '/img/peta-kota.jpg'}
            alt="Kota Data"
            aspectRatio="16/9"
            themeType="city"
            className="h-full w-full object-cover opacity-75"
          />

          {/* Top Skip Button */}
          <div className="absolute top-3 right-3 z-20">
            <button
              onClick={handleSkip}
              className="flex items-center gap-1 rounded-full bg-slate-950/60 backdrop-blur-md px-3 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-950/80 transition cursor-pointer"
            >
              <span>Lewati</span>
              <SkipForward className="h-3 w-3" />
            </button>
          </div>

          {/* Character Avatar Overlay */}
          <div className="absolute bottom-3 left-4 z-20 flex items-end gap-3">
            <div className="relative h-18 w-18 sm:h-20 sm:w-20 overflow-hidden rounded-2xl border-2 border-indigo-400 bg-slate-900 shadow-xl">
              <GameImage
                src={currentDialogue.characterImage || '/img/karakter-pendamping.jpg'}
                alt={currentDialogue.speaker}
                aspectRatio="1/1"
                themeType="companion"
                className="h-full w-full"
              />
            </div>
            <div className="mb-1 rounded-full bg-indigo-900/90 backdrop-blur-md border border-indigo-400/40 px-3 py-1 text-xs font-bold text-white shadow-md">
              {currentDialogue.speaker}
            </div>
          </div>
        </div>

        {/* Dialog Content Box */}
        <div className="p-5 sm:p-7">
          {/* Progress Bar & Counter */}
          <div className="mb-4 flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Transmisi Pesan</span>
            <span>
              {currentIndex + 1} dari {INTRO_DIALOGUES.length}
            </span>
          </div>

          {/* Progress Indicator Dots */}
          <div className="mb-4 flex gap-1.5">
            {INTRO_DIALOGUES.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i <= currentIndex
                    ? 'bg-indigo-600 dark:bg-indigo-400'
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>

          {/* Dialogue Text */}
          <div className="min-h-[90px] rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700/60">
            <p className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-100">
              "{currentDialogue.text}"
            </p>
          </div>

          {/* Action Button: Lanjut */}
          <button
            onClick={handleNext}
            className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 dark:hover:bg-indigo-500 active:scale-98 transition cursor-pointer"
          >
            <span>{isLast ? 'Masuk ke Peta Kota 🗺️' : 'Lanjut'}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
