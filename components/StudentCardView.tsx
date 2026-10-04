'use client';

import { Award, BookOpen, Calendar, CheckCircle2, QrCode, Shield, Sparkles } from 'lucide-react';

interface StudentProps {
  student: {
    student_id: string;
    real_name: string;
    grade: number;
    class_num: number;
    student_num: number;
    club_name?: string | null;
    status: string;
    enrolled_at: string;
    birthday?: string | null;
    character_type?: string | null;
    mbti?: string | null;
    one_line?: string | null;
    hobby?: string | null;
  } | null;
  level: {
    level: number;
    exp: number;
    total_exp: number;
  };
  user: {
    username: string;
    avatar: string | null;
  };
}

export default function StudentCardView({ student, level, user }: StudentProps) {
  if (!student) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center mb-3">
          <BookOpen className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-200">학생 정보가 등록되지 않았습니다</h3>
        <p className="text-sm text-slate-400 mt-1">
          디스코드 서버에서 <code className="text-sky-400 font-mono">/입학</code> 명령어로 먼저 입학 신청을 진행해 주세요.
        </p>
      </div>
    );
  }

  const expNeeded = level.level * 100;
  const progressPercent = Math.min(100, Math.floor((level.exp / expNeeded) * 100));

  return (
    <div className="relative max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border border-sky-500/20 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
        <div>
          <span className="text-[10px] tracking-widest font-mono uppercase text-sky-400 font-bold">
            SANGHYUN HIGH SCHOOL
          </span>
          <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
            상현고등학교 학생증
          </h2>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-mono font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {student.status === 'enrolled' ? '재학중' : student.status}
        </div>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 mb-5">
        <div className="relative">
          <div className="w-28 h-32 rounded-2xl overflow-hidden ring-2 ring-sky-500/30 bg-slate-800/80 flex items-center justify-center shadow-inner">
            {user.avatar ? (
              <img src={user.avatar} alt={student.real_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-slate-500">{student.real_name.slice(0, 1)}</span>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
            Lv.{level.level}
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1.5">
          <div className="text-2xl font-black text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
            {student.real_name}
            {student.mbti && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono font-normal">
                {student.mbti}
              </span>
            )}
          </div>
          <div className="text-sm font-mono text-slate-300">
            {student.grade}학년 {student.class_num}반 {student.student_num}번
          </div>
          <div className="text-xs text-slate-400 font-mono">
            학번: <span className="text-sky-300 font-semibold">{student.student_id}</span>
          </div>
          <div className="text-xs text-slate-400">
            동아리: <span className="text-slate-200">{student.club_name || '미배정'}</span>
          </div>
        </div>
      </div>

      {student.one_line && (
        <div className="relative z-10 bg-slate-800/40 rounded-xl p-3 border border-slate-700/40 mb-4 text-xs text-slate-300 italic">
          "{student.one_line}"
        </div>
      )}

      <div className="relative z-10 mb-4 space-y-1.5">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-slate-400">경험치 진행률</span>
          <span className="text-sky-300">{level.exp} / {expNeeded} EXP ({progressPercent}%)</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="space-y-0.5">
          <div>발급일: {student.enrolled_at ? new Date(student.enrolled_at).toLocaleDateString('ko-KR') : '-'}</div>
          <div>상현고등학교 교무행정처 직인</div>
        </div>
        <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
          <QrCode className="w-8 h-8 text-slate-300" />
        </div>
      </div>
    </div>
  );
}
