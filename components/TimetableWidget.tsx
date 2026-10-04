'use client';

import { useState, useMemo } from 'react';
import { BookOpen, Sparkles, GraduationCap, Users, Calendar } from 'lucide-react';

const DAYS = ['월', '화', '수', '목', '금'];

// Confirmed real teachers roster (Role: 교사 1542418493314572369 & 교생 1554520719973552188, excluding bots)
const TEACHER_ROSTER = {
  regular: ['박서연', '플레어', 'SeonA', 'Koharu', 'x_sol'],
  intern: ['쵸카', '청룡'],
};

// 8th Period After-school courses by grade & day
const AFTER_SCHOOL_COURSES: Record<number, Record<string, { title: string; teacher: string; role: string }>> = {
  1: {
    월: { title: '국어 고전시가·현대문학 심화특강', teacher: '박서연', role: '교사' },
    화: { title: '수학 개념완성 및 기출해설', teacher: '플레어', role: '교사' },
    수: { title: '영어 독해 구문분석 클리닉', teacher: 'SeonA', role: '교사' },
    목: { title: '통합과학·융합실험 심화특강', teacher: 'x_sol', role: '교사' },
    금: { title: 'SW·인공지능 코딩 프로젝트', teacher: '쵸카', role: '교생' },
  },
  2: {
    월: { title: '수능 국어 독서·문학 심화반', teacher: '박서연', role: '교사' },
    화: { title: '수학I·수학II 킬러문항 기출특강', teacher: '플레어', role: '교사' },
    수: { title: '수능 영어 고난도 빈칸추론특강', teacher: 'SeonA', role: '교사' },
    목: { title: '과탐/사탐 개념완성 및 실전특강', teacher: 'x_sol', role: '교사' },
    금: { title: '교과 융합 및 학술 소논문 세미나', teacher: 'Koharu', role: '교사' },
  },
  3: {
    월: { title: '수능 국어 실전 모의고사 풀이반', teacher: '박서연', role: '교사' },
    화: { title: '미적분·기하 최고난도 킬러특강', teacher: '플레어', role: '교사' },
    수: { title: '수능 영어 파이널 EBS 연계특강', teacher: 'SeonA', role: '교사' },
    목: { title: '수능 탐구 1등급 파이널 실전모의반', teacher: 'x_sol', role: '교사' },
    금: { title: '대입 수시 심층면접 및 논술 파이널', teacher: 'Koharu', role: '교사' },
  },
};

const G1_SUBJECTS = [
  { name: '국어', teacher: '박서연', role: '교사' },
  { name: '수학', teacher: '플레어', role: '교사' },
  { name: '영어', teacher: 'SeonA', role: '교사' },
  { name: '한국사', teacher: 'Koharu', role: '교사' },
  { name: '통합사회', teacher: 'Koharu', role: '교사' },
  { name: '통합과학', teacher: 'x_sol', role: '교사' },
  { name: '체육', teacher: '쵸카', role: '교생' },
  { name: '음악', teacher: '청룡', role: '교생' },
  { name: '미술', teacher: '청룡', role: '교생' },
  { name: '정보', teacher: '쵸카', role: '교생' },
  { name: '기술·가정', teacher: '쵸카', role: '교생' },
  { name: '과학탐구실험', teacher: 'x_sol', role: '교사' },
  { name: '창의적 체험활동', teacher: '박서연', role: '교사' },
  { name: '학급 자치활동', teacher: '플레어', role: '교사' },
];

const G2_SUBJECTS = [
  { name: '문학', teacher: '박서연', role: '교사' },
  { name: '수학I', teacher: '플레어', role: '교사' },
  { name: '영어I', teacher: 'SeonA', role: '교사' },
  { name: '물리학I', teacher: 'x_sol', role: '교사' },
  { name: '생활과 윤리', teacher: 'Koharu', role: '교사' },
  { name: '독서', teacher: '박서연', role: '교사' },
  { name: '수학II', teacher: '플레어', role: '교사' },
  { name: '영어II', teacher: 'SeonA', role: '교사' },
  { name: '화학I', teacher: 'x_sol', role: '교사' },
  { name: '사회·문화', teacher: 'Koharu', role: '교사' },
  { name: '일본어I', teacher: '청룡', role: '교생' },
  { name: '중국어I', teacher: '청룡', role: '교생' },
  { name: '체육', teacher: '쵸카', role: '교생' },
  { name: '진로와 직업', teacher: '쵸카', role: '교생' },
];

const G3_SUBJECTS = [
  { name: '화법과 작문', teacher: '박서연', role: '교사' },
  { name: '미적분', teacher: '플레어', role: '교사' },
  { name: '영어 독해와 작문', teacher: 'SeonA', role: '교사' },
  { name: '물리학II', teacher: 'x_sol', role: '교사' },
  { name: '윤리와 사상', teacher: 'Koharu', role: '교사' },
  { name: '언어와 매체', teacher: '박서연', role: '교사' },
  { name: '기하', teacher: '플레어', role: '교사' },
  { name: '수능특강 영어', teacher: 'SeonA', role: '교사' },
  { name: '생명과학II', teacher: 'x_sol', role: '교사' },
  { name: '정치와 법', teacher: 'Koharu', role: '교사' },
  { name: '경제', teacher: 'Koharu', role: '교사' },
  { name: '스포츠 생활', teacher: '쵸카', role: '교생' },
  { name: '인공지능 수학', teacher: '플레어', role: '교사' },
  { name: '진학 상담/자치', teacher: '박서연', role: '교사' },
];

