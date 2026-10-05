'use client';

import { useState } from 'react';
import {
  BookOpen,
  RotateCw,
  Sparkles,
  Calendar,
  Award,
  CheckCircle2,
  Share2,
  Check,
  Quote,
} from 'lucide-react';
import SanghyunLogo from './SanghyunLogo';
import { getDefaultDiscordAvatar } from '@/lib/avatar';

interface StudentProps {
  student: {
    user_id: string | number;
    student_id: string;
    real_name: string;
    grade: number;
    class_num: number;
    student_num: number;
    club_name?: string | null;
    status: string;
    enrolled_at: string | number;
    birthday?: string | null;
    mbti?: string | null;
    one_line?: string | null;
    hobby?: string | null;
    avatar_url?: string | null;
  } | null;
  level: {
    level: number;
    exp: number;
    total_exp: number;
    message_count?: number;
    voice_seconds?: number;
  };
  user: {
    username: string;
    avatar: string | null;
  } | null;
  history?: Array<{
    id: number;
    event_type: string;
    from_value: string;
    to_value: string;
    created_at: number;
  }>;
}

// Realistic Code 128 Style SVG Barcode Generator
function RealisticBarcode({ value }: { value: string }) {
  const clean = (value || 'SH2026001').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const bars: { width: number; isBlack: boolean }[] = [];

  // Quiet zone
  bars.push({ width: 3, isBlack: false });
  // Start pattern: B2 S1 B1 S2 B1 S3
  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 1, isBlack: true });
  bars.push({ width: 2, isBlack: false });
  bars.push({ width: 1, isBlack: true });
  bars.push({ width: 2, isBlack: false });

  // Data characters
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    const p1 = (code % 3) + 1;
    const p2 = ((code >> 1) % 3) + 1;
    const p3 = ((code >> 2) % 2) + 1;
    const p4 = ((code >> 3) % 3) + 1;
    const p5 = ((code >> 4) % 2) + 1;
    const p6 = Math.max(1, 11 - (p1 + p2 + p3 + p4 + p5));

    bars.push({ width: p1, isBlack: true });
    bars.push({ width: p2, isBlack: false });
    bars.push({ width: p3, isBlack: true });
    bars.push({ width: p4, isBlack: false });
    bars.push({ width: p5, isBlack: true });
    bars.push({ width: p6, isBlack: false });
  }

  // Stop pattern: B2 S3 B3 S1 B1 S1 B2
  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 2, isBlack: false });
  bars.push({ width: 3, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 1, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 3, isBlack: false });

  const totalWidth = bars.reduce((sum, b) => sum + b.width, 0);

  return (
    <div className="bg-white rounded-md px-2 py-1 flex flex-col items-center shadow-inner">
      <svg
        viewBox={`0 0 ${totalWidth} 22`}
        className="w-32 sm:w-40 h-6 fill-current text-slate-950"
        preserveAspectRatio="none"
      >
        {(() => {
          let currentX = 0;
          return bars.map((bar, idx) => {
            const x = currentX;
            currentX += bar.width;
            if (!bar.isBlack) return null;
            return <rect key={idx} x={x} y={0} width={bar.width} height={22} fill="#090D16" />;
          });
        })()}
      </svg>
      <span className="font-mono text-[8px] font-bold text-slate-800 tracking-wider">
        *{clean}*
      </span>
    </div>
  );
}

