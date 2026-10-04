'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Shield, User, LogOut, LogIn, School, BookOpen, Download } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface UserSession {
  userId: string;
  username: string;
  avatar: string | null;
  isAdmin: boolean;
  isStudent: boolean;
  studentId?: string | null;
}

export default function Navbar() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me', {
          cache: 'no-store',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.authenticated && data.user) {
              setUser(data.user);
            } else {
              setUser(null);
            }
          }
        } else {
          if (isMounted) setUser(null);
        }
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white shadow-sm">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                상현고등학교
              </span>
              <span className="text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                SANGHYUN
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">학사 관리 포털</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
          >
            학교 안내
          </Link>
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-blue-500" />
            학생 포털
          </Link>
          {user?.isAdmin && (
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-lg text-amber-700 hover:text-amber-800 hover:bg-amber-50 dark:text-amber-300 dark:hover:text-amber-200 dark:hover:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4 text-amber-500" />
              교무실 관리
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('sanghyun-trigger-pwa-install'));
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/60 transition-all active:scale-95 shadow-sm"
            title="상현고 공식 앱 설치하기"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">앱 설치</span>
          </button>
          <ThemeToggle />

          {loading ? (
            <div className="w-20 h-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    {user.username}
                    {user.isAdmin && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 px-1 rounded font-medium">
                        교직원
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <a
                href="/api/auth/logout"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/30 transition-colors"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <a
              href="/api/auth/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              디스코드 로그인
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
