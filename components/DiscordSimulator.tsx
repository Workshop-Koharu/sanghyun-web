'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  CalendarCheck,
  Flame,
  Clock,
  Camera,
  BookOpen,
  Dices,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Award,
  Terminal,
  MousePointer,
  Keyboard,
  Plus,
} from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  hint: string;
  icon: any;
  channel: string;
  command: string;
}

const TABS: TabItem[] = [
  {
    id: 'attendance',
    label: '출석',
    hint: '먼저 출석할수록 보상이 커져요',
    icon: CalendarCheck,
    channel: '출석체크',
    command: '/출석 체크',
  },
  {
    id: 'streak',
    label: '연속 출석',
    hint: '갈수록 진화하는 불꽃',
    icon: Flame,
    channel: '출석체크',
    command: '/출석 출석부',
  },
  {
    id: 'timetable',
    label: '시간표',
    hint: '10개 반 100% 무충돌 수업',
    icon: Clock,
    channel: '시간표',
    command: '/학교 시간표',
  },
  {
    id: 'insta',
    label: '상현스타',
    hint: '학생들의 생생한 일상 피드',
    icon: Camera,
    channel: '상현스타',
    command: '/인스타 피드',
  },
  {
    id: 'card',
    label: '학생증',
    hint: '바코드·NFC 디지털 학생증',
    icon: BookOpen,
    channel: '학적부',
    command: '/학교 학생증',
  },
  {
    id: 'dice',
    label: '주사위',
    hint: '3D 텀블링 애니메이션 주사위',
    icon: Dices,
    channel: '게임방',
    command: '/경제 주사위',
  },
];

