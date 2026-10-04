'use client';

import { Calendar, CheckCircle2, Flame, Award, Clock } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400">현재 연속 출석</div>
            <div className="text-2xl font-black text-white font-mono">{stats.current_streak}일</div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400">누적 출석일</div>
            <div className="text-2xl font-black text-white font-mono">{stats.total_days}일</div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Award className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400">최고 연속 기록</div>
            <div className="text-2xl font-black text-white font-mono">{stats.max_streak}일</div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-400" />
            {year}년 {month + 1}월 출석 현황
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            최근 출석: {stats.last_attendance_date || '없음'}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 mb-2">
          <div className="text-rose-400">일</div>
          <div>월</div>
          <div>화</div>
          <div>수</div>
          <div>목</div>
          <div>금</div>
          <div className="text-sky-400">토</div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-14 rounded-xl bg-slate-900/30" />
          ))}

          {daysArray.map((d) => (
            <div
              key={d.day}
              className={`h-14 rounded-xl p-1.5 flex flex-col justify-between transition-all border ${
                d.attended
                  ? 'bg-blue-600/20 border-blue-500/40 text-blue-200'
                  : 'bg-slate-900/40 border-slate-800/60 text-slate-500'
              }`}
            >
              <span className="text-xs font-mono font-bold text-left">{d.day}</span>
              {d.attended && (
                <div className="flex justify-end">
                  <span className="w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center text-blue-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
