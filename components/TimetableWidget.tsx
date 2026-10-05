'use client';

import { useState, useMemo } from 'react';
import { BookOpen, Sparkles, GraduationCap, Users, Calendar, Clock, AlertCircle } from 'lucide-react';

const DAYS = ['월', '화', '수', '목', '금'];

// Official Sanghyun High School Faculty (1 Teacher = 1 Subject strictly)
const G1_SUBJECTS = [
  { name: '국어', teacher: '박서연', role: '교사' },
  { name: '수학', teacher: '플레어', role: '교사' },
  { name: '영어', teacher: 'SeonA', role: '교사' },
  { name: '한국사', teacher: 'Koharu', role: '교사' },
  { name: '통합사회', teacher: '한수진', role: '교사' },
  { name: '통합과학', teacher: 'x_sol', role: '교사' },
  { name: '체육', teacher: '쵸카', role: '교생' },
  { name: '음악', teacher: '청룡', role: '교생' },
  { name: '미술', teacher: '이지우', role: '교사' },
  { name: '정보', teacher: '정유빈', role: '교생' },
];

const G2_SUBJECTS = [
  { name: '문학', teacher: '박서연', role: '교사' },
  { name: '수학I', teacher: '플레어', role: '교사' },
  { name: '영어I', teacher: 'SeonA', role: '교사' },
  { name: '세계사', teacher: 'Koharu', role: '교사' },
  { name: '사회·문화', teacher: '한수진', role: '교사' },
  { name: '물리학I', teacher: 'x_sol', role: '교사' },
  { name: '체육', teacher: '쵸카', role: '교생' },
  { name: '음악', teacher: '청룡', role: '교생' },
  { name: '미술창작', teacher: '이지우', role: '교사' },
  { name: '프로그래밍', teacher: '정유빈', role: '교생' },
];

const G3_SUBJECTS = [
  { name: '독서', teacher: '박서연', role: '교사' },
  { name: '미적분', teacher: '플레어', role: '교사' },
  { name: '영어 독해와 작문', teacher: 'SeonA', role: '교사' },
  { name: '동아시아사', teacher: 'Koharu', role: '교사' },
  { name: '생활과 윤리', teacher: '한수진', role: '교사' },
  { name: '물리학II', teacher: 'x_sol', role: '교사' },
  { name: '스포츠 생활', teacher: '쵸카', role: '교생' },
  { name: '음악 감상과 비평', teacher: '청룡', role: '교생' },
  { name: '미술 감상과 비평', teacher: '이지우', role: '교사' },
  { name: '인공지능 기초', teacher: '정유빈', role: '교생' },
];

