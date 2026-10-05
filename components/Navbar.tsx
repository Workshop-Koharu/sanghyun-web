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
    <header className="bg-background/70 sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border/70 px-4 backdrop-blur-xl lg:px-8 transition-colors">
      <div className="max-w-[88rem] w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white shadow-md shadow-primary/25 transition-transform group-hover:scale-105">
            <School className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-foreground">
                상현고등학교
              </span>
              <span className="text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border/60">
                SANGHYUN
              </span>
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
          >
            학교 안내
          </Link>
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="size-3.5 text-primary" />
            학생 포털
          </Link>
          {user?.isAdmin && (
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-xl text-warning bg-warning/10 hover:bg-warning/20 border border-warning/30 transition-colors flex items-center gap-1.5"
            >
              <Shield className="size-3.5" />
              교무실 콘솔
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/25 transition-all active:scale-95 shadow-sm"
            title="상현고 공식 앱 설치하기"
          >
            <Download className="size-3.5" />
            <span className="hidden sm:inline">앱 설치</span>
          </button>
          <ThemeToggle />

          {loading ? (
            <div className="w-20 h-8 bg-muted/50 animate-pulse rounded-xl" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-secondary/80 border border-border/70 text-xs">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="size-6 rounded-full" />
                ) : (
                  <div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                    {user.username.charAt(0)}
                  </div>
                )}
                <div className="hidden sm:block text-left leading-tight">
                  <div className="font-bold text-foreground truncate max-w-[100px]">{user.username}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {user.isAdmin ? '교무 교직원' : user.isStudent ? '재학생' : '방문자'}
                  </div>
                </div>
              </div>
              <a
                href="/api/auth/logout"
                className="p-1.5 rounded-xl text-muted-foreground hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/30 transition-colors"
                title="로그아웃"
              >
                <LogOut className="size-4" />
              </a>
            </div>
          ) : (
            <a
              href="/api/auth/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-all active:scale-95"
            >
              <LogIn className="size-3.5" />
              로그인
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
