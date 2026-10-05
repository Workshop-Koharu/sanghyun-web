'use client';

import { useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  PlusCircle,
  X,
  Send,
  Sparkles,
  TrendingUp,
  Clock,
  Check,
  Camera,
} from 'lucide-react';

interface InstaPost {
  id: number;
  user_id: string;
  author_name: string;
  grade: number;
  class_no: number;
  image_url: string;
  caption: string;
  tags: string;
  likes_count: number;
  is_liked: boolean;
  comment_count: number;
  created_at: number;
}

export default function InstaFeedWidget() {
  const [posts, setPosts] = useState<InstaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadTags, setUploadTags] = useState('#상현고 #일상');
  const [submitting, setSubmitting] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    loadFeed();
  }, [sortBy]);

  async function loadFeed() {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/insta?sort=${sortBy}`, {
        cache: 'no-store',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleLike(postId: number) {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.is_liked;
          return {
            ...p,
            is_liked: nextLiked,
            likes_count: nextLiked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1),
          };
        }
        return p;
      })
    );

    try {
      await fetch('/api/student/insta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'like', postId }),
      });
    } catch {}
  }

  async function handleAddComment(postId: number) {
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);

    try {
      const res = await fetch('/api/student/insta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'comment', postId, content: commentText.trim() }),
      });

      if (res.ok) {
        setCommentText('');
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p))
        );
      }
    } catch {}
    setSubmittingComment(false);
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadUrl.trim() || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/student/insta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          imageUrl: uploadUrl.trim(),
          caption: uploadCaption.trim(),
          tags: uploadTags.trim(),
        }),
      });

      if (res.ok) {
        setIsUploadOpen(false);
        setUploadUrl('');
        setUploadCaption('');
        loadFeed();
      } else {
        const err = await res.json();
        alert(err.error || '게시물 등록에 실패했습니다.');
      }
    } catch {
      alert('네트워크 오류가 발생했습니다.');
    }
    setSubmitting(false);
  }

  function handleShare(post: InstaPost) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/dashboard?tab=insta&post=${post.id}`);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground flex items-center gap-1.5">
                상현스타그램
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-bold">
                  SANGHYUN-GRAM
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                상현고 학생들의 생생한 교내 일상, 동아리, 학교생활 사진 피드
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-accent/50 border border-border/40 text-xs">
            <button
              onClick={() => setSortBy('recent')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                sortBy === 'recent'
                  ? 'bg-card text-foreground font-bold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              최신순
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                sortBy === 'popular'
                  ? 'bg-card text-foreground font-bold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
              인기순
            </button>
          </div>

          {/* New Post Button */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            새 피드 올리기
          </button>
        </div>
      </div>

      {/* Story Rings */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {[
          { name: '공식 방송부', tag: 'ON AIR', col: 'from-amber-400 to-rose-500' },
          { name: '학생회', tag: '공지', col: 'from-blue-500 to-indigo-600' },
          { name: '1학년 3반', tag: '학급', col: 'from-emerald-400 to-teal-500' },
          { name: '과학동아리', tag: '실험', col: 'from-purple-500 to-pink-500' },
          { name: '밴드부', tag: '공연', col: 'from-rose-500 to-amber-500' },
          { name: '교내 체육관', tag: '점심', col: 'from-cyan-400 to-blue-500' },
        ].map((story, sIdx) => (
          <div key={sIdx} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
            <div className={`p-0.5 rounded-full bg-gradient-to-tr ${story.col} group-hover:scale-105 transition-transform`}>
              <div className="w-14 h-14 rounded-full bg-card border-2 border-background flex items-center justify-center font-bold text-xs text-foreground">
                {story.name.slice(0, 2)}
              </div>
            </div>
            <span className="text-[11px] font-medium text-foreground truncate max-w-[4rem] text-center">
              {story.name}
            </span>
          </div>
        ))}
      </div>

      {/* Feed Posts List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">상현스타 피드를 불러오는 중입니다...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 rounded-2xl glass border border-border/50 text-center space-y-3 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">등록된 피드가 없습니다</h3>
          <p className="text-xs text-muted-foreground">
            첫 번째 게시물을 올려 학우들과 일상을 나누고 20 코인 보너스를 받으세요!
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            피드 작성하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl glass border border-border/50 shadow-[var(--shadow-card)] overflow-hidden flex flex-col justify-between hover:border-border transition-all"
            >
              {/* Card Header */}
              <div className="p-4 flex items-center justify-between border-b border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-xs font-black text-foreground">
                      {post.author_name.slice(0, 1)}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      {post.author_name}
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent/60 text-muted-foreground">
                        {post.grade}학년 {post.class_no}반
                      </span>
                    </h4>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(post.created_at * 1000).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleShare(post)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
                  title="게시물 링크 복사"
                >
                  {copiedId === post.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Photo */}
              <div className="relative aspect-square w-full bg-black/5 overflow-hidden group select-none">
                <img
                  src={post.image_url}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onDoubleClick={() => handleToggleLike(post.id)}
                />
              </div>

              {/* Action Bar & Stats */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-all active:scale-125 ${
                        post.is_liked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{post.likes_count}</span>
                    </button>
                    <button
                      onClick={() =>
                        setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)
                      }
                      className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.comment_count}</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    #{post.id} 상현스타
                  </span>
                </div>

                {/* Caption & Hashtags */}
                <div className="space-y-1 text-xs">
                  <p className="text-foreground leading-relaxed">
                    <b className="mr-1.5 font-bold">{post.author_name}</b>
                    {post.caption}
                  </p>
                  {post.tags && (
                    <div className="flex flex-wrap gap-1 pt-1 text-[11px] text-link font-medium">
                      {post.tags.split(' ').map((t, idx) => (
                        <span key={idx} className="hover:underline cursor-pointer">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Inline Comment Section */}
                {activeCommentPostId === post.id && (
                  <div className="pt-2 border-t border-border/40 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="댓글 달기..."
                        maxLength={200}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-accent/40 border border-border/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={submittingComment || !commentText.trim()}
                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs disabled:opacity-50 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass border border-border shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Camera className="w-4 h-4 text-rose-500" />
                새 상현스타 피드 작성
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground block">
                  사진 웹 이미지 링크 (URL) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... 또는 디스코드 첨부 이미지 링크"
                  className="w-full px-3 py-2 rounded-xl bg-accent/30 border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
                {uploadUrl && uploadUrl.startsWith('http') && (
                  <div className="mt-2 aspect-video w-full rounded-xl overflow-hidden border border-border/40 bg-black/10">
                    <img src={uploadUrl} alt="미리보기" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground block">
                  게시물 본문 (캡션) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  maxLength={1000}
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="오늘의 학교생활, 급식 후기, 동아리 활동, 추억을 공유해보세요."
                  className="w-full px-3 py-2 rounded-xl bg-accent/30 border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground block">해시태그</label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="#상현고 #일상 #동아리 #점심시간"
                  className="w-full px-3 py-2 rounded-xl bg-accent/30 border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-[11px] text-foreground/90 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <span>피드를 등록하면 활동 보너스로 **20 코인**이 즉시 지급됩니다!</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl bg-accent/60 hover:bg-accent text-foreground font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting || !uploadUrl.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? '발행 중...' : '피드 올리기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