// Realistic 21x21 QR Code SVG Matrix Generator
function RealisticQRCode({ value, size = 52 }: { value: string; size?: number }) {
  const N = 21;
  const matrix: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));

  function placeFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const mr = row + r;
        const mc = col + c;
        if (mr >= 0 && mr < N && mc >= 0 && mc < N) {
          if (r === -1 || r === 7 || c === -1 || c === 7) {
            matrix[mr][mc] = false;
          } else if (r === 0 || r === 6 || c === 0 || c === 6) {
            matrix[mr][mc] = true;
          } else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) {
            matrix[mr][mc] = true;
          } else {
            matrix[mr][mc] = false;
          }
        }
      }
    }
  }

  placeFinder(0, 0);
  placeFinder(0, N - 7);
  placeFinder(N - 7, 0);

  for (let i = 8; i < N - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  matrix[N - 8][8] = true;

  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const inTL = r <= 7 && c <= 7;
      const inTR = r <= 7 && c >= N - 8;
      const inBL = r >= N - 8 && c <= 7;
      const inTiming = (r === 6 && c >= 8 && c < N - 8) || (c === 6 && r >= 8 && r < N - 8);
      const isDarkModule = r === N - 8 && c === 8;

      if (!inTL && !inTR && !inBL && !inTiming && !isDarkModule) {
        const bit = ((hash ^ (r * 37 + c * 17) ^ ((r + c) % 3 === 0 ? 1 : 0)) >>> ((r * 3 + c) % 29)) & 1;
        matrix[r][c] = bit === 1;
      }
    }
  }

  return (
    <div className="bg-white p-1 rounded-md shadow flex items-center justify-center shrink-0">
      <svg viewBox={`0 0 ${N} ${N}`} width={size} height={size} className="shape-rendering-crispEdges">
        {matrix.map((row, r) =>
          row.map((isDark, c) =>
            isDark ? (
              <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#090D16" />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}

export default function StudentCardView({ student, level, user, history = [] }: StudentProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [walletCopied, setWalletCopied] = useState(false);

  const handleCopyLink = () => {
    if (!student) return;
    const url = `${window.location.origin}/student/${student.user_id}`;
    navigator.clipboard.writeText(url);
    setWalletCopied(true);
    setTimeout(() => setWalletCopied(false), 2500);
  };

  if (!student) {
    return (
      <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center max-w-md mx-auto shadow-sm">
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center mb-3 text-slate-500">
          <BookOpen className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">학생 정보가 등록되지 않았습니다</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          디스코드 서버에서 <code className="text-blue-600 dark:text-blue-400 font-mono">/학교 입학</code> 명령어로 입학을 완료해 주세요.
        </p>
      </div>
    );
  }

  const expNeeded = (level.level || 1) * 100;
  const progressPercent = Math.min(100, Math.floor(((level.exp || 0) / expNeeded) * 100));

  const enrollDate = student.enrolled_at
    ? new Date(Number(student.enrolled_at) * 1000).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '2026년 3월 3일';

  // Build events for timeline
  const timelineEvents = [
    {
      title: '상현고등학교 공식 입학',
      date: enrollDate,
      desc: `${student.grade}학년 ${student.class_num}반 ${student.student_num}번 배정`,
      icon: Award,
      badge: '입학 완료',
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60',
    },
    ...history.map((h) => {
      const hDate = new Date(Number(h.created_at) * 1000).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      let title = '학적 변동';
      if (h.event_type === 'promote') title = '학년 진급';
      if (h.event_type === 'class_change') title = '학급 변경';
      if (h.event_type === 'graduate') title = '상현고등학교 공식 졸업';
      return {
        title,
        date: hDate,
        desc: `${h.from_value || ''} → ${h.to_value || ''}`,
        icon: CheckCircle2,
        badge: h.event_type,
        color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
      };
    }),
  ];

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      {/* 3D Apple Wallet Interactive Flip Card */}
      <div className="flex flex-col items-center">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative w-full h-[320px] sm:h-[340px] cursor-pointer select-none [perspective:1200px]"
        >
          <div
            className={`relative w-full h-full rounded-2xl transition-all duration-700 [transform-style:preserve-3d] shadow-2xl border border-white/20 ${
              isFlipped ? '[transform:rotateY(180deg)]' : ''
            }`}
          >
            {/* FRONT CARD */}
            <div className="absolute inset-0 w-full h-full rounded-2xl p-4 sm:p-6 [backface-visibility:hidden] bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E3A8A] text-white flex flex-col justify-between overflow-hidden">
              {/* Holographic shimmer foil sweep overlay */}
              <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 pointer-events-none animate-pulse" />

              <div className="flex items-center justify-between border-b border-white/10 pb-2 sm:pb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <SanghyunLogo size={28} />
                  <div>
                    <span className="text-[9px] sm:text-[10px] tracking-widest uppercase font-mono text-blue-400 font-bold block">
                      SANGHYUN HIGH SCHOOL
                    </span>
                    <h2 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                      상현고등학교 학생증
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                    </h2>
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-mono font-bold border border-emerald-500/30">
                  {student.status === 'active' || student.status === 'enrolled' ? '재학' : student.status}
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-5 my-1 sm:my-2 relative z-10">
                <div className="relative shrink-0">
                  <div className="w-20 sm:w-24 h-24 sm:h-28 rounded-xl overflow-hidden border-2 border-white/20 bg-slate-800 shadow-md flex items-center justify-center">
                    {(student.avatar_url || user?.avatar) ? (
                      <img
                        src={student.avatar_url || user?.avatar || ''}
                        alt={student.real_name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = getDefaultDiscordAvatar(student.user_id);
                        }}
                      />
                    ) : (
                      <span className="text-3xl font-black text-slate-400">{student.real_name.slice(0, 1)}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow border border-amber-300">
                    Lv.{level.level}
                  </div>
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                  <div className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2 truncate">
                    <span>{student.real_name}</span>
                    {student.mbti && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold border border-blue-500/30 shrink-0">
                        {student.mbti}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-slate-300 truncate">
                    {student.grade}학년 {student.class_num}반 {student.student_num}번
                  </div>
                  <div className="text-xs text-slate-400 font-mono truncate">
                    학번: <span className="text-white font-semibold">{student.student_id}</span>
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    소속 동아리: <span className="text-blue-300 font-medium">{student.club_name || '미배정'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 relative z-10 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono">
                  <span>경험치 (Lv.{level.level})</span>
                  <span>
                    {level.exp} / {expNeeded} XP ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1 mt-1">
                  <RotateCw className="w-3 h-3 text-blue-400" /> 카드를 터치/클릭하면 뒷면이 뒤집힙니다
                </div>
              </div>
            </div>

            {/* BACK CARD */}
            <div className="absolute inset-0 w-full h-full rounded-2xl p-4 sm:p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-[#0F172A] via-[#1E1E2E] to-[#1E293B] text-white flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-slate-300">상현고등학교 공식 스마트 학생증</span>
                <span className="text-[10px] font-mono text-blue-400">DIGITAL CARD PASS</span>
              </div>

              <div className="space-y-2.5 my-auto text-xs">
                {student.one_line && (
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-start gap-2">
                    <Quote className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">학생 한마디</span>
                      <p className="text-slate-200 italic">&ldquo;{student.one_line}&rdquo;</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-white/5 border border-white/10">
                    <span className="text-slate-400 block text-[10px]">취미 / 특기</span>
                    <span className="font-semibold text-slate-200">{student.hobby || '자율 학습'}</span>
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/10">
                    <span className="text-slate-400 block text-[10px]">입학일자</span>
                    <span className="font-semibold text-slate-200">{enrollDate}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 leading-relaxed text-center">
                  &ldquo;지혜를 닦고 덕성을 길러 세계를 밝히자&rdquo;
                  <br />
                  본 증명은 상현고등학교 학생 신분을 확인하는 모바일 공식 학생증입니다.
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <RealisticQRCode value={`https://sanghyun.koharu.live/student/${student.user_id}`} size={46} />
                  <RealisticBarcode value={student.student_id} />
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                  <RotateCw className="w-3 h-3 text-blue-400" /> 앞면
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sleek Action Bar for 3D Digital Student Card */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-md shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>카드 뒤집기 ({isFlipped ? '앞면 보기' : '뒷면 바코드/QR'})</span>
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-border/60 hover:border-primary/40 text-foreground text-xs font-bold transition-all active:scale-[0.98]"
          >
            {walletCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">링크 복사됨!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span>학생증 링크 공유</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>카드를 클릭하거나 터치하면 3D 홀로그램 앞뒷면이 부드럽게 회전합니다.</span>
        </p>
      </div>

      {/* 학적 이력 타임라인 (Timeline) */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          학적 이력 타임라인 (나의 학교생활 연표)
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {timelineEvents.map((ev, idx) => {
            const IconComponent = ev.icon;
            return (
              <div key={idx} className="relative group">
                <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {ev.title}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">{ev.date}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{ev.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