const PERIOD_TIMES = [
  { period: '1교시', time: '09:00 ~ 09:50' },
  { period: '2교시', time: '10:00 ~ 10:50' },
  { period: '3교시', time: '11:00 ~ 11:50' },
  { period: '4교시', time: '12:00 ~ 12:50' },
  { period: '점심시간', time: '12:50 ~ 13:50' },
  { period: '5교시', time: '13:50 ~ 14:40' },
  { period: '6교시', time: '14:50 ~ 15:40' },
  { period: '7교시', time: '15:50 ~ 16:40' },
  { period: '8교시', time: '16:50 ~ 17:40' },
];

export default function TimetableWidget() {
  const todayDay = ['일', '월', '화', '수', '목', '금', '토'][new Date().getDay()];
  const [selectedDay, setSelectedDay] = useState(DAYS.includes(todayDay) ? todayDay : '월');
  const [grade, setGrade] = useState<number>(1);
  const [classNum, setClassNum] = useState<number>(1);

  const timetableList = useMemo(() => {
    const dayIdx = DAYS.indexOf(selectedDay);
    const pool = grade === 1 ? G1_SUBJECTS : grade === 2 ? G2_SUBJECTS : G3_SUBJECTS;
    const n = pool.length;
    const items = [];

    // 1교시 ~ 4교시
    for (let p = 1; p <= 4; p++) {
      const idx = ((p - 1) * 2 + (classNum - 1) * 3 + dayIdx * 5) % n;
      const subj = pool[idx];
      items.push({
        period: `${p}교시`,
        time: PERIOD_TIMES[p - 1].time,
        subject: subj.name,
        teacher: subj.teacher,
        role: subj.role,
        isLunch: false,
      });
    }

    // 점심시간
    items.push({
      period: '점심시간',
      time: '12:50 ~ 13:50',
      subject: '점심시간 및 교내 중식 🍱',
      teacher: '급식실 및 생활지도교사',
      role: '안내',
      isLunch: true,
    });

    // 5교시 ~ 7교시
    for (let p = 5; p <= 7; p++) {
      const idx = ((p - 1) * 2 + (classNum - 1) * 3 + dayIdx * 5) % n;
      const subj = pool[idx];
      items.push({
        period: `${p}교시`,
        time: PERIOD_TIMES[p].time,
        subject: subj.name,
        teacher: subj.teacher,
        role: subj.role,
        isLunch: false,
      });
    }

    // 8교시 방과후 심화수업
    const course = AFTER_SCHOOL_COURSES[grade]?.[selectedDay] || {
      title: '방과후 자기주도 심화탐구',
      teacher: '플레어',
      role: '교사',
    };
    items.push({
      period: '8교시',
      time: '16:50 ~ 17:40',
      subject: `[방과후] ${course.title}`,
      teacher: course.teacher,
      role: course.role,
      isLunch: false,
      isAfterSchool: true,
    });

    return items;
  }, [grade, classNum, selectedDay]);

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            상현고 정규 수업 시간표
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              8교시 체제
            </span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            담당 교원: 교사 및 교생 (봇 제외 실배치 교원 배정)
          </p>
        </div>

        {/* Grade & Class & Day Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Grade Selector */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
            {[1, 2, 3].map((g) => (
              <button
                key={g}
                onClick={() => setGrade(g)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  grade === g
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {g}학년
              </button>
            ))}
          </div>

          {/* Class Selector */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold overflow-x-auto max-w-[280px] sm:max-w-none scrollbar-none">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
              <button
                key={c}
                onClick={() => setClassNum(c)}
                className={`min-w-6 sm:w-7 py-1 px-1 rounded-lg transition-all text-center text-[11px] sm:text-xs shrink-0 ${
                  classNum === c
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {c}반
              </button>
            ))}
          </div>

          {/* Weekday Selector */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
            {DAYS.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`w-7 py-1 rounded-lg transition-all text-center ${
                  selectedDay === d
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Periods */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {timetableList.map((item, idx) => {
          if (item.isLunch) {
            return (
              <div
                key={idx}
                className="sm:col-span-2 lg:col-span-3 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-amber-50/80 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-amber-950/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm font-bold">
                    🍱
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-amber-950 dark:text-amber-200">
                        {item.subject}
                      </span>
                      <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80 font-mono">
                        {item.time}
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-800/70 dark:text-amber-400/70">
                      {item.teacher}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                  중식 및 휴게 (60분)
                </span>
              </div>
            );
          }

          const isAfter = (item as any).isAfterSchool;

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                isAfter
                  ? 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20'
                  : 'border-slate-100 dark:border-slate-800/90 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-bold ${
                      isAfter
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.period}
                  </span>
                  {isAfter && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-600 text-white">
                      방과후
                    </span>
                  )}
                </div>
                <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                  {item.time}
                </span>
              </div>

              <div className="mt-2 flex items-end justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    {item.subject}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      {item.teacher} 선생님
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                        item.role === '교사'
                          ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300'
                          : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {item.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer explanation */}
      <div className="pt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-2">
        <span>🏫 {grade}학년 {classNum}반 전용 배정 시간표</span>
        <span>•</span>
        <span>월~금 8교시 방과후 맞춤형 특강 운영</span>
      </div>
    </div>
  );
}
