import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { KnowledgeCard, getEpisodeCards } from '../data/cards';
import { getEpisode } from '../data/episodes';
import { audioManager } from '../audio/audioManager';

interface CollectionSceneProps {
  unlockedCards: string[];
  activeEpisodeId: string;
  onBackToMap: () => void;
}

const getLockedText = (card: KnowledgeCard) => {
  if (card.level === 'cinta') {
    return 'Tuntaskan seluruh episode ini untuk membuka.';
  }
  const levelName = card.level
    ? card.level.charAt(0).toUpperCase() + card.level.slice(1)
    : 'ini';
  return `Selesaikan tingkat ${levelName} untuk membuka.`;
};

export const CollectionScene: React.FC<CollectionSceneProps> = ({
  unlockedCards,
  activeEpisodeId,
  onBackToMap,
}) => {
  const cards = getEpisodeCards(activeEpisodeId);
  const currentEpisode = getEpisode(activeEpisodeId);
  const [selectedCard, setSelectedCard] = useState<KnowledgeCard | null>(() => {
    const firstUnlocked = cards.find((c) => unlockedCards.includes(c.id));
    return firstUnlocked || cards[0];
  });

  const unlockedCount = cards.filter((c) => unlockedCards.includes(c.id)).length;

  return (
    <div className="w-full space-y-4">
      {/* Header Kartu Koleksi */}
      <div className="overflow-hidden rounded-[26px] bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 border border-slate-100 dark:border-slate-800 p-5 sm:p-6 transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Koleksi Kartu Pengetahuan
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Bab {currentEpisode?.episodeNumber || 1}: {currentEpisode?.title || 'Kota Data'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
              {unlockedCount} / {cards.length} Terbuka
            </span>
          </div>
        </div>

        {/* Grid List Kartu */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cards.map((card) => {
            const isUnlocked = unlockedCards.includes(card.id);
            const isSelected = selectedCard?.id === card.id;

            return (
              <div
                key={card.id}
                onClick={() => {
                  audioManager.playSfx('click');
                  setSelectedCard(card);
                }}
                className={`relative flex flex-col p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                } ${!isUnlocked ? 'opacity-75' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {card.emoji && <span className="text-sm">{card.emoji}</span>}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        card.level === 'cinta'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {card.topic}
                    </span>
                  </div>
                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" />
                      Terbuka
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      <Lock className="h-3 w-3" />
                      Terkunci
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {card.subtitle}
                </p>

                {!isUnlocked && (
                  <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-400 italic">
                    {getLockedText(card)}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail Kartu Terpilih */}
        {selectedCard && (
          <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Pratinjau Materi Kartu
                </span>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {selectedCard.topic}
              </span>
            </div>

            {unlockedCards.includes(selectedCard.id) ? (
              <div className="space-y-3">
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  {selectedCard.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {selectedCard.content}
                </p>
                <div className="rounded-xl bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 p-3 text-xs sm:text-sm font-mono text-indigo-900 dark:text-indigo-200">
                  {selectedCard.example}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                  <Lock className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Kartu Ini Masih Terkunci
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {getLockedText(selectedCard)} Kembali ke Peta Kota dan tuntaskan tantangan sektor untuk membuka kartu ini.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tombol Kembali ke Peta */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
          <button
            onClick={() => {
              audioManager.playSfx('click');
              onBackToMap();
            }}
            className="flex items-center gap-2 rounded-2xl bg-slate-900 dark:bg-indigo-600 px-6 py-3 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-indigo-500 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Peta Kota</span>
          </button>
        </div>
      </div>
    </div>
  );
};
