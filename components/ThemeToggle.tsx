'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
      if (stored === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) {
    return <div className="size-8 rounded-xl" />;
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="화면 테마 모드 전환"
      className="size-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground bg-secondary/80 hover:bg-accent/80 border border-border/70 transition-all active:scale-95"
    >
      {theme === 'dark' ? (
        <Sun className="size-4 text-amber-400" />
      ) : (
        <Moon className="size-4 text-primary" />
      )}
    </button>
  );
}
