'use client';

import { useState, useEffect, useRef } from 'react';
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
  UploadCloud,
  LogIn,
  Maximize2,
  AlertCircle,
  Loader2,
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

interface PostComment {
  id: number;
  post_id: number;
  user_id: string;
  author_name: string;
  content: string;
  created_at: number;
}

export default function InstaFeedWidget() {
  const [posts, setPosts] = useState<InstaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadImageData, setUploadImageData] = useState<string | null>(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadTags, setUploadTags] = useState('#상현고 #일상');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox Modal state
  const [selectedPost, setSelectedPost] = useState<InstaPost | null>(null);
  const [selectedComments, setSelectedComments] = useState<PostComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [modalCommentText, setModalCommentText] = useState('');
  const [submittingModalComment, setSubmittingModalComment] = useState(false);

  // Quick Inline comments & share
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);
  const [inlineCommentText, setInlineCommentText] = useState('');
  const [submittingInlineComment, setSubmittingInlineComment] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    checkAuth();
    loadFeed();
  }, [sortBy]);

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setIsLoggedIn(!!(data.authenticated && data.user));
      }
    } catch {}
  }

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

  async function openPostLightbox(post: InstaPost) {
    setSelectedPost(post);
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/student/insta?postId=${post.id}`, {
        cache: 'no-store',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedComments(data.comments || []);
      }
    } catch {}
    setLoadingComments(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 선택할 수 있습니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 최대 5MB까지 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadImageData(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
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

    if (selectedPost && selectedPost.id === postId) {
      const nextLiked = !selectedPost.is_liked;
      setSelectedPost({
        ...selectedPost,
        is_liked: nextLiked,
        likes_count: nextLiked ? selectedPost.likes_count + 1 : Math.max(0, selectedPost.likes_count - 1),
      });
    }

    try {
      await fetch('/api/student/insta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'like', postId }),
      });
    } catch {}
  }

  async function handleAddModalComment() {
    if (!selectedPost || !modalCommentText.trim() || submittingModalComment) return;
    setSubmittingModalComment(true);

    try {
      const res = await fetch('/api/student/insta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'comment',
          postId: selectedPost.id,
          content: modalCommentText.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setSelectedComments((prev) => [...prev, data.comment]);
        }
        setModalCommentText('');
        // Update post comment count
        setPosts((prev) =>
          prev.map((p) => (p.id === selectedPost.id ? { ...p, comment_count: p.comment_count + 1 } : p))
        );
      } else {
        const err = await res.json();
        alert(err.error || '댓글 등록에 실패했습니다.');
      }
    } catch {
      alert('네트워크 오류가 발생했습니다.');
    }
    setSubmittingModalComment(false);
  }

  async function handleAddInlineComment(postId: number) {
    if (!inlineCommentText.trim() || submittingInlineComment) return;
    setSubmittingInlineComment(true);

    try {
      const res = await fetch('/api/student/insta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'comment',
          postId,
          content: inlineCommentText.trim(),
        }),
      });

      if (res.ok) {
        setInlineCommentText('');
        setActiveCommentPostId(null);
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p))
        );
      }
    } catch {}
    setSubmittingInlineComment(false);
  }

  function handleOpenUploadClick() {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    setIsUploadOpen(true);
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadImageData || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/student/insta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          imageUrl: uploadImageData,
          caption: uploadCaption.trim(),
          tags: uploadTags.trim(),
        }),
      });

      if (res.ok) {
        setIsUploadOpen(false);
        setUploadImageData(null);
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

  function formatRelativeTime(ts: number) {
    const diff = Math.floor(Date.now() / 1000) - ts;
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
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
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20">
                  SH-GRAM
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                상현고 학우들과 사진으로 나누는 소소한 일상, 급식, 동아리 활동 (+20 코인 지급)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Sort Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-secondary/50 border border-border/50 text-xs">
            <button
              onClick={() => setSortBy('recent')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                sortBy === 'recent'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              최신순
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                sortBy === 'popular'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              인기순
            </button>
          </div>

          {/* New Post Button */}
          <button
            onClick={handleOpenUploadClick}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            사진 올리기
          </button>
        </div>
      </div>

      {/* Stories Carousel */}
      <div className="p-4 rounded-2xl glass border border-border/60 overflow-hidden">
        <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-foreground">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>오늘의 상현 스토리</span>
        </div>
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
          {/* Upload story trigger */}
          <button
            onClick={handleOpenUploadClick}
            className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
          >
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-primary/60 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-foreground">내 스토리</span>
          </button>

          {posts.slice(0, 8).map((p) => (
            <button
              key={p.id}
              onClick={() => openPostLightbox(p)}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
            >
              <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full border-2 border-background overflow-hidden bg-slate-800">
                  <img src={p.image_url} alt={p.author_name} className="w-full h-full object-cover" />
                </div>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground truncate max-w-[60px]">
                {p.author_name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Feed List Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground">상현스타 피드를 불러오는 중입니다...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center space-y-3 rounded-2xl border border-dashed border-border/60 p-8">
          <ImageIcon className="w-10 h-10 text-muted-foreground/40 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">아직 등록된 사진 피드가 없습니다.</h3>
          <p className="text-xs text-muted-foreground">
            상현고등학교의 첫 번째 사진을 올려보세요! +20 코인 활동 보상을 드립니다.
          </p>
          <button
            onClick={handleOpenUploadClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md"
          >
            <Camera className="w-4 h-4" />
            첫 사진 올리기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl glass border border-border/60 overflow-hidden shadow-sm hover:border-primary/40 transition-all flex flex-col group"
            >
              {/* Post Header */}
              <div className="p-3.5 flex items-center justify-between border-b border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {post.author_name.slice(0, 1)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground leading-none">{post.author_name}</h4>
                    <span className="text-[10px] text-muted-foreground">
                      {post.grade}학년 {post.class_no}반 · {formatRelativeTime(post.created_at)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => openPostLightbox(post)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40"
                  title="크게 보기"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Photo Card - Click to open Lightbox Modal */}
              <div
                onClick={() => openPostLightbox(post)}
                className="relative aspect-square w-full bg-black/40 overflow-hidden cursor-pointer select-none group/img"
              >
                <img
                  src={post.image_url}
                  alt={post.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5" />
                    상세보기
                  </div>
                </div>
              </div>

              {/* Actions & Stats */}
              <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center gap-1 text-xs font-bold transition-all ${
                          post.is_liked ? 'text-rose-500 scale-110' : 'text-muted-foreground hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{post.likes_count}</span>
                      </button>

                      <button
                        onClick={() => openPostLightbox(post)}
                        className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comment_count}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleShare(post)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                      title="링크 복사"
                    >
                      {copiedId === post.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Caption & Tags */}
                  <div className="mt-2.5 space-y-1">
                    <p className="text-xs text-foreground/90 line-clamp-2 leading-relaxed">
                      <span className="font-bold mr-1.5">{post.author_name}</span>
                      {post.caption}
                    </p>
                    {post.tags && (
                      <p className="text-[11px] text-indigo-400 font-medium line-clamp-1">{post.tags}</p>
                    )}
                  </div>
                </div>

                {/* Inline Comment Trigger */}
                <div className="pt-2 border-t border-border/40">
                  {activeCommentPostId === post.id ? (
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        maxLength={200}
                        value={inlineCommentText}
                        onChange={(e) => setInlineCommentText(e.target.value)}
                        placeholder="댓글을 남겨주세요..."
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-secondary/40 border border-border/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={() => handleAddInlineComment(post.id)}
                        disabled={submittingInlineComment || !inlineCommentText.trim()}
                        className="px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-xs disabled:opacity-50"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveCommentPostId(post.id);
                        setInlineCommentText('');
                      }}
                      className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {post.comment_count > 0 ? `댓글 ${post.comment_count}개 모두 보기` : '댓글 작성하기...'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Enlarged Post Modal ("게시물 클릭했을 때 뜨게") */}
      {selectedPost && (
        <div
          onClick={() => setSelectedPost(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[92vh] rounded-2xl glass border border-border/70 overflow-hidden shadow-2xl flex flex-col md:flex-row bg-background"
          >
            {/* Left: High-Res Photo View */}
            <div className="flex-1 bg-black/90 flex items-center justify-center relative min-h-[300px] md:min-h-[500px]">
              <img
                src={selectedPost.image_url}
                alt={selectedPost.caption}
                className="max-h-[75vh] w-full object-contain"
              />
              <button
                onClick={() => setSelectedPost(null)}
                className="md:hidden absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Right: Author, Caption & Comments Thread */}
            <div className="w-full md:w-96 flex flex-col border-t md:border-t-0 md:border-l border-border/50 max-h-[50vh] md:max-h-[75vh]">
              {/* Header */}
              <div className="p-4 border-b border-border/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
                    {selectedPost.author_name.slice(0, 1)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{selectedPost.author_name}</h4>
                    <span className="text-[10px] text-muted-foreground">
                      {selectedPost.grade}학년 {selectedPost.class_no}반
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPost(null)}
                  className="hidden md:flex p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Comments & Caption */}
              <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
                {/* Caption as top comment */}
                <div className="flex gap-2.5 pb-3 border-b border-border/30">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                    {selectedPost.author_name.slice(0, 1)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-foreground leading-relaxed">
                      <span className="font-bold mr-1.5">{selectedPost.author_name}</span>
                      {selectedPost.caption}
                    </p>
                    {selectedPost.tags && (
                      <p className="text-[11px] text-indigo-400">{selectedPost.tags}</p>
                    )}
                    <span className="text-[10px] text-muted-foreground block">
                      {formatRelativeTime(selectedPost.created_at)}
                    </span>
                  </div>
                </div>

                {/* Comment list */}
                {loadingComments ? (
                  <div className="py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    댓글 불러오는 중...
                  </div>
                ) : selectedComments.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
                  </div>
                ) : (
                  selectedComments.map((c) => (
                    <div key={c.id} className="flex gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-secondary text-foreground flex items-center justify-center text-[10px] font-bold shrink-0">
                        {c.author_name.slice(0, 1)}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-foreground leading-relaxed">
                          <span className="font-bold mr-1.5">{c.author_name}</span>
                          {c.content}
                        </p>
                        <span className="text-[10px] text-muted-foreground block">
                          {formatRelativeTime(c.created_at)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Likes & Comment Input Footer */}
              <div className="p-3.5 border-t border-border/40 shrink-0 space-y-3 bg-secondary/10">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleToggleLike(selectedPost.id)}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-all ${
                      selectedPost.is_liked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${selectedPost.is_liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>좋아요 {selectedPost.likes_count}개</span>
                  </button>

                  <span className="text-[10px] text-muted-foreground font-mono">
                    {new Date(selectedPost.created_at * 1000).toLocaleDateString('ko-KR')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={200}
                    value={modalCommentText}
                    onChange={(e) => setModalCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddModalComment();
                    }}
                    placeholder="댓글 작성..."
                    className="flex-1 px-3 py-2 rounded-xl bg-secondary/50 border border-border/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleAddModalComment}
                    disabled={submittingModalComment || !modalCommentText.trim()}
                    className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal with File Explorer Picker ("웹앱이면 파일 탐색기 열리게") */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass border border-border shadow-2xl p-6 space-y-5 bg-background">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Camera className="w-4 h-4 text-rose-500" />
                새 상현스타 피드 작성
              </h3>
              <button
                onClick={() => {
                  setIsUploadOpen(false);
                  setUploadImageData(null);
                }}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              {/* Native File Input triggered by button or drag area */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground block">
                  사진 선택 <span className="text-rose-500">*</span>
                </label>

                {uploadImageData ? (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border/60 bg-black/10 group">
                    <img src={uploadImageData} alt="미리보기" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md text-white font-bold text-xs hover:bg-white/30"
                      >
                        사진 변경
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadImageData(null)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/80 text-white font-bold text-xs hover:bg-rose-500"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video w-full rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/60 bg-secondary/20 hover:bg-secondary/40 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer p-6 text-center group"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">컴퓨터/모바일 사진 선택하기</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        클릭하여 파일 탐색기에서 사진을 선택하세요 (PNG, JPG, WebP)
                      </p>
                    </div>
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
                  className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground block">해시태그</label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="#상현고 #일상 #친구"
                  className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>사진을 등록하면 학사 장학금 +20 코인이 지갑에 자동 적립됩니다.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadOpen(false);
                    setUploadImageData(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground text-xs font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting || !uploadImageData || !uploadCaption.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all"
                >
                  {submitting ? '등록 중...' : '게시물 등록 (+20 코인)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discord Login Prompt Modal ("디코 로그인되어있어야만 되게") */}
      {showLoginPrompt && (
        <div
          onClick={() => setShowLoginPrompt(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl glass border border-border shadow-2xl p-6 text-center space-y-4 bg-background"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center">
              <LogIn className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-foreground">디스코드 로그인이 필요합니다</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                상현스타는 상현고 학생 인증을 거친 학우만 게시물을 작성할 수 있습니다. 디스코드 계정으로 간편하게 로그인해보세요.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href="/api/auth/login"
                className="w-full py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                디스코드 계정으로 로그인
              </a>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="w-full py-2 rounded-xl text-muted-foreground hover:text-foreground text-xs font-semibold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