export default function DiscordSimulator() {
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const [chatEntries, setChatEntries] = useState<any[]>([]);
  const [cursorPos, setCursorPos] = useState({ x: 40, y: 40, visible: false, click: 0 });
  const [showSlashPopup, setShowSlashPopup] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const tabButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const inputRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const curTab = TABS[activeTabIdx];

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatEntries, botTyping]);

  // Trigger reply content
  const getBotReply = useCallback((command: string) => {
    switch (command) {
      case '/출석 체크':
        return (
          <div className="rounded-xl bg-[#2b2d31] border-l-4 border-amber-500 p-4 space-y-3 text-white max-w-lg shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-amber-400">🔥 출석 완료! 7일 연속</span>
            </div>
            <p className="text-xs text-[#dbdee1]">
              오늘 순위 <b>3등</b> 보상과 연속 출석 보너스를 받았습니다.
            </p>
            {/* Hexagon badges 1-7 */}
            <div className="flex items-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <div
                  key={num}
                  className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center font-black text-xs text-amber-300"
                >
                  {num}
                </div>
              ))}
            </div>
            <p className="text-xs font-mono text-emerald-400 font-bold">
              +350 코인 · 연속 출석 보너스 +200 코인 지급
            </p>
            {/* Achievement Card */}
            <div className="p-2.5 rounded-lg bg-[#1e1f22] border border-[#3f4147] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">업적 달성 • 일주일의 약속</span>
                <span className="text-[11px] text-[#949ba4]">7일 연속 출석 달성 · 보상 +500 코인</span>
              </div>
            </div>
          </div>
        );

      case '/출석 출석부':
        return (
          <div className="rounded-xl bg-[#2b2d31] border-l-4 border-rose-500 p-4 space-y-3 text-white max-w-lg shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-500" />
                하늘 학생의 7일 연속 출석 기록부
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold">
                연속 개근 중
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center py-1">
              {['월', '화', '수', '목', '금', '토', '일'].map((day, i) => (
                <div key={i} className="p-1.5 rounded-lg bg-[#1e1f22] border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-[#949ba4] block">{day}</span>
                  <span className="text-xs">🔥</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#949ba4]">
              다음 개근상 보너스까지 <b>23일</b> 남았습니다.
            </p>
          </div>
        );

      case '/학교 시간표':
        return (
          <div className="rounded-xl bg-[#2b2d31] border-l-4 border-blue-500 p-4 space-y-3 text-white max-w-lg shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-sm font-bold text-white">📅 1학년 3반 수요일 정규 시간표</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold">
                100% 무충돌 배정
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>1교시 (09:00)</span>
                <span className="font-bold text-blue-300">국어 · 박서연 선생님</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>2교시 (10:00)</span>
                <span className="font-bold text-emerald-300">수학 · 플레어 선생님</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>3교시 (11:00)</span>
                <span className="font-bold text-purple-300">영어 · SeonA 선생님</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>4교시 (12:00)</span>
                <span className="font-bold text-amber-300">한국사 · Koharu 선생님</span>
              </div>
              <div className="flex justify-between py-1 text-[#949ba4]">
                <span>점심시간 (12:50~13:50)</span>
                <span>🍱 기장밥 & 수제등심돈까스</span>
              </div>
            </div>
          </div>
        );

      case '/인스타 피드':
        return (
          <div className="rounded-xl bg-[#2b2d31] border-l-4 border-pink-500 p-4 space-y-3 text-white max-w-lg shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center text-xs font-bold">
                서
              </div>
              <div>
                <span className="text-xs font-bold text-white block">박서연 (2학년 3반)</span>
                <span className="text-[10px] text-[#949ba4]">상현스타 최신 피드</span>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden border border-white/10 aspect-video bg-black/20">
              <img
                src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop"
                alt="인스타"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-[#dbdee1]">
              상현고 벚꽃 필 무렵 교정 산책 🌸 다들 이번 중간고사 화이팅! <span className="text-pink-400">#상현고 #일상</span>
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs text-[#949ba4]">
              <span className="text-pink-400 font-bold">❤️ 좋아요 28개</span>
              <span>💬 댓글 5개</span>
            </div>
          </div>
        );

      case '/학교 학생증':
        return (
          <div className="rounded-xl bg-[#2b2d31] border-l-4 border-indigo-500 p-4 space-y-3 text-white max-w-lg shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-mono uppercase text-indigo-400 font-bold">
                SANGHYUN HIGH SCHOOL DIGITAL PASS
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">● NFC ACTIVE</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-lg font-black">
                하
              </div>
              <div>
                <h4 className="text-base font-extrabold text-white">하늘 학생</h4>
                <p className="text-xs text-indigo-300 font-semibold">1학년 2반 15번 • 학번 SH2026102</p>
                <p className="text-[11px] text-[#949ba4]">소속 동아리: 교내 방송부</p>
              </div>
            </div>
            <div className="p-2 rounded bg-white text-center">
              <span className="font-mono text-xs font-bold text-slate-900 tracking-widest">
                ||| | |||| | ||| ||||||| | ||
              </span>
            </div>
          </div>
        );

      case '/경제 주사위':
      default:
        return (
          <div className="rounded-xl bg-[#2b2d31] border-l-4 border-emerald-500 p-4 space-y-3 text-white max-w-lg shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-emerald-400">🎲 주사위 굴리기 승리!</span>
            </div>
            <div className="p-3 rounded-lg bg-[#1e1f22] border border-[#3f4147] text-center space-y-1">
              <span className="text-3xl font-black text-amber-400">[6]</span>
              <p className="text-xs text-emerald-400 font-bold">예측 숫자 6 적중! (배당: 5.5배)</p>
            </div>
            <p className="text-xs font-mono text-emerald-400">
              상금 +450 코인 지급 · 현재 잔액: 3,420 코인
            </p>
          </div>
        );
    }
  }, []);

  // Manual Trigger
  const handleSelectTabManual = (idx: number) => {
    setActiveTabIdx(idx);
    const tab = TABS[idx];
    setChatEntries((prev) => [
      ...prev,
      { id: Date.now(), user: '하늘', command: tab.command },
      { id: Date.now() + 1, isBot: true, node: getBotReply(tab.command) },
    ]);
  };

  // Auto Mode simulation loop
  useEffect(() => {
    if (mode !== 'auto' || isPaused) return;

    let isMounted = true;
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    async function runStep() {
      if (!isMounted) return;

      const tab = TABS[activeTabIdx];
      const targetBtn = tabButtonsRef.current[activeTabIdx];
      const containerRect = containerRef.current?.getBoundingClientRect();

      // 1. Move cursor to tab button
      if (targetBtn && containerRect) {
        const btnRect = targetBtn.getBoundingClientRect();
        setCursorPos({
          visible: true,
          x: btnRect.left - containerRect.left + btnRect.width / 2,
          y: btnRect.top - containerRect.top + btnRect.height / 2,
          click: 0,
        });
      }

      await sleep(700);
      if (!isMounted) return;

      // Click tab
      setCursorPos((prev) => ({ ...prev, click: prev.click + 1 }));
      await sleep(350);

      // Move cursor to input box
      if (inputRef.current && containerRect) {
        const inpRect = inputRef.current.getBoundingClientRect();
        setCursorPos({
          visible: true,
          x: inpRect.left - containerRect.left + 80,
          y: inpRect.top - containerRect.top + inpRect.height / 2,
          click: 0,
        });
      }

      await sleep(700);
      if (!isMounted) return;

      // Click input box
      setIsTyping(true);
      setCursorPos((prev) => ({ ...prev, click: prev.click + 1 }));

      // Type command character by character
      const cmd = tab.command;
      for (let i = 1; i <= cmd.length; i++) {
        if (!isMounted) return;
        setInputText(cmd.slice(0, i));
        await sleep(70 + Math.random() * 40);
      }

      await sleep(400);
      if (!isMounted) return;

      // Hit enter: send user command
      setCursorPos((prev) => ({ ...prev, click: prev.click + 1 }));
      setChatEntries((prev) => [
        ...prev.slice(-10),
        { id: Date.now(), user: '하늘', command: cmd },
      ]);
      setInputText('');
      setIsTyping(false);

      // Bot typing dots
      setBotTyping(true);
      await sleep(900);
      if (!isMounted) return;

      setBotTyping(false);
      setChatEntries((prev) => [
        ...prev,
        { id: Date.now() + 1, isBot: true, node: getBotReply(cmd) },
      ]);

      // Wait 4.5 seconds before moving to next tab
      await sleep(4500);
      if (!isMounted) return;

      setActiveTabIdx((prev) => (prev + 1) % TABS.length);
    }

    runStep();

    return () => {
      isMounted = false;
    };
  }, [mode, activeTabIdx, isPaused, getBotReply]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Top Mode Pill Toggle */}
      <div className="flex flex-col items-center gap-3">
        <div
          role="radiogroup"
          aria-label="시연 방식"
          className="relative inline-grid grid-cols-2 rounded-full p-1 bg-accent/60 border border-border/50 shadow-sm"
        >
          {/* Animated slider pill */}
          <span
            className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-card border border-border/60 shadow-sm transition-transform duration-300 ${
              mode === 'manual' ? 'translate-x-full' : ''
            }`}
          />
          <button
            type="button"
            role="radio"
            aria-checked={mode === 'auto'}
            onClick={() => {
              setMode('auto');
              setChatEntries([]);
            }}
            className={`relative z-10 flex min-h-10 items-center justify-center gap-2 rounded-full px-5 text-xs font-bold transition-colors ${
              mode === 'auto' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-primary" />
            자동 모드
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={mode === 'manual'}
            onClick={() => {
              setMode('manual');
              setCursorPos((prev) => ({ ...prev, visible: false }));
              setChatEntries([]);
            }}
            className={`relative z-10 flex min-h-10 items-center justify-center gap-2 rounded-full px-5 text-xs font-bold transition-colors ${
              mode === 'manual' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
            직접 모드
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {mode === 'auto'
            ? '상현고 봇이 직접 명령어를 입력하고 대답하는 모습을 생생하게 보여드려요.'
            : '왼쪽 메뉴를 클릭하거나 아래 입력창에 슬래시(/)를 입력해 직접 테스트해 보세요.'}
        </p>
      </div>

      {/* Main Grid: Sidebar Tabs + Discord Client Window */}
      <div ref={containerRef} className="relative grid gap-4 lg:grid-cols-[16rem_1fr]">
        {/* Left Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0 scrollbar-none">
          {TABS.map((tab, idx) => {
            const Icon = tab.icon;
            const isAct = idx === activeTabIdx;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabButtonsRef.current[idx] = el;
                }}
                type="button"
                onClick={() => {
                  if (mode === 'manual') {
                    handleSelectTabManual(idx);
                  } else {
                    setActiveTabIdx(idx);
                  }
                }}
                className={`flex min-h-12 shrink-0 items-center gap-3 rounded-2xl border p-3 text-left transition-all lg:w-full ${
                  isAct
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'glass border-border/50 hover:border-primary/40'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isAct ? 'bg-primary text-primary-foreground' : 'bg-accent/60 text-muted-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-foreground whitespace-nowrap">
                    {tab.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground hidden truncate lg:block">
                    {tab.hint}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Discord Client Box */}
        <div className="relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-black/40 bg-[#313338] shadow-2xl">
          {/* Channel Header */}
          <div className="flex items-center justify-between gap-3 border-b border-black/30 bg-[#2b2d31] px-4 py-3">
            <div className="flex items-center gap-2 truncate">
              <span className="text-[#80848e] font-bold text-base">#</span>
              <span className="text-xs font-bold text-white truncate">{curTab.channel}</span>
              <span className="text-[10px] text-[#949ba4] font-medium hidden sm:inline">
                | 상현고 공식 채널
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {mode === 'auto' && (
                <button
                  type="button"
                  onClick={() => setIsPaused((prev) => !prev)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-[#b5bac1] hover:bg-white/10 hover:text-white transition-colors"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{isPaused ? '재생' : '멈춤'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setChatEntries([]);
                  setInputText('');
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-[#b5bac1] hover:bg-white/10 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>다시</span>
              </button>
            </div>
          </div>

          {/* Chat Messages Log */}
          <div ref={scrollRef} className="h-[22rem] sm:h-[27rem] space-y-4 overflow-y-auto p-3.5 sm:p-4 scrollbar-thin">
            {chatEntries.length === 0 && !botTyping && (
              <div className="pt-24 text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-[#383a40] text-white flex items-center justify-center mx-auto text-sm font-bold">
                  #
                </div>
                <h4 className="text-sm font-bold text-white">#{curTab.channel} 채널의 시작입니다</h4>
                <p className="text-xs text-[#80848e]">
                  {mode === 'auto'
                    ? '자동 시연이 곧 명령어를 입력합니다...'
                    : '아래 명령어 창에서 기능을 테스트해 보세요.'}
                </p>
              </div>
            )}

            {chatEntries.map((msg) =>
              msg.isBot ? (
                <div key={msg.id} className="flex items-start gap-3 animate-in fade-in">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-xs text-white shrink-0 mt-0.5 shadow-sm">
                    상
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">상현고 봇</span>
                      <span className="px-1 py-0.2 rounded text-[10px] font-bold bg-[#5865f2] text-white font-mono uppercase">
                        BOT
                      </span>
                      <span className="text-[10px] text-[#949ba4]">오늘</span>
                    </div>
                    {msg.node}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex items-start gap-3 animate-in fade-in">
                  <div className="w-9 h-9 rounded-full bg-[#3b82f6] flex items-center justify-center font-bold text-xs text-white shrink-0 mt-0.5">
                    하
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{msg.user}</span>
                      <span className="text-[10px] text-[#949ba4]">오늘</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#3c4270]/40 text-[#7c7fff] font-mono text-xs font-semibold border border-[#5865f2]/30">
                      <span>{msg.command}</span>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Bot Typing Indicator */}
            {botTyping && (
              <div className="flex items-center gap-2 text-xs text-[#949ba4] pt-2">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b5bac1] animate-bounce" />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#b5bac1] animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#b5bac1] animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  />
                </div>
                <span>상현고 봇이 입력 중입니다...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="relative border-t border-black/30 p-3 bg-[#313338]">
            <div
              ref={inputRef}
              className={`flex items-center gap-3 rounded-xl bg-[#383a40] px-3.5 py-2.5 text-xs text-white transition-all ${
                isTyping ? 'ring-2 ring-[#5865f2]' : ''
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-[#4e5058] flex items-center justify-center text-white shrink-0">
                <Plus className="w-3.5 h-3.5" />
              </div>

              {mode === 'manual' ? (
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setShowSlashPopup(e.target.value.startsWith('/'));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputText.trim()) {
                      const typed = inputText.trim();
                      setChatEntries((prev) => [
                        ...prev,
                        { id: Date.now(), user: '나', command: typed },
                        { id: Date.now() + 1, isBot: true, node: getBotReply(typed) },
                      ]);
                      setInputText('');
                      setShowSlashPopup(false);
                    }
                  }}
                  placeholder={`#${curTab.channel}에 메시지 보내기 (/ 로 명령어 호출)`}
                  className="w-full bg-transparent text-white placeholder:text-[#80848e] focus:outline-none"
                />
              ) : (
                <div className="flex items-center w-full min-h-[1.25rem]">
                  {inputText ? (
                    <span className="text-[#dbdee1] font-mono">
                      {inputText}
                      <span className="ml-0.5 inline-block h-3.5 w-0.5 bg-white animate-pulse" />
                    </span>
                  ) : (
                    <span className="text-[#80848e]">#{curTab.channel}에 메시지 보내기</span>
                  )}
                </div>
              )}
            </div>

            {/* Manual Slash Command Suggestions Popup */}
            {mode === 'manual' && showSlashPopup && (
              <div className="absolute inset-x-3 bottom-full mb-2 overflow-hidden rounded-xl border border-black/40 bg-[#2b2d31] shadow-2xl p-1 z-30">
                <p className="px-3 py-1.5 text-[11px] font-bold text-[#949ba4] uppercase font-mono">
                  상현고 봇 슬래시 명령어
                </p>
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setChatEntries((prev) => [
                        ...prev,
                        { id: Date.now(), user: '나', command: tab.command },
                        { id: Date.now() + 1, isBot: true, node: getBotReply(tab.command) },
                      ]);
                      setInputText('');
                      setShowSlashPopup(false);
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 rounded-lg hover:bg-[#404249] text-left transition-colors"
                  >
                    <span className="text-xs font-bold text-white font-mono">{tab.command}</span>
                    <span className="text-[11px] text-[#949ba4]">{tab.hint}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Animated Mouse Cursor in Auto Mode */}
        {mode === 'auto' && cursorPos.visible && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 z-30 transition-[transform] duration-[750ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)` }}
          >
            {cursorPos.click > 0 && (
              <span
                key={cursorPos.click}
                className="absolute -top-3 -left-3 w-6 h-6 animate-ping rounded-full bg-[#5865f2]/60"
              />
            )}
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
            >
              <path
                d="M4 2.5v17.2l4.6-4.4 3 6.7 3-1.3-3-6.6h6.3z"
                fill="#ffffff"
                stroke="#1e1f22"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
