'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  UserCheck,
  Search,
  Check,
  X,
  Clock,
  Sparkles,
  Shield,
  Heart,
  MessageCircle,
  GraduationCap,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface FriendItem {
  friend_user_id: string;
  friendship_date: number;
  real_name: string;
  grade: number;
  class_num: number;
  student_num: number;
  club_name?: string | null;
  mbti?: string | null;
  one_line?: string | null;
  level: number;
}

interface PendingReceivedItem {
  requester_user_id: string;
  requested_at: number;
  real_name: string;
  grade: number;
  class_num: number;
  student_num: number;
  club_name?: string | null;
  level: number;
}

interface SuggestionItem {
  user_id: string;
  real_name: string;
  grade: number;
  class_num: number;
  student_num: number;
  club_name?: string | null;
  level: number;
}

export default function FriendsWidget() {
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'requests' | 'search'>('list');
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [pendingReceived, setPendingReceived] = useState<PendingReceivedItem[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadFriendsData();
  }, []);

  async function loadFriendsData() {
    setLoading(true);
    try {
      const res = await fetch('/api/student/friends', {
        cache: 'no-store',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends || []);
        setPendingReceived(data.pendingReceived || []);
        setSuggestions(data.suggestions || []);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }

  function showMessage(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  }

  async function handleAccept(requesterUserId: string) {
    setActionLoadingId(requesterUserId);
    try {
      const res = await fetch('/api/student/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'accept', targetUserId: requesterUserId }),
      });
      if (res.ok) {
        showMessage('친구 요청을 수락했습니다!');
        await loadFriendsData();
      }
    } catch {}
    setActionLoadingId(null);
  }

  async function handleReject(requesterUserId: string) {
    setActionLoadingId(requesterUserId);
    try {
      const res = await fetch('/api/student/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'reject', targetUserId: requesterUserId }),
      });
      if (res.ok) {
        showMessage('친구 요청을 거절했습니다.');
        await loadFriendsData();
      }
    } catch {}
    setActionLoadingId(null);
  }

  async function handleSendRequest(targetUserId: string) {
    setActionLoadingId(targetUserId);
    try {
      const res = await fetch('/api/student/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'request', targetUserId }),
      });
      if (res.ok) {
        showMessage('친구 요청을 전송했습니다!');
        await loadFriendsData();
      } else {
        const err = await res.json();
        alert(err.error || '친구 요청 전송 실패');
      }
    } catch {
      alert('네트워크 오류가 발생했습니다.');
    }
    setActionLoadingId(null);
  }

  async function handleRemoveFriend(targetUserId: string, name: string) {
    if (!confirm(`${name} 학우와의 친구 관계를 해제하시겠습니까?`)) return;
    setActionLoadingId(targetUserId);
    try {
      const res = await fetch('/api/student/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'remove', targetUserId }),
      });
      if (res.ok) {
        showMessage('친구 관계를 해제했습니다.');
        await loadFriendsData();
      }
    } catch {}
    setActionLoadingId(null);
  }

  const filteredFriends = friends.filter(
    (f) =>
      f.real_name.includes(searchQuery) ||
      `${f.grade}학년`.includes(searchQuery) ||
      `${f.class_num}반`.includes(searchQuery) ||
      (f.club_name && f.club_name.includes(searchQuery))
  );

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.real_name.includes(searchQuery) ||
      `${s.grade}학년`.includes(searchQuery) ||
      `${s.class_num}반`.includes(searchQuery) ||
      (s.club_name && s.club_name.includes(searchQuery))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-sm">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground flex items-center gap-1.5">
                상현고 학우·친구 시스템
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20">
                  FRIENDS
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                동급생, 선후배, 동아리 부원들과 친구를 맺고 학교 생활을 함께 소통하세요.
              </p>
            </div>
          </div>
        </div>

        {/* Sub Tab buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary/50 border border-border/50 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveSubTab('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'list'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            내 친구 ({friends.length})
          </button>
          <button
            onClick={() => setActiveSubTab('requests')}
            className={`relative px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'requests'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            받은 요청
            {pendingReceived.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {pendingReceived.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('search')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'search'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            학우 찾기 & 친추
          </button>
        </div>
      </div>

      {/* Floating Success Toast */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search Input Filter */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            activeSubTab === 'list'
              ? '친구 이름, 학년, 반 또는 동아리로 검색...'
              : '추천 학우 이름, 학년, 반 검색...'
          }
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary/30 border border-border/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground">친구 및 학우 데이터를 불러오는 중입니다...</p>
        </div>
      ) : activeSubTab === 'list' ? (
        /* Tab 1: My Friends */
        filteredFriends.length === 0 ? (
          <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-border/60 p-8">
            <Users className="w-10 h-10 text-muted-foreground/50 mx-auto" />
            <h3 className="text-sm font-bold text-foreground">
              {searchQuery ? '검색 결과에 맞는 친구가 없습니다.' : '아직 등록된 친구가 없습니다.'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              상단 &apos;학우 찾기 & 친추&apos; 탭에서 같은 반 학우나 동아리 친구에게 친구 요청을 보내보세요!
            </p>
            <button
              onClick={() => setActiveSubTab('search')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              학우 찾아보기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredFriends.map((f) => (
              <div
                key={f.friend_user_id}
                className="p-4 rounded-xl glass border border-border/60 hover:border-primary/40 transition-all space-y-3 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-sm text-white shadow-sm">
                      {f.real_name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-foreground">{f.real_name}</h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 font-bold">
                          Lv.{f.level}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {f.grade}학년 {f.class_num}반 {f.student_num}번
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveFriend(f.friend_user_id, f.real_name)}
                    disabled={actionLoadingId === f.friend_user_id}
                    title="친구 삭제"
                    className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Sub details: Club & One-line */}
                <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground space-y-1">
                  {f.club_name && (
                    <div className="flex items-center gap-1 text-indigo-400">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{f.club_name}</span>
                    </div>
                  )}
                  {f.mbti && (
                    <span className="inline-block px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono text-muted-foreground mr-1.5">
                      {f.mbti}
                    </span>
                  )}
                  {f.one_line ? (
                    <p className="italic text-foreground/80 line-clamp-1">&ldquo;{f.one_line}&rdquo;</p>
                  ) : (
                    <p className="text-muted-foreground/50">등록된 한 줄 소개가 없습니다.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeSubTab === 'requests' ? (
        /* Tab 2: Pending Received Requests */
        pendingReceived.length === 0 ? (
          <div className="py-16 text-center space-y-2 rounded-2xl border border-dashed border-border/60 p-8">
            <Check className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <h3 className="text-sm font-bold text-foreground">새로운 친구 요청이 없습니다.</h3>
            <p className="text-xs text-muted-foreground">
              친구 요청이 들어오면 이곳에서 바로 수락하거나 거절할 수 있습니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {pendingReceived.map((req) => (
              <div
                key={req.requester_user_id}
                className="p-4 rounded-xl glass border border-amber-500/30 bg-amber-500/5 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center font-black text-sm text-white shadow-sm">
                      {req.real_name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-foreground">{req.real_name}</h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 font-bold">
                          Lv.{req.level}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {req.grade}학년 {req.class_num}반 {req.student_num}번
                        {req.club_name ? ` · ${req.club_name}` : ''}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-amber-500 font-medium">대기 중</span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                  <button
                    onClick={() => handleAccept(req.requester_user_id)}
                    disabled={actionLoadingId === req.requester_user_id}
                    className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    수락
                  </button>
                  <button
                    onClick={() => handleReject(req.requester_user_id)}
                    disabled={actionLoadingId === req.requester_user_id}
                    className="px-4 py-2 rounded-lg bg-secondary hover:bg-accent text-muted-foreground hover:text-foreground font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    거절
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Tab 3: Search & Add Friends */
        <div className="space-y-4">
          <div className="text-xs text-muted-foreground">
            상현고등학교에 등록된 학우 목록입니다. 같은 반 학우나 동아리 친구를 찾아 친구 요청을 보내보세요.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSuggestions.map((s) => (
              <div
                key={s.user_id}
                className="p-3.5 rounded-xl glass border border-border/50 hover:border-primary/40 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center font-bold text-xs text-foreground">
                    {s.real_name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-foreground">{s.real_name}</h4>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Lv.{s.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {s.grade}학년 {s.class_num}반 {s.student_num}번
                      {s.club_name ? ` · ${s.club_name}` : ''}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleSendRequest(s.user_id)}
                  disabled={actionLoadingId === s.user_id}
                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center gap-1 shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  친추
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
