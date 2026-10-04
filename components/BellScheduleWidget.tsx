'use client';

import { useEffect, useState } from 'react';
import { Bell, Clock, ChevronRight, Sparkles, BookOpen } from 'lucide-react';

interface PeriodSlot {
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
  label: string;
  isClass: boolean;
}

const SCHEDULE_SLOTS: PeriodSlot[] = [
  { startHour: 8, startMin: 40, endHour: 9, endMin: 0, label: '아침 자율학습 / 조회', isClass: false },
  { startHour: 9, startMin: 0, endHour: 9, endMin: 50, label: '1교시 수업', isClass: true },
  { startHour: 9, startMin: 50, endHour: 10, endMin: 0, label: '쉬는시간 (10분)', isClass: false },
  { startHour: 10, startMin: 0, endHour: 10, endMin: 50, label: '2교시 수업', isClass: true },
  { startHour: 10, startMin: 50, endHour: 11, endMin: 0, label: '쉬는시간 (10분)', isClass: false },
  { startHour: 11, startMin: 0, endHour: 11, endMin: 50, label: '3교시 수업', isClass: true },
  { startHour: 11, startMin: 50, endHour: 12, endMin: 0, label: '쉬는시간 (10분)', isClass: false },
  { startHour: 12, startMin: 0, endHour: 12, endMin: 50, label: '4교시 수업', isClass: true },
  { startHour: 12, startMin: 50, endHour: 13, endMin: 50, label: '점심시간 및 교내 중식 🍱', isClass: false },
  { startHour: 13, startMin: 50, endHour: 14, endMin: 40, label: '5교시 수업', isClass: true },
  { startHour: 14, startMin: 40, endHour: 14, endMin: 50, label: '쉬는시간 (10분)', isClass: false },
  { startHour: 14, startMin: 50, endHour: 15, endMin: 40, label: '6교시 수업', isClass: true },
  { startHour: 15, startMin: 40, endHour: 15, endMin: 50, label: '쉬는시간 (10분)', isClass: false },
  { startHour: 15, startMin: 50, endHour: 16, endMin: 40, label: '7교시 수업', isClass: true },
  { startHour: 16, startMin: 40, endHour: 16, endMin: 50, label: '쉬는시간 (10분)', isClass: false },
  { startHour: 16, startMin: 50, endHour: 17, endMin: 40, label: '8교시 방과후 심화수업', isClass: true },
  { startHour: 17, startMin: 40, endHour: 18, endMin: 0, label: '종례 및 학급 청소', isClass: false },
  { startHour: 18, startMin: 0, endHour: 21, endMin: 0, label: '석식 및 야간자율학습 (야자)', isClass: false },
];

export default function BellScheduleWidget() {
  const [now, setNow] = useState<Date>(new Date());
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute KST
  const curMinutes = now.getHours() * 60 + now.getMinutes();
  const curSeconds = now.getSeconds();

  let activeSlot: PeriodSlot | null = null;
  let nextSlot: PeriodSlot | null = null;

  for (let i = 0; i < SCHEDULE_SLOTS.length; i++) {
    const slot = SCHEDULE_SLOTS[i];
    const sMin = slot.startHour * 60 + slot.startMin;
    const eMin = slot.endHour * 60 + slot.endMin;

    if (curMinutes >= sMin && curMinutes < eMin) {
      activeSlot = slot;
      if (i + 1 < SCHEDULE_SLOTS.length) {
        nextSlot = SCHEDULE_SLOTS[i + 1];
      }
      break;
    } else if (curMinutes < sMin && !nextSlot) {
      nextSlot = slot;
    }
  }

  let minsLeft = 0;
  let secsLeft = 0;
  let progressPercent = 0;

  if (activeSlot) {
    const sMin = activeSlot.startHour * 60 + activeSlot.startMin;
    const eMin = activeSlot.endHour * 60 + activeSlot.endMin;
    const totalSecs = (eMin - sMin) * 60;
    const elapsedSecs = (curMinutes - sMin) * 60 + curSeconds;
    const remainingSecs = Math.max(0, totalSecs - elapsedSecs);

    minsLeft = Math.floor(remainingSecs / 60);
    secsLeft = remainingSecs % 60;
    progressPercent = Math.min(100, Math.max(0, Math.round((elapsedSecs / totalSecs) * 100)));
  }

  return (
    <>
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-blue-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Bell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              실시간 타종 & 일과 현황
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
          >
            전체 시정표
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {activeSlot ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400 block">
                  {activeSlot.isClass ? '정규 수업 진행 중' : '휴식 및 활동 시간'}
                </span>
                <h4 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {activeSlot.label}
                </h4>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">다음 타종까지</span>
                <span className="text-xl font-black font-mono tracking-tight text-blue-600 dark:text-blue-400">
                  {String(minsLeft).padStart(2, '0')}:{String(secsLeft).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                <span>
                  {String(activeSlot.startHour).padStart(2, '0')}:{String(activeSlot.startMin).padStart(2, '0')}
                </span>
                <span>{progressPercent}% 완료</span>
                <span>
                  {String(activeSlot.endHour).padStart(2, '0')}:{String(activeSlot.endMin).padStart(2, '0')}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {nextSlot && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>다음: <b>{nextSlot.label}</b> ({String(nextSlot.startHour).padStart(2, '0')}:{String(nextSlot.startMin).padStart(2, '0')})</span>
              </div>
            )}
          </div>
        ) : (
          <div className="py-2 text-center text-xs text-slate-500 dark:text-slate-400">
            {curMinutes < 8 * 60 + 40
              ? '🌅 등교 전입니다. 08:40에 아침 조회가 시작됩니다.'
              : '🌙 오늘의 정규 일과 및 야간 자율학습이 모두 종료되었습니다.'}
          </div>
        )}
      </div>

      {/* 전체 타종 시정표 Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                상현고등학교 정규 타종 시정표
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto space-y-1.5 text-xs">
              {SCHEDULE_SLOTS.map((s, idx) => {
                const sStr = `${String(s.startHour).padStart(2, '0')}:${String(s.startMin).padStart(2, '0')}`;
                const eStr = `${String(s.endHour).padStart(2, '0')}:${String(s.endMin).padStart(2, '0')}`;
                const isCur =
                  activeSlot &&
                  activeSlot.startHour === s.startHour &&
                  activeSlot.startMin === s.startMin;

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isCur
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 font-bold text-blue-700 dark:text-blue-300'
                        : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-400">
                        {sStr} ~ {eStr}
                      </span>
                      <span>{s.label}</span>
                    </div>
                    {isCur && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-600 text-white font-bold animate-pulse">
                        현재
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 text-xs rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
