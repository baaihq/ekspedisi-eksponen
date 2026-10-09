import React, { useEffect, useState } from 'react';
import { CloudOff, X } from 'lucide-react';
import { syncService, SyncState } from '../../services/syncService';

export const SyncStatusBanner: React.FC = () => {
  const [syncState, setSyncState] = useState<SyncState>(syncService.getSyncState());
  const [errorMessage, setErrorMessage] = useState<string | null>(syncService.getLastError());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const unsubscribe = syncService.onSyncStateChange((state, err) => {
      setSyncState(state);
      setErrorMessage(err);
      if (state === 'error') {
        setDismissed(false);
      }
    });

    return unsubscribe;
  }, []);

  if (syncState !== 'error' || dismissed || !errorMessage) {
    return null;
  }

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-amber-500/95 dark:bg-amber-600/95 backdrop-blur-md px-4 py-2.5 text-white shadow-xl shadow-amber-900/20 text-xs">
        <div className="flex items-center gap-2">
          <CloudOff className="h-4 w-4 shrink-0" />
          <span className="leading-snug">
            <strong>Sinkronisasi Cloud Tertunda:</strong> {errorMessage}. Data tersimpan aman di memori lokal perangkat.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="rounded-lg p-1 hover:bg-white/20 transition cursor-pointer shrink-0"
          title="Tutup pemberitahuan"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
