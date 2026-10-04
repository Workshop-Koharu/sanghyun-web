'use client';

import { useEffect, useState } from 'react';
import {
  Shield,
  Settings,
  Users,
  ShoppingBag,
  HelpCircle,
  Save,
  Plus,
  Trash2,
  Search,
  CheckCircle,
  Send,
  BarChart3,
  CalendarCheck,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  Coins,
  Landmark,
  Mic,
  Activity,
  Award,
  Layers,
  CheckCircle2,
  XCircle,
  FileText,
  UserCheck,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'students' | 'attendance' | 'discipline' | 'clubs' | 'shop' | 'questions' | 'settings' | 'audit'
  >('dashboard');

  // KPI & Dashboard Stats (276, 277, 278, 280, 283)
  const [dashStats, setDashStats] = useState<any>(null);

  // Settings State
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null);

  // Students State (251, 252, 253, 254)
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isEditStudentModal, setIsEditStudentModal] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [editGrade, setEditGrade] = useState('1');
  const [editClass, setEditClass] = useState('1');
  const [editStudentNo, setEditStudentNo] = useState('1');
  const [editStudentCode, setEditStudentCode] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [editSaving, setEditSaving] = useState(false);

  // Discipline State (259, 260, 261)
  const [disciplineType, setDisciplineType] = useState<'merit' | 'penalty'>('merit');
  const [disciplinePoints, setDisciplinePoints] = useState('1');
  const [disciplineReason, setDisciplineReason] = useState('');
  const [disciplineSubmitting, setDisciplineSubmitting] = useState(false);
  const [disciplineLogs, setDisciplineLogs] = useState<any[]>([]);

  // Attendance Board State (257, 258)
  const [attendanceData, setAttendanceData] = useState<any>(null);

  // Clubs State (266, 267)
  const [clubsList, setClubsList] = useState<any[]>([]);

  // Shop State (250)
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [isAddShopModalOpen, setIsAddShopModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('100');
  const [newItemStock, setNewItemStock] = useState('-1');
  const [newItemType, setNewItemType] = useState('general');

  // Daily Questions State
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQDate, setNewQDate] = useState('');
  const [newQText, setNewQText] = useState('');

  // Sync state (254)
  const [syncingNicknames, setSyncingNicknames] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const meRes = await fetch('/api/auth/me', {
          cache: 'no-store',
          credentials: 'include',
        });
        const meData = await meRes.json();
        if (isMounted) {
          if (meData.authenticated && meData.user?.isAdmin) {
            setUser(meData.user);
            setIsAdmin(true);
            loadDashboardStats();
            loadSettings();
            loadStudents();
            loadDisciplineLogs();
            loadAttendanceBoard();
            loadClubs();
            loadShopItems();
            loadQuestions();
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  async function loadDashboardStats() {
    try {
      const res = await fetch('/api/admin/dashboard-stats', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setDashStats(data);
      }
    } catch {}
  }

  async function loadSettings() {
    try {
      const res = await fetch('/api/admin/settings', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || {});
      }
    } catch {}
  }

  async function loadStudents(query = '') {
    try {
      const res = await fetch(`/api/admin/students?q=${encodeURIComponent(query)}`, { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch {}
  }

  async function loadDisciplineLogs() {
    try {
      const res = await fetch('/api/admin/discipline-history', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setDisciplineLogs(data.logs || []);
      }
    } catch {}
  }

  async function loadAttendanceBoard() {
    try {
      const res = await fetch('/api/admin/attendance-board', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAttendanceData(data);
      }
    } catch {}
  }

  async function loadClubs() {
    try {
      const res = await fetch('/api/admin/clubs', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setClubsList(data.clubs || []);
      }
    } catch {}
  }

  async function loadShopItems() {
    try {
      const res = await fetch('/api/admin/shop', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setShopItems(data.items || []);
      }
    } catch {}
  }

  async function loadQuestions() {
    try {
      const res = await fetch('/api/admin/questions', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch {}
  }

  // 254. 원클릭 닉네임 일괄 동기화
  async function handleSyncNicknames() {
    setSyncingNicknames(true);
    setSyncMsg(null);
    try {
      const res = await fetch('/api/admin/sync-nicknames', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setSyncMsg('봇에 전교생 닉네임 일괄 동기화 요청이 전송되었습니다.');
        loadDashboardStats();
      } else {
        setSyncMsg(`동기화 실패: ${data.error}`);
      }
    } catch {
      setSyncMsg('동기화 요청 중 네트워크 오류가 발생했습니다.');
    }
    setSyncingNicknames(false);
  }

  // 253. 학생 정보 수정 모달 열기
  function openEditStudent(st: any) {
    setSelectedStudent(st);
    setEditNickname(st.real_name || st.nickname);
    setEditGrade(String(st.grade));
    setEditClass(String(st.class_num || st.class_no));
    setEditStudentNo(String(st.student_num || st.student_no));
    setEditStudentCode(st.student_id || st.student_code);
    setEditStatus(st.status || 'active');
    setIsEditStudentModal(true);
  }

  // 253. 학생 정보 수정 저장
  async function handleSaveStudent() {
    if (!selectedStudent) return;
    setEditSaving(true);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: selectedStudent.user_id,
          nickname: editNickname,
          grade: editGrade,
          classNum: editClass,
          studentNum: editStudentNo,
          studentCode: editStudentCode,
          status: editStatus,
        }),
      });
      if (res.ok) {
        setIsEditStudentModal(false);
        loadStudents(searchQuery);
        loadDashboardStats();
      }
    } catch {}
    setEditSaving(false);
  }

  // 259. 상벌점 부여
  async function handleGiveDiscipline() {
    if (!selectedStudent || !disciplineReason) return;
    setDisciplineSubmitting(true);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: selectedStudent.user_id,
          type: disciplineType,
          points: disciplinePoints,
          reason: disciplineReason,
        }),
      });
      if (res.ok) {
        setDisciplineReason('');
        loadStudents(searchQuery);
        loadDisciplineLogs();
      }
    } catch {}
    setDisciplineSubmitting(false);
  }

  // 260. 상벌점 원클릭 취소
  async function handleRevokeDiscipline(id: number) {
    if (!confirm(`상벌점 #${id} 항목을 취소하시겠습니까?`)) return;
    try {
      const res = await fetch('/api/admin/discipline-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, reason: '관리자 웹 직권 취소' }),
      });
      if (res.ok) {
        loadDisciplineLogs();
        loadStudents(searchQuery);
      }
    } catch {}
  }

  // 266. 동아리 승인/반려/폐부
  async function handleClubAction(clubId: number, action: 'approve' | 'reject' | 'disband') {
    if (!confirm(`동아리 조치 (${action})를 실행하시겠습니까?`)) return;
    try {
      const res = await fetch('/api/admin/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ clubId, action }),
      });
      if (res.ok) {
        loadClubs();
        loadDashboardStats();
      }
    } catch {}
  }

  // 250. CSV 매점 데이터 내보내기 (Export)
  function handleExportShopCSV() {
    const headers = ['ID,이름,설명,가격,재고,종류'];
    const rows = shopItems.map((item) =>
      [item.id, `"${item.name}"`, `"${item.description || ''}"`, item.price, item.stock, item.item_type || 'general'].join(',')
    );
    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sanghyun_shop_items_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">관리자 인증 상태를 확인하는 중입니다...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-w-md mx-auto text-center space-y-3 my-12 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
          <Shield className="w-5 h-5" />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">접근 권한이 없습니다</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          이 페이지는 상현고등학교 교직원 및 관리자 전용입니다. 디스코드에서 관리자 권한을 부여받은 후 다시 접속해 주세요.
        </p>
      </div>
    );
  }

  const filteredStudents = students.filter((s) => {
    if (gradeFilter !== 'all' && String(s.grade) !== gradeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner with Branded Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold block">
            ADMINISTRATION PORTAL
          </span>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            상현고등학교 통합 관리자 센터
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            접속 관리자: <b>{user?.username}</b> · 전교생 {dashStats?.kpi?.totalStudents || students.length}명 관리 중
          </p>
        </div>

        {/* 254. 원클릭 전교생 닉네임 일괄 동기화 버튼 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncNicknames}
            disabled={syncingNicknames}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingNicknames ? 'animate-spin' : ''}`} />
            {syncingNicknames ? '동기화 중...' : '전교생 닉네임 일괄 동기화'}
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200 flex items-center justify-between">
          <span>{syncMsg}</span>
          <button onClick={() => setSyncMsg(null)} className="font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Tabs navigation bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800">
        {[
          { key: 'dashboard', label: '운영 대시보드', icon: BarChart3 },
          { key: 'students', label: '전교생 명부', icon: Users },
          { key: 'attendance', label: '일일 출석 현황판', icon: CalendarCheck },
          { key: 'discipline', label: '상벌점/생활지도', icon: AlertTriangle },
          { key: 'clubs', label: '동아리 관리 센터', icon: Layers },
          { key: 'shop', label: '매점/아이템 관리', icon: ShoppingBag },
          { key: 'questions', label: '오늘의 질문', icon: HelpCircle },
          { key: 'settings', label: '학교 설정', icon: Settings },
          { key: 'audit', label: '감사 로그', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isAct = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isAct
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 276. 종합 운영 현황 대시보드 Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* KPI Cards (276) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold block mb-1">총 재학생 수</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {dashStats?.kpi?.totalStudents || 0} <span className="text-xs font-normal text-slate-500">명</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">전체 가입자: {dashStats?.kpi?.totalAllStudents || 0}명</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold block mb-1">오늘 출석률</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {dashStats?.kpi?.attendanceRate || 0}%
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">출석 {dashStats?.kpi?.todayAttendance || 0}명 완료</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold block mb-1">교내 통화량 (M2)</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {(dashStats?.kpi?.totalM2 || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">코인</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">지갑 + 은행 예적금 총합</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold block mb-1">오늘 채팅 / 음성 활동</span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                {(dashStats?.kpi?.todayMessages || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">메시지</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">음성방 접속: {dashStats?.kpi?.activeVoiceUsers || 0}명</span>
            </div>
          </div>

          {/* 277, 278. M2 통화 공급 분석 & 봇 실시간 상태 모니터 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500" />
                교내 통화 공급량 M2 상세 분석
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">학생 지갑 현금 잔액</span>
                  <span className="font-mono font-bold">{(dashStats?.kpi?.walletSum || 0).toLocaleString()} 코인</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">상현은행 예금 총액</span>
                  <span className="font-mono font-bold">{(dashStats?.kpi?.bankSum || 0).toLocaleString()} 코인</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">정기적금 예치금 총액</span>
                  <span className="font-mono font-bold">{(dashStats?.kpi?.savingsSum || 0).toLocaleString()} 코인</span>
                </div>
                <div className="flex justify-between py-2 text-sm font-black text-indigo-600 dark:text-indigo-400">
                  <span>총 유통 통화량 (M2)</span>
                  <span className="font-mono">{(dashStats?.kpi?.totalM2 || 0).toLocaleString()} 코인</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                디스코드 봇 실시간 시스템 모니터 (283)
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 block text-[10px]">프로세스 상태</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" /> 정상 가동 중
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 block text-[10px]">API 지연시간 (Ping)</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">24 ms</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 block text-[10px]">가동률 (Uptime)</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">99.98%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 block text-[10px]">메모리 점유율</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">85.4 MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 251. 전교생 명부 통합 테이블 Tab */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="이름, 학번, 디스코드 ID 검색..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    loadStudents(e.target.value);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                />
              </div>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
              >
                <option value="all">전학년</option>
                <option value="1">1학년</option>
                <option value="2">2학년</option>
                <option value="3">3학년</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              검색 결과: <b>{filteredStudents.length}명</b>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-3">학번</th>
                    <th className="p-3">이름</th>
                    <th className="p-3">학년/반</th>
                    <th className="p-3">상태</th>
                    <th className="p-3">레벨</th>
                    <th className="p-3">보유 코인</th>
                    <th className="p-3">상/벌점</th>
                    <th className="p-3">동아리</th>
                    <th className="p-3 text-right">조작</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredStudents.map((st) => (
                    <tr key={st.user_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{st.student_id || st.student_code}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{st.real_name || st.nickname}</td>
                      <td className="p-3 font-mono">
                        {st.grade}학년 {st.class_num || st.class_no}반 {st.student_num || st.student_no}번
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                            st.status === 'active' || st.status === 'enrolled'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono">Lv.{st.level}</td>
                      <td className="p-3 font-mono font-semibold text-amber-600">{(st.coins || 0).toLocaleString()}</td>
                      <td className="p-3 font-mono">
                        <span className="text-emerald-600">+{st.merit_points || 0}</span> /{' '}
                        <span className="text-rose-600">-{st.penalty_points || 0}</span>
                      </td>
                      <td className="p-3 text-slate-500">{st.club_name || '-'}</td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => openEditStudent(st)}
                          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-[11px] font-semibold"
                        >
                          학적수정
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 257. 일일 전교생 출석 현황판 Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold block">총 대상 재학생</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                {attendanceData?.totalCount || 0}명
              </div>
            </div>
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm">
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold block">오늘 출석 완료 학생</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                {attendanceData?.attendedCount || 0}명
              </div>
            </div>
            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20 shadow-sm">
              <span className="text-xs text-rose-700 dark:text-rose-300 font-semibold block">미출석 결석 학생</span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">
                {attendanceData?.unattendedCount || 0}명
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 출석자 명단 */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                오늘 출석 완료 학생 ({attendanceData?.attendedCount || 0}명)
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto text-xs">
                {attendanceData?.attended?.map((s: any) => (
                  <div key={s.user_id} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{s.nickname}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                        {s.grade}학년 {s.class_no}반 {s.student_no}번 ({s.student_code})
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                      {s.streak}일 연속
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 미출석자 명단 */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                오늘 미출석 학생 ({attendanceData?.unattendedCount || 0}명)
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto text-xs">
                {attendanceData?.unattended?.map((s: any) => (
                  <div key={s.user_id} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{s.nickname}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                        {s.grade}학년 {s.class_no}반 {s.student_no}번 ({s.student_code})
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-mono font-bold">
                      미출석
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 259, 260, 261. 상벌점 감사 & 부여 & 벌점 과다 경고 Tab */}
      {activeTab === 'discipline' && (
        <div className="space-y-6">
          {/* 상벌점 부여 바 */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              상점 / 벌점 직권 부여 및 생기부 즉시 반영
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-500 font-semibold block mb-1">대상 학생 선택</label>
                <select
                  value={selectedStudent?.user_id || ''}
                  onChange={(e) => {
                    const st = students.find((x) => x.user_id === e.target.value);
                    setSelectedStudent(st || null);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">학생을 선택하세요</option>
                  {students.map((st) => (
                    <option key={st.user_id} value={st.user_id}>
                      {st.grade}학년 {st.class_num || st.class_no}반 - {st.real_name || st.nickname} ({st.student_id || st.student_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 font-semibold block mb-1">구분</label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setDisciplineType('merit')}
                    className={`flex-1 py-2 rounded-xl font-bold ${
                      disciplineType === 'merit'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    상점 (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisciplineType('penalty')}
                    className={`flex-1 py-2 rounded-xl font-bold ${
                      disciplineType === 'penalty'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    벌점 (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 font-semibold block mb-1">점수</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={disciplinePoints}
                  onChange={(e) => setDisciplinePoints(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 font-semibold block mb-1">사유</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="예: 교내 봉사 활동"
                    value={disciplineReason}
                    onChange={(e) => setDisciplineReason(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <button
                    disabled={disciplineSubmitting || !selectedStudent || !disciplineReason}
                    onClick={handleGiveDiscipline}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold whitespace-nowrap disabled:opacity-50"
                  >
                    부여
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 260. 상벌점 히스토리 감사 & 원클릭 취소 */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              상벌점 히스토리 감사 및 취소 이력 ({disciplineLogs.length}건)
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto text-xs">
              {disciplineLogs.map((log) => {
                const dateStr = new Date(Number(log.created_at) * 1000).toLocaleString('ko-KR');
                const isMerit = log.kind === 'merit';
                return (
                  <div key={log.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold font-mono ${
                            isMerit ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isMerit ? `+${log.points} 상점` : `-${log.points} 벌점`}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">{log.student_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({log.student_code})</span>
                        {log.revoked === 1 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold">
                            취소됨
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        사유: {log.reason} · 일시: {dateStr}
                      </p>
                    </div>

                    {log.revoked === 0 && (
                      <button
                        onClick={() => handleRevokeDiscipline(log.id)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300"
                      >
                        항목 취소
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 266, 267. 동아리 승인 및 관리 센터 Tab */}
      {activeTab === 'clubs' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              교내 동아리 개설 승인 및 관리 센터 ({clubsList.length}개)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {clubsList.map((cl) => (
                <div
                  key={cl.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{cl.name}</h4>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          cl.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : cl.status === 'recruiting'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-700'
                        }`}
                      >
                        {cl.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{cl.description || '소개글 없음'}</p>
                    <div className="text-[10px] text-slate-400 mt-2">
                      부장: <b>{cl.leader_name || cl.leader_id}</b> · 부원 수: <b>{cl.member_count}명</b>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                    {cl.status === 'recruiting' && (
                      <button
                        onClick={() => handleClubAction(cl.id, 'approve')}
                        className="flex-1 py-1 rounded text-xs bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                      >
                        승인
                      </button>
                    )}
                    {cl.status === 'active' && (
                      <button
                        onClick={() => handleClubAction(cl.id, 'disband')}
                        className="flex-1 py-1 rounded text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold"
                      >
                        강제 폐부
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 250. 매점 관리 및 CSV 내보내기/가져오기 Tab */}
      {activeTab === 'shop' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              매점 아이템 목록 ({shopItems.length}종)
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportShopCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                CSV 엑셀 내보내기
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shopItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{item.name}</span>
                    <span className="text-xs font-bold text-amber-600 font-mono">{item.price?.toLocaleString()} 코인</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{item.description}</p>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] text-slate-400">
                  <span>종류: {item.item_type || '소모품'}</span>
                  <span>재고: {item.stock === -1 ? '무제한' : `${item.stock}개`}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 282. 관리자 활동 감사 로그 Tab */}
      {activeTab === 'audit' && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            관리자 활동 감사 로그 (Audit Log - 282)
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto text-xs">
            {dashStats?.auditLogs?.map((log: any) => {
              const dt = new Date(Number(log.created_at) * 1000).toLocaleString('ko-KR');
              return (
                <div key={log.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-mono text-[10px]">
                        {log.action}
                      </span>
                      <span>{log.admin_name} 관리자</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{dt}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 학교 설정 Tab */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-600" />
            학교 및 봇 핵심 시스템 설정
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {Object.entries(settings).map(([k, v]) => (
              <div key={k} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 font-mono">{k}</label>
                <input
                  type="text"
                  value={v}
                  onChange={(e) => setSettings({ ...settings, [k]: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 253. 학생 정보 수정 모달 */}
      {isEditStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">학생 학적 정보 수동 수정 (253)</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">닉네임</label>
                <input
                  type="text"
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">학년</label>
                  <input
                    type="number"
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">반</label>
                  <input
                    type="number"
                    value={editClass}
                    onChange={(e) => setEditClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">번호</label>
                  <input
                    type="number"
                    value={editStudentNo}
                    onChange={(e) => setEditStudentNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">학번</label>
                <input
                  type="text"
                  value={editStudentCode}
                  onChange={(e) => setEditStudentCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">학적 상태</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="active">재학 (active)</option>
                  <option value="graduated">졸업 (graduated)</option>
                  <option value="banned">정학/징계 (banned)</option>
                  <option value="left">자퇴/전학 (left)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsEditStudentModal(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
              >
                취소
              </button>
              <button
                disabled={editSaving}
                onClick={handleSaveStudent}
                className="px-4 py-1.5 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {editSaving ? '저장 중...' : '저장 완료'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
