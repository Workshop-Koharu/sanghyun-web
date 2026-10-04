'use client';

import { Calendar, CheckCircle2, Flame, Award } from 'lucide-react';

interface AttendanceProps {
  stats: {
    total_days: number;
    current_streak: number;
    max_streak: number;
    last_attendance_date: string | null;
  };
  recentAttendance: Array<{
    date: string;
    consecutive_days: number;
    reward_coins: number;
    reward_exp: number;
  }>;
}

export default function AttendanceCalendar({ stats, recentAttendance }: AttendanceProps) {
  const attendanceDateSet = new Set(recentAttendance.map((a) => a.date.slice(0, 10)));

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const daysArray: Array<{ day: number; dateStr: string; attended: boolean }> = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(i).padStart(2, '0');
    const dateStr = `${year}-${mm}-${dd}`;
    daysArray.push({
      day: i,
      dateStr,
      attended: attendanceDateSet.has(dateStr),
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">현재 연속 출석</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">{stats.current_streak}일</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">누적 출석일</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">{stats.total_days}일</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">최고 연속 기록</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">{stats.max_streak}일</div>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-500" />
            {year}년 {month + 1}월 출석부
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            최근 출석: {stats.last_attendance_date || '없음'}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
          <div className="text-rose-500">일</div>
          <div>월</div>
          <div>화</div>
          <div>수</div>
          <div>목</div>
          <div>금</div>
          <div className="text-blue-500">토</div>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-12 rounded-lg bg-slate-50 dark:bg-slate-950/40" />
          ))}

          {daysArray.map((d) => (
            <div
              key={d.day}
              className={`h-12 rounded-lg p-1.5 flex flex-col justify-between border text-xs font-mono ${
                d.attended
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <span>{d.day}</span>
              {d.attended && (
                <div className="flex justify-end">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
