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
} from 'lucide-react';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'settings' | 'students' | 'shop' | 'questions'>('settings');

  // Settings State
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null);

  // Students State
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [disciplineType, setDisciplineType] = useState<'merit' | 'penalty'>('merit');
  const [disciplinePoints, setDisciplinePoints] = useState('1');
  const [disciplineReason, setDisciplineReason] = useState('');
  const [disciplineSubmitting, setDisciplineSubmitting] = useState(false);

  // Shop State
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
            loadSettings();
            loadStudents();
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

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsMsg(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ settings }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSettingsMsg('설정이 성공적으로 저장되었습니다.');
      } else {
        setSettingsMsg(`설정 저장 실패: ${data.error || '오류가 발생했습니다.'}`);
      }
    } catch {
      setSettingsMsg('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setSettingsSaving(false);
    }
  }

  async function handleDisciplineSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    setDisciplineSubmitting(true);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedStudent.user_id,
          type: disciplineType,
          points: disciplinePoints,
          reason: disciplineReason,
        }),
      });
      if (res.ok) {
        alert('상벌점이 부여되었습니다.');
        setSelectedStudent(null);
        setDisciplineReason('');
        loadStudents(searchQuery);
      } else {
        alert('상벌점 부여 실패');
      }
    } catch {
      alert('오류가 발생했습니다.');
    } finally {
      setDisciplineSubmitting(false);
    }
  }

  async function handleAddShopItem(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItemName,
          description: newItemDesc,
          price: newItemPrice,
          stock: newItemStock,
          item_type: newItemType,
        }),
      });
      if (res.ok) {
        setIsAddShopModalOpen(false);
        setNewItemName('');
        setNewItemDesc('');
        loadShopItems();
      } else {
        alert('아이템 등록 실패');
      }
    } catch {
      alert('오류 발생');
    }
  }

  async function handleDeleteShopItem(id: number) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/admin/shop?id=${id}`, { method: 'DELETE' });
      if (res.ok) loadShopItems();
    } catch {}
  }

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newQDate, question: newQText }),
      });
      if (res.ok) {
        setNewQDate('');
        setNewQText('');
        loadQuestions();
      } else {
        alert('질문 등록 실패');
      }
    } catch {}
  }

  async function handleDeleteQuestion(date: string) {
    if (!confirm('해당 날짜의 질문을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/admin/questions?date=${date}`, { method: 'DELETE' });
      if (res.ok) loadQuestions();
    } catch {}
  }

  async function handlePublishQuestion(date: string) {
    if (!confirm(`[${date}] 오늘의 질문을 디스코드 공개 채널로 즉시 전송하시겠습니까?`)) return;
    try {
      const res = await fetch('/api/admin/questions/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('디스코드 공개 채널로 성공적으로 전송되었습니다.');
        loadQuestions();
      } else {
        alert(`전송 실패: ${data.error || '알 수 없는 오류'}`);
      }
    } catch (e: any) {
      alert(`전송 오류: ${e.message}`);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">교직원 권한을 확인하는 중입니다...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-w-md mx-auto text-center space-y-3 my-10 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
          <Shield className="w-5 h-5" />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">접근 권한 제한</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          본 페이지는 상현고등학교 교직원 전용 관리 포털입니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            교무실 관리 포털
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            학교 기본 설정, 학생 명부, 매점 상품, 일일 질문을 관리합니다.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'settings'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            학교 설정
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'students'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            학생 명부
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'shop'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            매점 상품
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'questions'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            오늘의 질문
          </button>
        </div>
      </div>

      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-500" />
                학사 운영 파라미터 및 시스템 상세 설정
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                채널 연동, 역할 지급, 경제/은행 이율, 학년제 및 알바 운영 설정을 실시간으로 변경합니다.
              </p>
            </div>
            <button
              type="submit"
              disabled={settingsSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {settingsSaving ? '저장 중...' : '전체 설정 저장'}
            </button>
          </div>

          {settingsMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {settingsMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Section 1: Channels */}
            <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs border-l-2 border-blue-500 pl-2">
                디스코드 채널 ID 연동
              </h3>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">신입생 입학 공지 채널 (channel.admission_notice)</label>
                <input
                  type="text"
                  value={settings['channel.admission_notice'] || settings['channel_admission'] || ''}
                  onChange={(e) => setSettings({ ...settings, 'channel.admission_notice': e.target.value, channel_admission: e.target.value })}
                  placeholder="예: 123456789012345678"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">관리 및 감사 로그 채널 (channel.log)</label>
                <input
                  type="text"
                  value={settings['channel.log'] || ''}
                  onChange={(e) => setSettings({ ...settings, 'channel.log': e.target.value })}
                  placeholder="예: 123456789012345678"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">생일 축하 메시지 채널 (channel.birthday)</label>
                <input
                  type="text"
                  value={settings['channel.birthday'] || ''}
                  onChange={(e) => setSettings({ ...settings, 'channel.birthday': e.target.value })}
                  placeholder="예: 123456789012345678"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">업적 달성 알림 채널 (channel.achievement)</label>
                <input
                  type="text"
                  value={settings['channel.achievement'] || ''}
                  onChange={(e) => setSettings({ ...settings, 'channel.achievement': e.target.value })}
                  placeholder="예: 123456789012345678"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">오늘의 질문 공개 채널 (channel.daily_question_public)</label>
                <input
                  type="text"
                  value={settings['channel.daily_question_public'] || ''}
                  onChange={(e) => setSettings({ ...settings, 'channel.daily_question_public': e.target.value })}
                  placeholder="예: 123456789012345678"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">오늘의 질문 관리자 패널 채널 (channel.daily_question_admin)</label>
                <input
                  type="text"
                  value={settings['channel.daily_question_admin'] || ''}
                  onChange={(e) => setSettings({ ...settings, 'channel.daily_question_admin': e.target.value })}
                  placeholder="예: 123456789012345678"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                />
              </div>
            </div>

            {/* Section 2: Roles */}
            <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs border-l-2 border-indigo-500 pl-2">
                디스코드 역할 ID 연동
              </h3>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">기본 학생 역할 ID (role.student)</label>
                <input
                  type="text"
                  value={settings['role.student'] || ''}
                  onChange={(e) => setSettings({ ...settings, 'role.student': e.target.value })}
                  placeholder="예: 123456789012345678"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">선생님 / 관리자 역할 ID (role.teacher)</label>
                <input
                  type="text"
                  value={settings['role.teacher'] || ''}
                  onChange={(e) => setSettings({ ...settings, 'role.teacher': e.target.value })}
                  placeholder="예: 123456789012345678"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">학생회 역할 ID (role.council)</label>
                <input
                  type="text"
                  value={settings['role.council'] || ''}
                  onChange={(e) => setSettings({ ...settings, 'role.council': e.target.value })}
                  placeholder="예: 123456789012345678"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">졸업생 역할 ID (role.graduate)</label>
                <input
                  type="text"
                  value={settings['role.graduate'] || ''}
                  onChange={(e) => setSettings({ ...settings, 'role.graduate': e.target.value })}
                  placeholder="예: 123456789012345678"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">생일자 역할 ID (role.birthday)</label>
                <input
                  type="text"
                  value={settings['role.birthday'] || ''}
                  onChange={(e) => setSettings({ ...settings, 'role.birthday': e.target.value })}
                  placeholder="예: 123456789012345678"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">입학 시 추가 지급 역할 ID 목록 (쉼표 구분)</label>
                <input
                  type="text"
                  value={settings['role.admission_extra'] || ''}
                  onChange={(e) => setSettings({ ...settings, 'role.admission_extra': e.target.value })}
                  placeholder="1553284771386499184, 1556200525182009435..."
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                />
              </div>
            </div>

            {/* Section 3: Economy & Bank */}
            <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs border-l-2 border-emerald-500 pl-2">
                경제 및 은행 / 알바 운영 파라미터
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">출석 최소 코인</label>
                  <input
                    type="number"
                    value={settings['attendance.point_min'] || settings['attendance_coins'] || '50'}
                    onChange={(e) => setSettings({ ...settings, 'attendance.point_min': e.target.value, attendance_coins: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">출석 최대 코인</label>
                  <input
                    type="number"
                    value={settings['attendance.point_max'] || '150'}
                    onChange={(e) => setSettings({ ...settings, 'attendance.point_max': e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">예금 일일 이율 bps (20bps = 0.2%)</label>
                  <input
                    type="number"
                    value={settings['bank.daily_rate_bps'] || '20'}
                    onChange={(e) => setSettings({ ...settings, 'bank.daily_rate_bps': e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">예금 최대 한도 (코인)</label>
                  <input
                    type="number"
                    value={settings['bank.deposit_limit'] || '5000000'}
                    onChange={(e) => setSettings({ ...settings, 'bank.deposit_limit': e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">송금 수수료 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={settings['economy.transfer_fee_percent'] || '5'}
                    onChange={(e) => setSettings({ ...settings, 'economy.transfer_fee_percent': e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">알바 쿨타임 (분)</label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={settings['part_time.cooldown_minutes'] || '30'}
                    onChange={(e) => setSettings({ ...settings, 'part_time.cooldown_minutes': e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Academic Operations */}
            <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs border-l-2 border-amber-500 pl-2">
                학사 운영 및 자동화 규칙
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">학년당 반 개수</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings['class.count'] || settings['max_classes'] || '5'}
                    onChange={(e) => setSettings({ ...settings, 'class.count': e.target.value, max_classes: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">승급 주기 (개월)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={settings['grade.promotion_months'] || '4'}
                    onChange={(e) => setSettings({ ...settings, 'grade.promotion_months': e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">최대 학년 (초과 시 졸업)</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={settings['grade.max_grade'] || '3'}
                    onChange={(e) => setSettings({ ...settings, 'grade.max_grade': e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">업적 달성 알림 전송</label>
                  <select
                    value={settings['achievement.notify'] === 'false' ? 'false' : 'true'}
                    onChange={(e) => setSettings({ ...settings, 'achievement.notify': e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
                  >
                    <option value="true">알림 켜기 (공개)</option>
                    <option value="false">알림 끄기 (조용히)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">오늘의 질문 자동 전송 (시)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={settings['question.hour'] || '9'}
                    onChange={(e) => setSettings({ ...settings, 'question.hour': e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">오늘의 질문 자동 전송 (분)</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={settings['question.minute'] || '0'}
                    onChange={(e) => setSettings({ ...settings, 'question.minute': e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                loadStudents(e.target.value);
              }}
              placeholder="이름 또는 학번 검색..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-sans">
                    <th className="p-3">학번</th>
                    <th className="p-3">성명</th>
                    <th className="p-3">학적</th>
                    <th className="p-3">동아리</th>
                    <th className="p-3">상점</th>
                    <th className="p-3">벌점</th>
                    <th className="p-3">지갑</th>
                    <th className="p-3">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map((st) => (
                    <tr key={st.user_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 text-blue-600 dark:text-blue-400 font-bold">{st.student_id}</td>
                      <td className="p-3 text-slate-900 dark:text-white font-sans font-bold">{st.real_name}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 font-sans">
                        {st.grade}학년 {st.class_num}반 {st.student_num}번
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 font-sans">{st.club_name || '-'}</td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+{st.merit_points}</td>
                      <td className="p-3 text-rose-600 dark:text-rose-400 font-bold">-{st.penalty_points}</td>
                      <td className="p-3 text-amber-600 dark:text-amber-400">{st.coins.toLocaleString()}C</td>
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedStudent(st)}
                          className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 font-sans text-xs font-medium transition-colors border border-amber-200 dark:border-amber-800"
                        >
                          상벌점 부여
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedStudent && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-md w-full p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedStudent.real_name} 학생 상벌점 부여
                  </h3>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
                  >
                    닫기
                  </button>
                </div>

                <form onSubmit={handleDisciplineSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1">구분</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDisciplineType('merit')}
                        className={`flex-1 py-1.5 rounded-lg font-bold border transition-all ${
                          disciplineType === 'merit'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}
                      >
                        상점
                      </button>
                      <button
                        type="button"
                        onClick={() => setDisciplineType('penalty')}
                        className={`flex-1 py-1.5 rounded-lg font-bold border transition-all ${
                          disciplineType === 'penalty'
                            ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}
                      >
                        벌점
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1">부여 점수 (양의 정수)</label>
                    <input
                      type="number"
                      min="1"
                      value={disciplinePoints}
                      onChange={(e) => setDisciplinePoints(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1">사유</label>
                    <textarea
                      rows={3}
                      value={disciplineReason}
                      onChange={(e) => setDisciplineReason(e.target.value)}
                      placeholder="사유를 구체적으로 입력하세요."
                      required
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedStudent(null)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={disciplineSubmitting}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                    >
                      {disciplineSubmitting ? '처리 중...' : '부여하기'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'shop' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">매점 판매 아이템</h3>
            <button
              onClick={() => setIsAddShopModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              신규 등록
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {shopItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2 relative"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                      #{item.id} {item.item_type}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">{item.name}</h4>
                  </div>
                  <button
                    onClick={() => handleDeleteShopItem(item.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.description || '설명 없음'}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">{item.price.toLocaleString()} 코인</span>
                  <span className="text-slate-500">
                    재고: {item.stock === -1 ? '무제한' : `${item.stock}개`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {isAddShopModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-md w-full p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">신규 매점 아이템 등록</h3>
                  <button
                    onClick={() => setIsAddShopModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    닫기
                  </button>
                </div>

                <form onSubmit={handleAddShopItem} className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1">아이템 명칭</label>
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1">설명</label>
                    <textarea
                      rows={2}
                      value={newItemDesc}
                      onChange={(e) => setNewItemDesc(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 mb-1">가격 (코인)</label>
                      <input
                        type="number"
                        min="0"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        required
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 mb-1">재고 수량 (-1 무제한)</label>
                      <input
                        type="number"
                        value={newItemStock}
                        onChange={(e) => setNewItemStock(e.target.value)}
                        required
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1">종류</label>
                    <select
                      value={newItemType}
                      onChange={(e) => setNewItemType(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                    >
                      <option value="general">일반 (general)</option>
                      <option value="title">칭호 (title)</option>
                      <option value="role">디스코드 역할 (role)</option>
                      <option value="consumable">소모품 (consumable)</option>
                      <option value="badge_frame">학생증 프레임 (badge_frame)</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddShopModalOpen(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                    >
                      등록하기
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="space-y-4">
          <form onSubmit={handleAddQuestion} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-amber-500" />
              오늘의 질문 등록 및 수정
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">날짜 (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={newQDate}
                  onChange={(e) => setNewQDate(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-500 dark:text-slate-400 mb-1">질문 내용</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newQText}
                    onChange={(e) => setNewQText(e.target.value)}
                    placeholder="학생들에게 물어볼 질문 내용을 입력하세요."
                    required
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold whitespace-nowrap"
                  >
                    등록
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-sans">
                  <th className="p-3">날짜</th>
                  <th className="p-3">질문 내용</th>
                  <th className="p-3">작성자 ID</th>
                  <th className="p-3">상태</th>
                  <th className="p-3 text-center">디스코드 전송</th>
                  <th className="p-3 text-center">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {questions.map((q) => (
                  <tr key={q.date} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 text-blue-600 dark:text-blue-400 font-bold">{q.date}</td>
                    <td className="p-3 text-slate-900 dark:text-white font-sans">{q.question}</td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">{q.author_id}</td>
                    <td className="p-3">
                      {q.public_message_id ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          게시 완료
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                          미게시
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handlePublishQuestion(q.date)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        전송
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteQuestion(q.date)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
