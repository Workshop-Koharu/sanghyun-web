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
  Users2,
  Bell,
  Sparkles,
  Edit3,
  Save,
} from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'card' | 'attendance' | 'wallet' | 'club' | 'notices' | 'discipline' | 'achievements'>('card');
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile customization modal state (210)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileOneLine, setProfileOneLine] = useState('');
  const [profileMbti, setProfileMbti] = useState('');
  const [profileHobby, setProfileHobby] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

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
        if (isMounted) {
          setData(dashData);
          if (dashData.student) {
            setProfileOneLine(dashData.student.one_line || '');
            setProfileMbti(dashData.student.mbti || '');
            setProfileHobby(dashData.student.hobby || '');
          }
        }
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

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const res = await fetch('/api/student/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          one_line: profileOneLine,
          mbti: profileMbti,
          hobby: profileHobby,
        }),
      });
      if (res.ok) {
        setIsEditingProfile(false);
        if (data?.student) {
          setData({
            ...data,
            student: {
              ...data.student,
              one_line: profileOneLine,
              mbti: profileMbti,
              hobby: profileHobby,
            },
          });
        }
      }
    } catch {}
    setProfileSaving(false);
  };

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
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            상현고등학교 학생 포털
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
            {data?.student ? (
              <span>
                {data.student.grade}학년 {data.student.class_num}반 {data.student.student_num}번 {data.student.real_name} 학생
              </span>
            ) : (
              <span>등록된 학생 정보가 없습니다. 디스코드에서 /학교 입학 을 완료해 주세요.</span>
            )}
            {data?.student && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-0.5"
              >
                <Edit3 className="w-3 h-3" /> 프로필 편집
              </button>
            )}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('card')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'wallet'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            지갑/소지품
          </button>
          <button
            onClick={() => setActiveTab('club')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'club'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users2 className="w-3.5 h-3.5" />
            동아리
          </button>
          <button
            onClick={() => setActiveTab('notices')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'notices'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            학교공지
          </button>
          <button
            onClick={() => setActiveTab('discipline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
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

      {/* Main Tab Content */}
      <div>
        {activeTab === 'card' && (
          <StudentCardView
            student={data?.student}
            level={data?.level || { level: 1, exp: 0, total_exp: 0 }}
            user={user}
            history={data?.studentHistory || []}
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
            transactions={data?.transactions || []}
          />
        )}

        {/* 211. 웹앱 동아리 포털 페이지 */}
        {activeTab === 'club' && (
          <div className="space-y-5">
            {data?.club ? (
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-blue-600 dark:text-blue-400 font-bold block">
                      CLUB PORTAL
                    </span>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      {data.club.name}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-medium">
                        {data.club.role === 'leader' ? '동아리 부장' : data.club.role === 'vice_leader' ? '부부장' : '부원'}
                      </span>
                    </h2>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {data.club.description || '동아리 소개가 등록되어 있지 않습니다.'}
                </p>

                <div className="pt-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                    소속 부원 명단 ({data.club.members?.length || 0}명)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {data.club.members?.map((m: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-slate-900 dark:text-white">{m.nickname || `학생 ${m.user_id}`}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                          {m.role === 'leader' ? '👑 부장' : m.role === 'vice_leader' ? '⭐ 부부장' : '부원'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-2">
                <Users2 className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">가입된 동아리가 없습니다</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  디스코드에서 <code className="text-blue-600 font-mono">/동아리 목록</code> 및 <code className="text-blue-600 font-mono">/동아리 가입</code> 명령어로 동아리에 가입해 보세요.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 1. 웹앱 학교 공식 공지사항 */}
        {activeTab === 'notices' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-blue-600" />
              상현고등학교 공식 교내 공지사항
            </h3>

            {(!data?.announcements || data.announcements.length === 0) ? (
              <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-xs text-slate-500">
                등록된 교내 공지사항이 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {data.announcements.map((ann: any) => {
                  const dateStr = new Date(Number(ann.created_at) * 1000).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  });
                  return (
                    <div
                      key={ann.id}
                      className={`p-4 rounded-xl border transition-all ${
                        ann.pinned
                          ? 'border-blue-400 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {ann.pinned && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-600 text-white font-semibold">
                              필독
                            </span>
                          )}
                          {ann.title}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">{dateStr}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                        {ann.content}
                      </p>
                      <div className="mt-2 text-[10px] text-slate-400 font-mono">
                        작성자: {ann.author_name} (학생회/교무처)
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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

      {/* 210. 프로필 커스터마이징 모달 */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-blue-600" />
              학생 프로필 정보 수정
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  학생 한마디 (좌우명 / 각오)
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={profileOneLine}
                  onChange={(e) => setProfileOneLine(e.target.value)}
                  placeholder="예: 최선을 다해 후회 없는 고교생활 만들기"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">MBTI</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={profileMbti}
                    onChange={(e) => setProfileMbti(e.target.value.toUpperCase())}
                    placeholder="예: ENFP"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">취미 / 특기</label>
                  <input
                    type="text"
                    maxLength={20}
                    value={profileHobby}
                    onChange={(e) => setProfileHobby(e.target.value)}
                    placeholder="예: 코딩, 밴드"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
              >
                취소
              </button>
              <button
                disabled={profileSaving}
                onClick={handleSaveProfile}
                className="px-4 py-1.5 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {profileSaving ? '저장 중...' : '저장 완료'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