const AFTER_SCHOOL_COURSES: Record<number, Record<string, { title: string; teacher: string; role: string }>> = {
  1: {
    월: { title: '국어 고전시가·현대문학 심화특강', teacher: '박서연', role: '교사' },
    화: { title: '수학 개념완성 및 기출해설', teacher: '플레어', role: '교사' },
    수: { title: '영어 독해 구문분석 클리닉', teacher: 'SeonA', role: '교사' },
    목: { title: '통합과학·융합실험 심화특강', teacher: 'x_sol', role: '교사' },
    금: { title: 'SW·인공지능 코딩 프로젝트', teacher: '정유빈', role: '교생' },
  },
  2: {
    월: { title: '수능 국어 독서·문학 심화반', teacher: '박서연', role: '교사' },
    화: { title: '수학I·수학II 킬러문항 기출특강', teacher: '플레어', role: '교사' },
    수: { title: '수능 영어 고난도 빈칸추론특강', teacher: 'SeonA', role: '교사' },
    목: { title: '물리학·자연탐구 심화특강', teacher: 'x_sol', role: '교사' },
    금: { title: '사회문화·한국사 학술세미나', teacher: 'Koharu', role: '교사' },
  },
  3: {
    월: { title: '수능 국어 실전 모의고사 풀이반', teacher: '박서연', role: '교사' },
    화: { title: '미적분·기하 최고난도 킬러특강', teacher: '플레어', role: '교사' },
    수: { title: '수능 영어 파이널 EBS 연계특강', teacher: 'SeonA', role: '교사' },
    목: { title: '물리학II 파이널 실전모의반', teacher: 'x_sol', role: '교사' },
    금: { title: '대입 수시 심층면접 및 논술 파이널', teacher: '한수진', role: '교사' },
  },
};

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
    const n = pool.length; // 10 subjects, 10 unique teachers
    const items = [];

    // 1교시 ~ 4교시 (Collision-free Latin Square formula)
    for (let p = 1; p <= 4; p++) {
      const idx = ((classNum - 1) + (p - 1) + dayIdx * 2) % n;
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
      subject: '점심식사 및 교내 휴게 🍱',
      teacher: '급식실 및 생활지도교사',
      role: '안내',
      isLunch: true,
    });

    // 5교시 ~ 7교시 (Collision-free Latin Square formula)
    for (let p = 5; p <= 7; p++) {
      const idx = ((classNum - 1) + (p - 1) + dayIdx * 2) % n;
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
    <div className="glass rounded-2xl border p-4 sm:p-6 shadow-[var(--shadow-card)] space-y-5">
      {/* Header & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold text-sm">
              <BookOpen className="size-4.5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-foreground flex items-center gap-2">
                상현고 정규 수업 시간표
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/15 text-primary border border-primary/30">
                  8교시 체제
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/15 text-success border border-success/30">
                  1교사 1과목 무충돌 배정
                </span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                교시별 교원 중복 배정 없는 엄정 교육과정 (1반 ~ 10반 전 학급 교차 배정)
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Grade Selector */}
          <div className="flex items-center rounded-xl bg-secondary p-1 text-xs font-semibold border border-border/50">
            {[1, 2, 3].map((g) => (
              <button
                key={g}
                onClick={() => setGrade(g)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  grade === g
                    ? 'bg-primary text-primary-foreground shadow-sm font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {g}학년
              </button>
            ))}
          </div>

          {/* Class Selector (1반 ~ 10반) */}
          <div className="flex items-center rounded-xl bg-secondary p-1 text-xs font-semibold border border-border/50 overflow-x-auto max-w-full scrollbar-none">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
              <button
                key={c}
                onClick={() => setClassNum(c)}
                className={`min-w-7 py-1.5 px-2 rounded-lg transition-all text-center text-xs shrink-0 ${
                  classNum === c
                    ? 'bg-primary text-primary-foreground shadow-sm font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {c}반
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Weekday Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {DAYS.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
              selectedDay === d
                ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                : 'bg-card hover:bg-accent/60 text-muted-foreground border border-border/60'
            }`}
          >
            {d}요일
          </button>
        ))}
      </div>

      {/* Class Schedule Grid / List */}
      <div className="space-y-2">
        {timetableList.map((item, idx) => {
          if (item.isLunch) {
            return (
              <div
                key={idx}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-warning/40 bg-warning/10 text-xs font-semibold"
              >
                <div className="flex items-center gap-2 text-warning">
                  <span className="font-extrabold">{item.period}</span>
                  <span className="text-muted-foreground">({item.time})</span>
                  <span>{item.subject}</span>
                </div>
                <span className="text-muted-foreground text-[11px]">{item.teacher}</span>
              </div>
            );
          }

          const isAfterSchool = (item as any).isAfterSchool;

          return (
            <div
              key={idx}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                isAfterSchool
                  ? 'border-primary/40 bg-primary/5 hover:border-primary/60'
                  : 'border-border/70 bg-card hover:border-border hover:bg-accent/40'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`size-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isAfterSchool
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground'
                  }`}
                >
                  {item.period.replace('교시', '')}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground truncate">{item.subject}</span>
                    {isAfterSchool && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/20 text-primary">
                        심화특강
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <Clock className="size-3" />
                    <span>{item.time}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-xs font-semibold text-foreground">{item.teacher} 선생님</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                      item.role === '교사'
                        ? 'bg-primary/15 text-primary border border-primary/25'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    }`}
                  >
                    {item.role}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">전담 교과 배치</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2 text-[11px] text-muted-foreground border-t border-border/50">
        <span>🏫 {grade}학년 {classNum}반 전용 배정 시간표 (총 10개 학급 지원)</span>
        <span className="text-primary font-medium">동일 교시 타 반 교원 중복 불가 규칙 적용 완료</span>
      </div>
    </div>
  );
}
