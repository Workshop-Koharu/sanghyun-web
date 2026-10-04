'use client';

import { useEffect, useState } from 'react';
import StudentCardView from '@/components/StudentCardView';
import AttendanceCalendar from '@/components/AttendanceCalendar';
import WalletView from '@/components/WalletView';
import DisciplineView from '@/components/DisciplineView';
import AchievementsGrid from '@/components/AchievementsGrid';
import {
  BookOpen,
  CalendarCheck,
  Wallet,
  ShieldCheck,
  Trophy,
  LogIn,
  AlertCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'card' | 'attendance' | 'wallet' | 'discipline' | 'achievements'>('card');
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const meRes = await fetch('/api/auth/me', {
          cache: 'no-store',
          credentials: 'include',
        });
        const meData = await meRes.json();

        if (!meData.authenticated || !meData.user) {
          if (isMounted) {
            setError('디스코드 로그인이 필요한 페이지입니다.');
            setLoading(false);
          }
          return;
        }

        if (isMounted) setUser(meData.user);

        const dashRes = await fetch('/api/student/dashboard', {
          cache: 'no-store',
          credentials: 'include',
        });
        if (!dashRes.ok) {
          if (isMounted) {
            setError('학생 정보를 불러오지 못했습니다.');
            setLoading(false);
          }
          return;
        }

        const dashData = await dashRes.json();
        if (isMounted) setData(dashData);
      } catch (err) {
        if (isMounted) setError('서버 연결 중 오류가 발생했습니다.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">학사 포털 데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-w-md mx-auto text-center space-y-4 my-10 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">학생 포털 안내</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{error || '디스코드 로그인이 필요한 서비스입니다.'}</p>
        <a
          href="/api/auth/login"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
        >
          <LogIn className="w-4 h-4" />
          디스코드 로그인
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            학생 포털
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {data?.student ? (
              <span>
                {data.student.grade}학년 {data.student.class_num}반 {data.student.student_num}번 {data.student.real_name} 학생
              </span>
            ) : (
              <span>등록된 학생 정보가 없습니다. 디스코드에서 /입학 을 완료해 주세요.</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('card')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'card'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            학생증
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'attendance'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            출석부
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'wallet'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            지갑/소지품
          </button>
          <button
            onClick={() => setActiveTab('discipline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'discipline'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            상벌점
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'achievements'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            업적
          </button>
        </div>
      </div>

      <div>
        {activeTab === 'card' && (
          <StudentCardView
            student={data?.student}
            level={data?.level || { level: 1, exp: 0, total_exp: 0 }}
            user={user}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceCalendar
            stats={data?.attendanceStats || { total_days: 0, current_streak: 0, max_streak: 0, last_attendance_date: null }}
            recentAttendance={data?.recentAttendance || []}
          />
        )}

        {activeTab === 'wallet' && (
          <WalletView
            wallet={data?.wallet || { coins: 0, total_earned: 0, total_spent: 0 }}
            bank={data?.bank || { balance: 0, total_interest: 0, last_interest_at: null }}
            inventory={data?.inventory || []}
          />
        )}

        {activeTab === 'discipline' && (
          <DisciplineView
            record={data?.record || { merit_points: 0, penalty_points: 0 }}
            logs={data?.disciplineLogs || []}
          />
        )}

        {activeTab === 'achievements' && (
          <AchievementsGrid
            unlockedList={data?.unlockedAchievements || []}
          />
        )}
      </div>
    </div>
  );
}
