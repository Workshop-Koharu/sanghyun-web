'use client';

import { useState } from 'react';
import { Calendar, Clock, BookOpen } from 'lucide-react';

const WEEKLY_TIMETABLES: Record<string, { period: string; time: string; subject: string; teacher: string }[]> = {
  월: [
    { period: '1교시', time: '09:00 ~ 09:50', subject: '국어', teacher: '김선생님' },
    { period: '2교시', time: '10:00 ~ 10:50', subject: '수학 I', teacher: '이선생님' },
    { period: '3교시', time: '11:00 ~ 11:50', subject: '영어 I', teacher: '박선생님' },
    { period: '4교시', time: '12:00 ~ 12:50', subject: '한국사', teacher: '최선생님' },
    { period: '점심', time: '12:50 ~ 13:50', subject: '점심시간 및 급식 🍱', teacher: '식생활관' },
    { period: '5교시', time: '13:50 ~ 14:40', subject: '통합과학', teacher: '정선생님' },
    { period: '6교시', time: '14:50 ~ 15:40', subject: '체육', teacher: '강선생님' },
    { period: '7교시', time: '15:50 ~ 16:40', subject: '학급 자율활동', teacher: '담임선생님' },
  ],
  화: [
    { period: '1교시', time: '09:00 ~ 09:50', subject: '영어 I', teacher: '박선생님' },
    { period: '2교시', time: '10:00 ~ 10:50', subject: '통합사회', teacher: '윤선생님' },
    { period: '3교시', time: '11:00 ~ 11:50', subject: '수학 I', teacher: '이선생님' },
    { period: '4교시', time: '12:00 ~ 12:50', subject: '국어', teacher: '김선생님' },
    { period: '점심', time: '12:50 ~ 13:50', subject: '점심시간 및 급식 🍱', teacher: '식생활관' },
    { period: '5교시', time: '13:50 ~ 14:40', subject: '음악', teacher: '한선생님' },
    { period: '6교시', time: '14:50 ~ 15:40', subject: '미술', teacher: '송선생님' },
    { period: '7교시', time: '15:50 ~ 16:40', subject: '진로와 직업', teacher: '진로상담실' },
  ],
  수: [
    { period: '1교시', time: '09:00 ~ 09:50', subject: '수학 I', teacher: '이선생님' },
    { period: '2교시', time: '10:00 ~ 10:50', subject: '국어', teacher: '김선생님' },
    { period: '3교시', time: '11:00 ~ 11:50', subject: '통합과학', teacher: '정선생님' },
    { period: '4교시', time: '12:00 ~ 12:50', subject: '영어 I', teacher: '박선생님' },
    { period: '점심', time: '12:50 ~ 13:50', subject: '점심시간 및 급식 🍱', teacher: '식생활관' },
    { period: '5교시', time: '13:50 ~ 14:40', subject: '동아리 창체활동', teacher: '각 동아리실' },
    { period: '6교시', time: '14:50 ~ 15:40', subject: '동아리 창체활동', teacher: '각 동아리실' },
    { period: '7교시', time: '15:50 ~ 16:40', subject: '동아리 창체활동', teacher: '각 동아리실' },
  ],
  목: [
    { period: '1교시', time: '09:00 ~ 09:50', subject: '한국사', teacher: '최선생님' },
    { period: '2교시', time: '10:00 ~ 10:50', subject: '영어 I', teacher: '박선생님' },
    { period: '3교시', time: '11:00 ~ 11:50', subject: '통합사회', teacher: '윤선생님' },
    { period: '4교시', time: '12:00 ~ 12:50', subject: '수학 I', teacher: '이선생님' },
    { period: '점심', time: '12:50 ~ 13:50', subject: '점심시간 및 급식 🍱', teacher: '식생활관' },
    { period: '5교시', time: '13:50 ~ 14:40', subject: '정보 & 인공지능', teacher: '정보관' },
    { period: '6교시', time: '14:50 ~ 15:40', subject: '체육', teacher: '강선생님' },
    { period: '7교시', time: '15:50 ~ 16:40', subject: '자기주도 심화탐구', teacher: '도서관' },
  ],
  금: [
    { period: '1교시', time: '09:00 ~ 09:50', subject: '통합과학', teacher: '정선생님' },
    { period: '2교시', time: '10:00 ~ 10:50', subject: '국어', teacher: '김선생님' },
    { period: '3교시', time: '11:00 ~ 11:50', subject: '영어 I', teacher: '박선생님' },
    { period: '4교시', time: '12:00 ~ 12:50', subject: '수학 I', teacher: '이선생님' },
    { period: '점심', time: '12:50 ~ 13:50', subject: '점심시간 및 급식 🍱', teacher: '식생활관' },
    { period: '5교시', time: '13:50 ~ 14:40', subject: '한문/제2외국어', teacher: '어학실' },
    { period: '6교시', time: '14:50 ~ 15:40', subject: '학급 자치회의', teacher: '담임선생님' },
    { period: '7교시', time: '15:50 ~ 16:40', subject: '주말 안전지도/종례', teacher: '각 교실' },
  ],
};

export default function TimetableWidget() {
  const days = ['월', '화', '수', '목', '금'];
  const todayDay = ['일', '월', '화', '수', '목', '금', '토'][new Date().getDay()];
  const [selectedDay, setSelectedDay] = useState(days.includes(todayDay) ? todayDay : '월');

  const list = WEEKLY_TIMETABLES[selectedDay] || WEEKLY_TIMETABLES['월'];

  return (
    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          학급 정규 수업 시간표
        </h3>
        <div className="flex items-center gap-1">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`w-6 h-6 rounded-lg text-xs font-bold transition-all ${
                selectedDay === d
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {list.map((item, idx) => {
          const isLunch = item.period === '점심';
          return (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                isLunch
                  ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 col-span-2'
                  : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold text-slate-600 dark:text-slate-300">{item.period}</span>
                <span className="font-mono">{item.time}</span>
              </div>
              <div className="mt-1">
                <span className="font-bold text-xs text-slate-900 dark:text-white block">{item.subject}</span>
                <span className="text-[10px] text-slate-400">{item.teacher}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
