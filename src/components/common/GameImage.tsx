import React, { useState } from 'react';

interface GameImageProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  aspectRatio?: '16/9' | '4/3' | '1/1' | '21/9' | '3/2';
  themeType?:
    | 'city'
    | 'generator'
    | 'generator_active'
    | 'fragment'
    | 'companion'
    | 'challenge'
    | 'sensor'
    | 'correct'
    | 'wrong'
    | 'team';
}

export const GameImage: React.FC<GameImageProps> = ({
  src,
  alt,
  caption,
  className = '',
  aspectRatio = '16/9',
  themeType = 'city',
}) => {
  const [loadFailed, setLoadFailed] = useState(false);

  // Aspect ratio classes
  const aspectClass =
    aspectRatio === '16/9'
      ? 'aspect-[16/9]'
      : aspectRatio === '4/3'
      ? 'aspect-[4/3]'
      : aspectRatio === '1/1'
      ? 'aspect-square'
      : aspectRatio === '3/2'
      ? 'aspect-[3/2]'
      : 'aspect-[21/9]';

  return (
    <div
      className={`relative w-full overflow-hidden bg-slate-900 ${aspectClass} ${className}`}
    >
      {!loadFailed ? (
        <img
          src={src}
          alt={alt}
          onError={() => setLoadFailed(true)}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          referrerPolicy="no-referrer"
        />
      ) : (
        <ThematicSvgIllustration type={themeType} label={alt} />
      )}

      {/* Gradient Overlay for Caption */}
      {caption && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-3 pt-6">
          <p className="text-xs font-semibold tracking-wide text-white drop-shadow-md">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Rich inline vector illustration when static images are loading or fallbacks
 */
function ThematicSvgIllustration({
  type,
  label,
}: {
  type: string;
  label: string;
}) {
  switch (type) {
    case 'generator_active':
      return (
        <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-900 to-cyan-950 p-6 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.25)_0%,transparent_70%)] animate-pulse" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-emerald-400 bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
              <span className="text-3xl">⚡</span>
            </div>
            <span className="text-sm font-bold text-emerald-300">GENERATOR AKTIF 100%</span>
            <span className="text-[11px] text-slate-300">Energi Berpangkat Terdistribusi</span>
          </div>
        </div>
      );

    case 'generator':
      return (
        <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-amber-950 p-6 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.2)_0%,transparent_70%)]" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-amber-400 bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              <span className="text-3xl">⚙️</span>
            </div>
            <span className="text-sm font-bold text-amber-300">GENERATOR PERKALIAN</span>
            <span className="text-[11px] text-slate-300">Menunggu Reaktivasi Eksponen</span>
          </div>
        </div>
      );

    case 'fragment':
      return (
        <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 p-6 text-center">
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-cyan-400 bg-cyan-500/20 shadow-[0_0_25px_rgba(6,182,212,0.6)]">
              <span className="text-3xl">💎</span>
            </div>
            <span className="text-sm font-bold text-cyan-300">FRAGMEN INTI REAKTOR</span>
            <span className="text-[11px] text-slate-300">Modul Daya Utama Pulih</span>
          </div>
        </div>
      );

    case 'correct':
      return (
        <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 p-4 text-center">
          <div className="flex flex-col items-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-500/20">
              <span className="text-2xl">✨</span>
            </div>
            <span className="text-sm font-bold text-emerald-300">Kalkulasi Tepat!</span>
            <span className="text-[11px] text-slate-300">Aliran Daya Tersambung</span>
          </div>
        </div>
      );

    case 'wrong':
      return (
        <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-950 via-slate-900 to-orange-950 p-4 text-center">
          <div className="flex flex-col items-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-500/20">
              <span className="text-2xl">🔍</span>
            </div>
            <span className="text-sm font-bold text-amber-300">Perlu Penyesuaian</span>
            <span className="text-[11px] text-slate-300">Periksa Kembali Pola Perkalian</span>
          </div>
        </div>
      );

    case 'companion':
      return (
        <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-950 via-slate-900 to-indigo-950 p-4 text-center">
          <div className="flex flex-col items-center">
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full border-2 border-sky-400 bg-sky-500/20 shadow-[0_0_20px_rgba(56,189,248,0.4)]">
              <span className="text-3xl">🤖</span>
            </div>
            <span className="text-sm font-bold text-sky-300">Aria - Asisten Navigasi</span>
            <span className="text-[11px] text-slate-300">Pendamping Ekspedisi</span>
          </div>
        </div>
      );

    default:
      return (
        <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-center">
          <div className="flex flex-col items-center">
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-400/40 bg-indigo-500/10">
              <span className="text-3xl">🏙️</span>
            </div>
            <span className="text-sm font-bold text-indigo-300 tracking-wider">KOTA DATA</span>
            <span className="text-[11px] text-slate-400">{label || 'Sistem Jaringan Terpadu'}</span>
          </div>
        </div>
      );
  }
}
