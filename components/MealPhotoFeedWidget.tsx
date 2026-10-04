'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Camera, Plus, Sparkles, MessageSquare, Utensils, X, Check, Image as ImageIcon } from 'lucide-react';

interface MealPhoto {
  id: number;
  user_id: string;
  author_name: string;
  grade: number;
  class_no: number;
  image_url: string;
  comment: string;
  meal_date: string;
  meal_type: string;
  likes: number;
  created_at: number;
  is_liked: boolean;
}

export default function MealPhotoFeedWidget() {
  const [photos, setPhotos] = useState<MealPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [comment, setComment] = useState('');
  const [mealType, setMealType] = useState('중식');
  const [submitting, setSubmitting] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchPhotos = async (dateStr: string = '') => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/meal-photos?date=${dateStr}`);
      const json = await res.json();
      if (json.photos) {
        setPhotos(json.photos);
      }
    } catch (err) {
      console.error('Failed to load meal photos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos(filterDate);
  }, [filterDate]);

  const handleToggleLike = async (photoId: number) => {
    // Optimistic UI update
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === photoId) {
          const nextLiked = !p.is_liked;
          return {
            ...p,
            is_liked: nextLiked,
            likes: nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
          };
        }
        return p;
      })
    );

    try {
      const res = await fetch('/api/student/meal-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', photoId }),
      });
      const data = await res.json();
      if (data.success && typeof data.likes === 'number') {
        setPhotos((prev) =>
          prev.map((p) => (p.id === photoId ? { ...p, is_liked: data.liked, likes: data.likes } : p))
        );
      }
    } catch (err) {
      console.error('Like toggle error:', err);
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/student/meal-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          comment,
          mealType,
        }),
      });
      const data = await res.json();
      if (data.success && data.photo) {
        setPhotos((prev) => [data.photo, ...prev]);
        setIsModalOpen(false);
        setImageUrl('');
        setComment('');
        setStatusMessage(data.message || '사진이 성공적으로 업로드되었습니다!');
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        alert(data.error || '사진 업로드에 실패했습니다.');
      }
    } catch (err) {
      alert('업로드 중 네트워크 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10 border border-orange-200 dark:border-orange-950/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 dark:text-white">실시간 급식 식판 피드</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500 text-white animate-pulse">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              오늘 나온 급식 사진을 올리고 친구들의 식판에 실시간 좋아요를 눌러보세요! (등록 시 +20 코인)
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 shadow-sm transition active:scale-95"
        >
          <Camera className="w-4 h-4" />
          식판 사진 올리기
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          {statusMessage}
        </div>
      )}

      {/* Feed Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-3">
          <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-500 flex items-center justify-center mx-auto">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">아직 등록된 급식 사진이 없습니다</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            오늘 가장 먼저 급식 식판 사진을 찍어 올려보세요! 첫 게시자에게 매점 보너스 코인이 지급됩니다.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-sm transition"
          >
            첫 사진 올리기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition duration-200 flex flex-col"
            >
              {/* Author Header */}
              <div className="p-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 text-white font-bold text-xs flex items-center justify-center">
                    {photo.author_name.slice(0, 1)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                      {photo.author_name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {photo.grade}학년 {photo.class_no}반 • {photo.meal_type}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {photo.meal_date}
                </span>
              </div>

              {/* Photo Display */}
              <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={photo.image_url}
                  alt="급식 식판 사진"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  onError={(e) => {
                    // Fallback to sample Korean school lunch tray illustration if link broken
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-white font-medium flex items-center gap-1">
                  <Utensils className="w-3 h-3 text-amber-400" />
                  {photo.meal_type}
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleToggleLike(photo.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-90 ${
                      photo.is_liked
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-500'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 transition ${photo.is_liked ? 'fill-rose-500 text-rose-500 scale-110' : ''}`}
                    />
                    <span>{photo.likes}</span>
                  </button>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>실시간 급식평</span>
                  </div>
                </div>

                {photo.comment && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                    <span className="font-semibold text-slate-900 dark:text-white mr-1.5">
                      {photo.author_name}
                    </span>
                    {photo.comment}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">오늘의 급식 사진 올리기</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadPhoto} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  식단 구분
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['중식', '석식'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMealType(type)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        mealType === type
                          ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  사진 이미지 URL <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    placeholder="https://... 식판 사진 URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 pl-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  * 디스코드에 올린 사진 링크나 Imgur 등 웹 이미지 주소를 입력하세요.
                </p>
              </div>

              {imageUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100">
                  <img src={imageUrl} alt="미리보기" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  한 줄 평 (최대 100자)
                </label>
                <textarea
                  rows={2}
                  maxLength={100}
                  placeholder="오늘 나온 메뉴 중 최고였던 반찬은 무엇인가요?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting || !imageUrl}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 disabled:opacity-50 transition shadow-sm"
                >
                  {submitting ? '등록 중...' : '피드에 공유하기 (+20P)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
