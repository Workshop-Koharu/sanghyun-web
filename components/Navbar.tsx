'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Shield, User, LogOut, LogIn, School, BookOpen, Settings } from 'lucide-react';

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
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 p-0.5 shadow-lg shadow-indigo-950/50 flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-slate-950/40 rounded-[10px] flex items-center justify-center">
              <School className="w-5 h-5 text-sky-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                상현고등학교
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                SANGHYUN
              </span>
            </div>
            <p className="text-xs text-slate-400 tracking-tight">가상 역할극 학사 포털 시스템</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link
            href="/"
            className="px-3.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            학교 안내
          </Link>
          <Link
            href="/dashboard"
            className="px-3.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            학생 포털
          </Link>
          {user?.isAdmin && (
            <Link
              href="/admin"
              className="px-3.5 py-2 rounded-lg text-amber-300 hover:text-amber-200 hover:bg-amber-950/30 border border-amber-500/20 transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              교무실 관리
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-24 h-9 bg-slate-800/60 animate-pulse rounded-lg" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-7 h-7 rounded-full ring-1 ring-slate-600 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1">
                    {user.username}
                    {user.isAdmin && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded border border-amber-500/30">
                        교직원
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {user.studentId || 'ID: ' + user.userId.slice(-4)}
                  </div>
                </div>
              </div>

              <a
                href="/api/auth/logout"
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 transition-colors"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <a
              href="/api/auth/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-900/30 transition-all hover:shadow-indigo-800/50"
            >
              <LogIn className="w-4 h-4" />
              디스코드 로그인
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
