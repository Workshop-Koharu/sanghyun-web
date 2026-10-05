'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Shield, User, LogOut, LogIn, School, BookOpen, Download, Menu, X, Camera, Users } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import SanghyunLogo from './SanghyunLogo';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <SanghyunLogo size={36} />
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

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            aria-label="메뉴 열기"
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-14 left-0 w-full bg-background/95 backdrop-blur-2xl border-b border-border shadow-2xl p-4 space-y-2 animate-in slide-in-from-top-2">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-foreground hover:bg-accent transition-colors"
          >
            <School className="size-4 text-primary" />
            학교 안내
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-foreground hover:bg-accent transition-colors"
          >
            <BookOpen className="size-4 text-primary" />
            학생 포털 대시보드
          </Link>
          <Link
            href="/dashboard?tab=insta"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-foreground hover:bg-accent transition-colors"
          >
            <Camera className="size-4 text-rose-500" />
            상현스타그램 피드
          </Link>
          <Link
            href="/dashboard?tab=friends"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-foreground hover:bg-accent transition-colors"
          >
            <Users className="size-4 text-indigo-400" />
            학우·친구 시스템
          </Link>
          {user?.isAdmin && (
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-warning bg-warning/10 border border-warning/30 transition-colors"
            >
              <Shield className="size-4" />
              교무실 관리자 콘솔
            </Link>
          )}

          <div className="pt-2 border-t border-border/50 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">상현고등학교 공식 스마트 인트라넷</span>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('sanghyun-trigger-pwa-install'));
                }
                setIsMobileMenuOpen(false);
              }}
              className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-bold flex items-center gap-1"
            >
              <Download className="size-3" />
              앱 설치
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
