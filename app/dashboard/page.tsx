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
    async function loadData() {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();

        if (!meData.authenticated) {
          setError('로그인이 필요합니다.');
          setLoading(false);
          return;
        }

        setUser(meData.user);

        const dashRes = await fetch('/api/student/dashboard');
        if (!dashRes.ok) {
          setError('학생 정보를 불러오지 못했습니다.');
          setLoading(false);
          return;
        }

        const dashData = await dashRes.json();
        setData(dashData);
      } catch (err) {
        setError('서버 연결 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">학사 포털 데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="glass-panel max-w-md mx-auto p-8 rounded-3xl text-center space-y-4 my-12">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">학생 포털 접근 불가</h2>
        <p className="text-xs text-slate-400">{error || '디스코드 로그인이 필요한 페이지입니다.'}</p>
        <a
          href="/api/auth/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md"
        >
          <LogIn className="w-4 h-4" />
          디스코드 로그인 바로가기
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-sky-400" />
            상현고등학교 학생 포털
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {data?.student ? (
              <span>
                {data.student.grade}학년 {data.student.class_num}반 {data.student.student_num}번 {data.student.real_name} 학생의 종합 학적 페이지입니다.
              </span>
            ) : (
              <span>등록된 학생 정보가 없습니다. 디스코드에서 /입학 을 완료해 주세요.</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('card')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
              activeTab === 'card' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            학생증
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
              activeTab === 'attendance' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            출석부
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
              activeTab === 'wallet' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4" />
            지갑/소지품
          </button>
          <button
            onClick={() => setActiveTab('discipline')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
              activeTab === 'discipline' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            상벌점
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
              activeTab === 'achievements' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            업적
          </button>
        </div>
      </div>

      <div className="transition-all">
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
