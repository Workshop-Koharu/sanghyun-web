'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Shield, User, LogOut, LogIn, School, BookOpen, Download, Menu, X, Camera, Users } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import SanghyunLogo from './SanghyunLogo';
import { getDefaultDiscordAvatar } from '@/lib/avatar';

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
    <header className="bg-background/90 sticky top-0 z-50 flex h-14 items-center border-b border-border/70 px-3 sm:px-6 backdrop-blur-xl transition-colors">
      <div className="max-w-[88rem] w-full mx-auto flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 group shrink-0 min-w-0">
          <SanghyunLogo size={30} className="shrink-0" />
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-foreground whitespace-nowrap">
              상현고등학교
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border/60 shrink-0">
              SANGHYUN
            </span>
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

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* PWA Install Button (desktop/tablet, mobile is in drawer) */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('sanghyun-trigger-pwa-install'));
              }
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/25 transition-all active:scale-95 shadow-sm"
            title="상현고 공식 앱 설치하기"
          >
            <Download className="size-3.5" />
            <span>앱 설치</span>
          </button>

          <ThemeToggle />

          {loading ? (
            <div className="w-8 h-8 bg-muted/50 animate-pulse rounded-full" />
          ) : user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/70 text-xs transition-colors"
                title={`${user.username} 학생 포털 바로가기`}
              >
                <div className="size-7 rounded-full overflow-hidden bg-primary/10 shrink-0 flex items-center justify-center border border-border/50">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      referrerPolicy="no-referrer"
                      className="size-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = getDefaultDiscordAvatar(user.userId);
                      }}
                    />
                  ) : (
                    <span className="font-bold text-xs text-primary">
                      {user.username.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block text-left leading-tight max-w-[90px]">
                  <div className="font-bold text-foreground truncate text-xs">{user.username}</div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {user.isAdmin ? '교무 교직원' : user.isStudent ? '재학생' : '방문자'}
                  </div>
                </div>
              </Link>
              <a
                href="/api/auth/logout"
                className="hidden md:flex p-1.5 rounded-xl text-muted-foreground hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/30 transition-colors"
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
              <span>로그인</span>
            </a>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden size-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            {isMobileMenuOpen ? <X className="size-5 text-primary" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-14 bottom-0 bg-background/98 backdrop-blur-2xl z-50 flex flex-col justify-between p-4 overflow-y-auto border-b border-border shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-2">
            {user && (
              <div className="p-3 mb-3 rounded-2xl bg-secondary/80 border border-border flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="size-10 rounded-full overflow-hidden bg-primary/20 shrink-0 border border-primary/30">
                    <img
                      src={user.avatar || getDefaultDiscordAvatar(user.userId)}
                      alt={user.username}
                      referrerPolicy="no-referrer"
                      className="size-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getDefaultDiscordAvatar(user.userId);
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{user.username}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {user.isAdmin ? '교무 교직원' : user.isStudent ? '재학생' : '방문자'}
                    </div>
                  </div>
                </div>
                <a
                  href="/api/auth/logout"
                  className="px-3 py-1.5 rounded-xl text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1"
                >
                  <LogOut className="size-3.5" />
                  로그아웃
                </a>
              </div>
            )}

            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-foreground hover:bg-accent transition-colors"
            >
              <School className="size-4 text-primary" />
              학교 안내 (홈)
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-foreground hover:bg-accent transition-colors"
            >
              <BookOpen className="size-4 text-primary" />
              학생 포털 대시보드
            </Link>
            <Link
              href="/dashboard?tab=insta"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-foreground hover:bg-accent transition-colors"
            >
              <Camera className="size-4 text-rose-500" />
              상현스타그램 피드
            </Link>
            <Link
              href="/dashboard?tab=friends"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-foreground hover:bg-accent transition-colors"
            >
              <Users className="size-4 text-indigo-400" />
              학우·친구 시스템
            </Link>
            {user?.isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-warning bg-warning/10 border border-warning/30 transition-colors"
              >
                <Shield className="size-4" />
                교무실 관리자 콘솔
              </Link>
            )}
          </div>

          <div className="pt-4 border-t border-border/70 flex items-center justify-between mt-auto">
            <span className="text-[11px] text-muted-foreground">상현고등학교 공식 스마트 인트라넷</span>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('sanghyun-trigger-pwa-install'));
                }
                setIsMobileMenuOpen(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Download className="size-3.5" />
              앱 설치
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
