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
  Award,
  AlertTriangle,
  Search,
  CheckCircle,
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
    async function checkAuth() {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        if (meData.authenticated && meData.user.isAdmin) {
          setUser(meData.user);
          setIsAdmin(true);
          loadSettings();
          loadStudents();
          loadShopItems();
          loadQuestions();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || {});
      }
    } catch {}
  }

  async function loadStudents(query = '') {
    try {
      const res = await fetch(`/api/admin/students?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch {}
  }

  async function loadShopItems() {
    try {
      const res = await fetch('/api/admin/shop');
      if (res.ok) {
        const data = await res.json();
        setShopItems(data.items || []);
      }
    } catch {}
  }

  async function loadQuestions() {
    try {
      const res = await fetch('/api/admin/questions');
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
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        setSettingsMsg('설정이 성공적으로 저장되었습니다.');
      } else {
        setSettingsMsg('설정 저장 실패');
      }
    } catch {
      setSettingsMsg('서버 오류가 발생했습니다.');
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">교직원 권한을 확인하는 중입니다...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="glass-panel max-w-md mx-auto p-8 rounded-3xl text-center space-y-4 my-12">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">교무실 접근 권한 없음</h2>
        <p className="text-xs text-slate-400">
          본 페이지는 상현고등학교 교직원 및 학생회 임원진(관리자 권한 보유자) 전용 포털입니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" />
            상현고등학교 교무행정처 관리 포털
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            학교 전체 설정, 학생 명부 및 상벌점, 매점 상품, 일일 질문을 중앙에서 제어합니다.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
              activeTab === 'settings' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            학교 설정
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
              activeTab === 'students' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            학생 명부 및 상벌점
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
              activeTab === 'shop' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            매점 상품 관리
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
              activeTab === 'questions' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            오늘의 질문
          </button>
        </div>
      </div>

      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" />
              학교 운영 파라미터 및 채널/역할 설정
            </h2>
            <button
              type="submit"
              disabled={settingsSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow"
            >
              <Save className="w-4 h-4" />
              {settingsSaving ? '저장 중...' : '설정 저장'}
            </button>
          </div>

          {settingsMsg && (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {settingsMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-300 text-sm border-l-2 border-amber-500 pl-2">
                디스코드 채널 연동 (ID)
              </h3>
              <div>
                <label className="block text-slate-400 mb-1">입학 신청 채널 ID (channel_admission)</label>
                <input
                  type="text"
                  value={settings['channel_admission'] || ''}
                  onChange={(e) => setSettings({ ...settings, channel_admission: e.target.value })}
                  placeholder="예: 123456789012345678"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">출석 체크 채널 ID (channel_attendance)</label>
                <input
                  type="text"
                  value={settings['channel_attendance'] || ''}
                  onChange={(e) => setSettings({ ...settings, channel_attendance: e.target.value })}
                  placeholder="예: 123456789012345678"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">상벌점 공지 채널 ID (channel_discipline)</label>
                <input
                  type="text"
                  value={settings['channel_discipline'] || ''}
                  onChange={(e) => setSettings({ ...settings, channel_discipline: e.target.value })}
                  placeholder="예: 123456789012345678"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-300 text-sm border-l-2 border-amber-500 pl-2">
                학사 운영 규칙 및 보상
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">출석 기본 코인</label>
                  <input
                    type="number"
                    value={settings['attendance_coins'] || '50'}
                    onChange={(e) => setSettings({ ...settings, attendance_coins: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">출석 기본 경험치</label>
                  <input
                    type="number"
                    value={settings['attendance_exp'] || '20'}
                    onChange={(e) => setSettings({ ...settings, attendance_exp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">은행 연이자율 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings['bank_interest_rate'] || '2.0'}
                    onChange={(e) => setSettings({ ...settings, bank_interest_rate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">학년당 최대 반 수</label>
                  <input
                    type="number"
                    value={settings['max_classes'] || '3'}
                    onChange={(e) => setSettings({ ...settings, max_classes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  loadStudents(e.target.value);
                }}
                placeholder="이름 또는 학번 검색..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-sans">
                    <th className="p-3.5">학번</th>
                    <th className="p-3.5">성명</th>
                    <th className="p-3.5">학적</th>
                    <th className="p-3.5">동아리</th>
                    <th className="p-3.5">상점</th>
                    <th className="p-3.5">벌점</th>
                    <th className="p-3.5">지갑</th>
                    <th className="p-3.5">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {students.map((st) => (
                    <tr key={st.user_id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 text-sky-400 font-bold">{st.student_id}</td>
                      <td className="p-3.5 text-white font-sans font-bold">{st.real_name}</td>
                      <td className="p-3.5 text-slate-300 font-sans">
                        {st.grade}학년 {st.class_num}반 {st.student_num}번
                      </td>
                      <td className="p-3.5 text-slate-400 font-sans">{st.club_name || '-'}</td>
                      <td className="p-3.5 text-emerald-400">+{st.merit_points}</td>
                      <td className="p-3.5 text-rose-400">-{st.penalty_points}</td>
                      <td className="p-3.5 text-amber-400">{st.coins.toLocaleString()}C</td>
                      <td className="p-3.5">
                        <button
                          onClick={() => setSelectedStudent(st)}
                          className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-sans text-[11px] font-semibold transition-all border border-amber-500/30"
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
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-slate-700 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white">
                    {selectedStudent.real_name} 학생 상벌점 부여
                  </h3>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    닫기
                  </button>
                </div>

                <form onSubmit={handleDisciplineSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">구분</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDisciplineType('merit')}
                        className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                          disciplineType === 'merit'
                            ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        상점 부여
                      </button>
                      <button
                        type="button"
                        onClick={() => setDisciplineType('penalty')}
                        className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                          disciplineType === 'penalty'
                            ? 'bg-rose-600/30 border-rose-500 text-rose-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        벌점 부과
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">부여 점수 (양의 정수)</label>
                    <input
                      type="number"
                      min="1"
                      value={disciplinePoints}
                      onChange={(e) => setDisciplinePoints(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">사유</label>
                    <textarea
                      rows={3}
                      value={disciplineReason}
                      onChange={(e) => setDisciplineReason(e.target.value)}
                      placeholder="상벌점 부과 사유를 구체적으로 입력해 주세요."
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedStudent(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={disciplineSubmitting}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">매점 판매 아이템 목록</h3>
            <button
              onClick={() => setIsAddShopModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow"
            >
              <Plus className="w-4 h-4" />
              신규 아이템 등록
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shopItems.map((item) => (
              <div
                key={item.id}
                className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3 relative group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      #{item.id} {item.item_type}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{item.name}</h4>
                  </div>
                  <button
                    onClick={() => handleDeleteShopItem(item.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-400">{item.description || '설명 없음'}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono">
                  <span className="text-amber-400 font-bold">{item.price.toLocaleString()} 코인</span>
                  <span className="text-slate-400">
                    재고: {item.stock === -1 ? '무제한' : `${item.stock}개`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {isAddShopModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-slate-700 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white">신규 매점 아이템 등록</h3>
                  <button
                    onClick={() => setIsAddShopModalOpen(false)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    닫기
                  </button>
                </div>

                <form onSubmit={handleAddShopItem} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">아이템 명칭</label>
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">아이템 설명</label>
                    <textarea
                      rows={2}
                      value={newItemDesc}
                      onChange={(e) => setNewItemDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">가격 (코인)</label>
                      <input
                        type="number"
                        min="0"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">재고 수량 (-1 무제한)</label>
                      <input
                        type="number"
                        value={newItemStock}
                        onChange={(e) => setNewItemStock(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">아이템 종류</label>
                    <select
                      value={newItemType}
                      onChange={(e) => setNewItemType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
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
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
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
        <div className="space-y-6">
          <form onSubmit={handleAddQuestion} className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              오늘의 질문 등록 및 수정
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">날짜 (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={newQDate}
                  onChange={(e) => setNewQDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">질문 내용</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newQText}
                    onChange={(e) => setNewQText(e.target.value)}
                    placeholder="학생들에게 물어볼 질문 내용을 입력하세요."
                    required
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold whitespace-nowrap"
                  >
                    등록
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-sans">
                  <th className="p-3.5">날짜</th>
                  <th className="p-3.5">질문 내용</th>
                  <th className="p-3.5">작성자 ID</th>
                  <th className="p-3.5">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {questions.map((q) => (
                  <tr key={q.date} className="hover:bg-slate-800/40">
                    <td className="p-3.5 text-sky-400 font-bold">{q.date}</td>
                    <td className="p-3.5 text-white font-sans">{q.question}</td>
                    <td className="p-3.5 text-slate-400">{q.author_id}</td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleDeleteQuestion(q.date)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
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
