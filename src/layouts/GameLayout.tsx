import React, { useState } from 'react';
import { Volume2, VolumeX, Moon, Sun, GraduationCap, ShieldCheck } from 'lucide-react';
import { PWAInstallButton } from '../components/common/PWAInstallButton';
import { OfflineIndicator } from '../components/common/OfflineIndicator';
import { SyncStatusBanner } from '../components/common/SyncStatusBanner';
import { audioManager } from '../audio/audioManager';
import { useDarkMode } from '../hooks/useDarkMode';

interface GameLayoutProps {
  children: React.ReactNode;
  onOpenTeacherMode?: () => void;
  isTeacherMode?: boolean;
}

export const GameLayout: React.FC<GameLayoutProps> = ({
  children,
  onOpenTeacherMode,
  isTeacherMode = false,
}) => {
  const [isMuted, setIsMuted] = useState(() => audioManager.getMuted());
  const { isDark, toggleDarkMode } = useDarkMode();

  const handleAudioToggle = () => {
    audioManager.unlockAudio();
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-start antialiased selection:bg-indigo-500 selection:text-white pb-12">
      {/* Offline Connectivity Notification */}
      <OfflineIndicator />

      {/* Cloud Sync Status Notification */}
      <SyncStatusBanner />

      {/* Top Header: Putih Transparan dengan Efek Blur */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-14 w-full max-w-[560px] items-center justify-between px-4">
          {/* Logo & Game Title */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 dark:bg-indigo-600 text-white font-black text-xs shadow-xs">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="block text-xs font-black tracking-tight text-slate-900 dark:text-white leading-none">
                EKSPEDISI EKSPONEN
              </span>
              <span className="block text-[10px] font-medium text-indigo-600 dark:text-indigo-400 leading-tight">
                Kota Data • Bab 1
              </span>
            </div>
          </div>

          {/* Controls: Audio Mute, DarkMode, PWA, Teacher Mode */}
          <div className="flex items-center gap-1.5">
            {/* In-App PWA Install */}
            <PWAInstallButton />

            {/* Audio Toggle */}
            <button
              onClick={handleAudioToggle}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
            >
              {isMuted ? (
                <VolumeX className="h-3.5 w-3.5 text-rose-500" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              title={isDark ? 'Mode Terang' : 'Mode Gelap'}
            >
              {isDark ? (
                <Sun className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-slate-600" />
              )}
            </button>

            {/* Teacher Dashboard Trigger */}
            {onOpenTeacherMode && (
              <button
                onClick={onOpenTeacherMode}
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition cursor-pointer ${
                  isTeacherMode
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
                title="Mode Guru"
              >
                <GraduationCap className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container: Mobile-First Max-Width 448-560px */}
      <main className="w-full max-w-[540px] px-3.5 sm:px-4 py-4 sm:py-6">
        {children}
      </main>
    </div>
  );
};
