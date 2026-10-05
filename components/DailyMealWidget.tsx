'use client';

import { useState, useMemo } from 'react';
import { Utensils, Calendar, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { getDailyMeal } from '@/lib/meals';

export default function DailyMealWidget() {
  const [targetDay, setTargetDay] = useState<0 | 1>(0); // 0 = today, 1 = tomorrow
  const [mealType, setMealType] = useState<'중식' | '석식'>('중식');

  const meal = useMemo(() => {
    return getDailyMeal(targetDay, mealType);
  }, [targetDay, mealType]);

  return (
    <div className="p-4 rounded-2xl glass border border-border/60 shadow-sm flex flex-col justify-between gap-3">
      {/* Top Header & Day/Meal Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm">
            🍱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                상현고 {targetDay === 0 ? '오늘' : '내일'}의 {mealType}
              </span>
              <span className="text-[10px] font-mono text-amber-500 font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                {meal.calories}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {meal.dateFormatted}
            </p>
          </div>
        </div>

        {/* Controls: Today/Tomorrow & Lunch/Dinner */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {/* Day toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-secondary/60 border border-border/50 text-[11px] font-bold">
            <button
              onClick={() => setTargetDay(0)}
              className={`px-2 py-1 rounded-md transition-all ${
                targetDay === 0 ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              오늘
            </button>
            <button
              onClick={() => setTargetDay(1)}
              className={`px-2 py-1 rounded-md transition-all ${
                targetDay === 1 ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              내일
            </button>
          </div>

          {/* Meal type toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-secondary/60 border border-border/50 text-[11px] font-bold">
            <button
              onClick={() => setMealType('중식')}
              className={`px-2 py-1 rounded-md transition-all ${
                mealType === '중식' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              중식
            </button>
            <button
              onClick={() => setMealType('석식')}
              className={`px-2 py-1 rounded-md transition-all ${
                mealType === '석식' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              석식
            </button>
          </div>
        </div>
      </div>

      {/* Meal Dishes Badges & Menu String */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded-lg bg-secondary text-foreground text-[11px] font-medium border border-border/40">
            🍚 {meal.menu.rice}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-secondary text-foreground text-[11px] font-medium border border-border/40">
            🥣 {meal.menu.soup}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 text-[11px] font-bold border border-amber-500/20">
            🍖 {meal.menu.main}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-secondary text-foreground text-[11px] font-medium border border-border/40">
            🥗 {meal.menu.side1}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-secondary text-foreground text-[11px] font-medium border border-border/40">
            🥢 {meal.menu.side2}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-400 text-[11px] font-medium border border-rose-500/20">
            🧃 {meal.menu.dessert}
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {meal.menuString}
        </p>
      </div>

      {/* Footer / Certification */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
        <span>식생활관 직영 위생 조리</span>
        <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          영양사 검수 완료
        </span>
      </div>
    </div>
  );
}
