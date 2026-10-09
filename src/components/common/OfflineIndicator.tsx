import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-500/95 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-xs border border-amber-300/40">
      <WifiOff className="h-3.5 w-3.5 animate-pulse" />
      <span>Mode Offline — Data tersimpan di penyimpanan lokal</span>
    </div>
  );
};
