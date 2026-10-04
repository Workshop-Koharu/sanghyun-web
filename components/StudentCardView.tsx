'use client';

import { BookOpen, QrCode } from 'lucide-react';

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
      <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center max-w-md mx-auto shadow-sm">
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center mb-3 text-slate-500">
          <BookOpen className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">학생 정보가 등록되지 않았습니다</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          디스코드 서버에서 <code className="text-blue-600 dark:text-blue-400 font-mono">/입학</code> 명령어로 입학을 완료해 주세요.
        </p>
      </div>
    );
  }

  const expNeeded = level.level * 100;
  const progressPercent = Math.min(100, Math.floor((level.exp / expNeeded) * 100));

  return (
    <div className="relative max-w-md mx-auto rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
        <div>
          <span className="text-[10px] tracking-wider font-mono uppercase text-blue-600 dark:text-blue-400 font-bold">
            SANGHYUN HIGH SCHOOL
          </span>
          <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
            상현고등학교 학생증
          </h2>
        </div>
        <div className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-mono font-medium border border-emerald-200 dark:border-emerald-800">
          {student.status === 'enrolled' ? '재학' : student.status}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <div className="w-24 h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {user.avatar ? (
              <img src={user.avatar} alt={student.real_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-slate-400">{student.real_name.slice(0, 1)}</span>
            )}
          </div>
          <div className="absolute -bottom-2 -right-1 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-700 shadow-sm">
            Lv.{level.level}
          </div>
        </div>

        <div className="flex-1 space-y-1">
          <div className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            {student.real_name}
            {student.mbti && (
              <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                {student.mbti}
              </span>
            )}
          </div>
          <div className="text-xs font-mono text-slate-700 dark:text-slate-300">
            {student.grade}학년 {student.class_num}반 {student.student_num}번
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            학번: <span className="text-slate-800 dark:text-slate-200 font-semibold">{student.student_id}</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            동아리: <span className="text-slate-800 dark:text-slate-200">{student.club_name || '미배정'}</span>
          </div>
        </div>
      </div>

      {student.one_line && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 border border-slate-200 dark:border-slate-800 mb-3 text-xs text-slate-600 dark:text-slate-300">
          "{student.one_line}"
        </div>
      )}

      <div className="mb-4 space-y-1">
        <div className="flex justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
          <span>경험치</span>
          <span>{level.exp} / {expNeeded} EXP ({progressPercent}%)</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div>
          <div>발급: {student.enrolled_at ? new Date(student.enrolled_at).toLocaleDateString('ko-KR') : '-'}</div>
          <div>상현고등학교 교무처</div>
        </div>
        <div className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <QrCode className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
