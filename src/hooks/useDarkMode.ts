import { useEffect, useState } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('theme_mode');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('theme_mode', next ? 'dark' : 'light');
      } catch {
        // ignore localStorage errors
      }
      return next;
    });
  };

  return { isDark, toggleDarkMode };
}
