'use client';

import { useEffect, useState } from 'react';
import { Download, Smartphone, Monitor, X, Sparkles } from 'lucide-react';

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

    // 2. Check if already installed
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      if (isStandalone) {
        setIsInstalled(true);
        return;
      }

      // Check device type
      setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

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
      });

      const handleTrigger = () => {
        setDismissed(false);
        if (deferredPrompt) {
          deferredPrompt.prompt();
        } else {
          alert('크롬 브라우저 우측 상단 메뉴(⋮)에서 [홈 화면에 추가] 또는 주소창 우측 [앱 설치]를 선택하여 설치하실 수 있습니다.');
        }
      };

      window.addEventListener('sanghyun-trigger-pwa-install', handleTrigger);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('sanghyun-trigger-pwa-install', handleTrigger);
      };
    }
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) {
      alert('크롬 브라우저 상단 주소창 우측의 [설치] 버튼(🖥️ 또는 📲)을 클릭하여 설치하실 수 있습니다.');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (err) {
      console.error('Install prompt error:', err);
    }
  }

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem('sanghyun_pwa_dismissed', Date.now().toString());
  }

  if (isInstalled) return null;

  // Render floating sticky install card if installable or not dismissed
  return (
    <>
      {/* Floating Install Prompt Banner (Visible on Mobile & Desktop) */}
      {!dismissed && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/95 via-indigo-950/95 to-slate-900/95 border border-indigo-500/30 text-white shadow-2xl backdrop-blur-md flex items-center gap-3.5">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 overflow-hidden border border-blue-400/40">
                <img src="/icons/icon-192.png" alt="App Icon" className="w-full h-full object-cover" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs tracking-tight text-white flex items-center gap-1">
                  상현고 공식 앱 설치
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                {isMobile
                  ? '홈 화면에 설치하고 실시간 학생증 바로 열기'
                  : '데스크톱 앱으로 설치하여 언제든 빠르게 접속'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1 transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>설치</span>
              </button>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
