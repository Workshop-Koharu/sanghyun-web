'use client';

import { useEffect, useState } from 'react';
import { MessageSquarePlus, ThumbsUp, CheckCircle2, Clock, AlertCircle, Plus, Send } from 'lucide-react';

interface Suggestion {
  id: number;
  user_id: string;
  author_name: string;
  title: string;
  content: string;
  upvotes: number;
  status: string;
  admin_response: string | null;
  created_at: number;
  grade: number;
  class_no: number;
  has_voted: boolean;
}

export default function SuggestionsBoard() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'accepted'>('all');

  useEffect(() => {
    loadSuggestions();
  }, []);

  async function loadSuggestions() {
    try {
      const res = await fetch('/api/student/suggestions', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function handleVote(id: number) {
    try {
      // Optimistic update
      setSuggestions((prev) =>
        prev.map((s) => {
          if (s.id === id) {
            const willVote = !s.has_voted;
            return {
              ...s,
              has_voted: willVote,
              upvotes: willVote ? s.upvotes + 1 : Math.max(0, s.upvotes - 1),
            };
          }
          return s;
        })
      );

      const res = await fetch('/api/student/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ suggestionId: id, action: 'vote' }),
      });
      if (!res.ok) {
        loadSuggestions();
      }
    } catch {
      loadSuggestions();
    }
  }

  async function handleCreateSuggestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/student/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: newTitle.trim(), content: newContent.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewTitle('');
        setNewContent('');
        setIsModalOpen(false);
        loadSuggestions();
        alert('건의사항이 학생회에 성공적으로 접수되었습니다!');
      } else {
        alert(data.error || '건의 등록에 실패했습니다.');
      }
    } catch {
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = suggestions.filter((s) => {
    if (filter === 'open') return s.status === 'open' || s.status === 'reviewing';
    if (filter === 'accepted') return s.status === 'accepted';
    return true;
  });

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            학생회 온라인 건의함 & 교내 청원
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            더 나은 상현고를 위한 아이디어를 제안하고 학우들의 공감을 모아보세요.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filter === 'open'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              진행 중
            </button>
            <button
              onClick={() => setFilter('accepted')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filter === 'accepted'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              수용/반영됨
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            건의하기
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 py-4">
          <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          등록된 건의사항이 없습니다. 첫 번째 건의를 제안해 보세요!
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((s) => {
            const dateStr = new Date(s.created_at * 1000).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-200 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">#{s.id}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        s.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : s.status === 'reviewing'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                          : s.status === 'rejected'
                          ? 'bg-slate-200 text-slate-600 dark:bg-slate-700'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                      }`}
                    >
                      {s.status === 'accepted'
                        ? '학생회 수용됨'
                        : s.status === 'reviewing'
                        ? '학생회 검토중'
                        : s.status === 'rejected'
                        ? '반려됨'
                        : '접수 완료'}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{s.title}</h4>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{s.content}</p>

                  {s.admin_response && (
                    <div className="p-2 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 mt-1">
                      <span className="font-bold">📢 학생회/교무처 답변:</span> {s.admin_response}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                    <span>
                      작성자: <b>{s.author_name}</b> ({s.grade}학년 {s.class_no}반)
                    </span>
                    <span>·</span>
                    <span>{dateStr}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 sm:self-center">
                  <button
                    onClick={() => handleVote(s.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                      s.has_voted
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${s.has_voted ? 'fill-white' : ''}`} />
                    <span>공감 {s.upvotes}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 새 건의 작성 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquarePlus className="w-4 h-4 text-blue-600" />
                학생회 건의사항 접수
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSuggestion} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">건의 제목 *</label>
                <input
                  type="text"
                  maxLength={50}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: 급식 잔반 줄이기 이벤트 건의, 자율학습실 환기 요청"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">상세 내용 및 제안 이유 *</label>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="학교 발전을 위한 건의 내용과 구체적인 방안을 자세히 적어주세요."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? '접수 중...' : '건의 접수하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
