'use client';

import { useEffect, useState } from 'react';
import { Download, Smartphone, Monitor, X, Sparkles, Share, MoreVertical, ExternalLink, CheckCircle2 } from 'lucide-react';
import SanghyunLogo from './SanghyunLogo';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker with automatic update check
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.update().catch(() => {});
        })
        .catch((err) => {
          console.error('Service Worker registration failed:', err);
        });
    }

    // 2. Check if already installed in standalone mode
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      if (isStandalone) {
        setIsInstalled(true);
        return;
      }

      // Check device environment
      const ua = navigator.userAgent || '';
      const mobileCheck = /Android|iPhone|iPad|iPod/i.test(ua);
      const iosCheck = /iPhone|iPad|iPod/i.test(ua);
      const inAppCheck = /KAKAOTALK|NAVER|Instagram|Discord|Line|Whale/i.test(ua);

      setIsMobile(mobileCheck);
      setIsIos(iosCheck);
      setIsInAppBrowser(inAppCheck);

      // Check if user dismissed recently
      const lastDismissed = localStorage.getItem('sanghyun_pwa_dismissed');
      if (lastDismissed) {
        const timeDiff = Date.now() - parseInt(lastDismissed, 10);
        if (timeDiff < 24 * 60 * 60 * 1000) {
          setDismissed(true);
        }
      }

      // Listen for Chrome beforeinstallprompt (both mobile and desktop)
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsInstallable(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      window.addEventListener('appinstalled', () => {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        setShowGuideModal(false);
      });

      const handleTrigger = () => {
        setDismissed(false);
        if (deferredPrompt) {
          deferredPrompt.prompt().catch(() => {
            setShowGuideModal(true);
          });
        } else {
          setShowGuideModal(true);
        }
      };

      window.addEventListener('sanghyun-trigger-pwa-install', handleTrigger);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('sanghyun-trigger-pwa-install', handleTrigger);
      };
    }
  }, [deferredPrompt]);

  async function handleInstallClick() {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
        setIsInstallable(false);
        return;
      } catch (err) {
        console.error('Install prompt error:', err);
      }
    }

    // If native prompt is not available, show visual guide modal
    setShowGuideModal(true);
  }

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem('sanghyun_pwa_dismissed', Date.now().toString());
  }

  if (isInstalled) return null;

  return (
    <>
      {/* Floating Install Prompt Banner (Visible on Mobile & Desktop) */}
      {!dismissed && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900/95 via-indigo-950/95 to-slate-900/95 border border-indigo-500/30 text-white shadow-2xl backdrop-blur-md flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="size-11 sm:size-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 overflow-hidden border border-blue-400/40">
                <img src="/icons/icon-192.png" alt="App Icon" className="size-full object-cover" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs tracking-tight text-white flex items-center gap-1 truncate">
                  상현고 공식 앱 설치
                  <Sparkles className="size-3 text-amber-400 shrink-0" />
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                {isMobile
                  ? '홈 화면에 설치하고 실시간 학생증 바로 열기'
                  : '데스크톱 앱으로 설치하여 언제든 빠르게 접속'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1 transition-all active:scale-95"
              >
                <Download className="size-3.5" />
                <span>설치</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="닫기"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 220. 모바일/데스크톱 앱 설치 가이드 모달 */}
      {showGuideModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <SanghyunLogo size={24} />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  상현고 공식 앱 설치 가이드
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            {isInAppBrowser ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ExternalLink className="size-4" />
                    외부 브라우저로 열기 필요
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    디스코드/카카오톡 등 인앱 브라우저에서는 홈 화면 추가 기능이 제한됩니다.
                  </p>
                </div>
                <div className="space-y-2 text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="size-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <span>화면 우측 상단 또는 하단의 <strong>[⋮]</strong> 또는 <strong>[···]</strong> 메뉴를 터치합니다.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="size-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <span><strong>[다른 브라우저로 열기]</strong> (Chrome 또는 Safari)를 선택합니다.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="size-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    <span>열린 브라우저에서 [앱 설치]를 누르면 즉시 설치됩니다.</span>
                  </div>
                </div>
              </div>
            ) : isIos ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Share className="size-4" />
                    아이폰 / 아이패드 사파리(Safari)
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    사파리 브라우저의 공유 기능을 통해 홈 화면에 앱으로 추가할 수 있습니다.
                  </p>
                </div>
                <div className="space-y-2.5 text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="size-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <span>사파리 화면 하단 중앙의 <strong>[공유]</strong> 버튼 (네모에 위 화살표 아이콘)을 터치합니다.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="size-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <span>공유 메뉴 목록을 아래로 스크롤하여 <strong>[홈 화면에 추가]</strong>를 터치합니다.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="size-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    <span>우측 상단의 <strong>[추가]</strong>를 누르면 홈 화면에 상현고 앱이 설치됩니다!</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Smartphone className="size-4" />
                    안드로이드 크롬 / 삼성인터넷
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    브라우저 메뉴를 통해 전체화면 앱으로 간편하게 설치하실 수 있습니다.
                  </p>
                </div>
                <div className="space-y-2.5 text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="size-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <span>브라우저 우측 상단 또는 하단의 <strong>[⋮]</strong> (더보기 메뉴)를 터치합니다.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="size-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <span>메뉴에서 <strong>[앱 설치]</strong> 또는 <strong>[현재 페이지 추가 &gt; 홈 화면]</strong>을 터치합니다.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="size-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    <span>바탕화면에 생성된 아이콘을 터치하여 바로 스마트 학생증을 사용하세요!</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              확인했습니다
            </button>
          </div>
        </div>
      )}
    </>
  );
}
