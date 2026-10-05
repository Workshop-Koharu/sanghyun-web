'use client';

import { Trophy, CheckCircle, Lock, Coins } from 'lucide-react';

const ACHIEVEMENTS_DATA = [
  { id: 1, name: "첫 입학", description: "상현 고등학교 입학 완료", reward_coins: 100, title_reward: "신입생" },
  { id: 2, name: "개근의 시작", description: "출석 체크 1회 완료", reward_coins: 50 },
  { id: 3, name: "성실한 학생", description: "출석 체크 7회 완료", reward_coins: 100 },
  { id: 4, name: "개근상", description: "출석 체크 30회 완료", reward_coins: 300, title_reward: "모범생" },
  { id: 5, name: "연속 출석 7일", description: "7일 연속 출석 달성", reward_coins: 150 },
  { id: 6, name: "연속 출석 30일", description: "30일 연속 출석 달성", reward_coins: 500, title_reward: "개근왕" },
  { id: 7, name: "수다쟁이", description: "채팅 메시지 100개 달성", reward_coins: 100 },
  { id: 8, name: "소문난 입담", description: "채팅 메시지 1,000개 달성", reward_coins: 300, title_reward: "수다쟁이" },
  { id: 9, name: "서버의 목소리", description: "채팅 메시지 10,000개 달성", reward_coins: 1000, title_reward: "대변인" },
  { id: 10, name: "보이스 입문", description: "음성 통화 1시간 달성", reward_coins: 100 },
  { id: 11, name: "보이스 단골", description: "음성 통화 24시간 달성", reward_coins: 500, title_reward: "라디오 스타" },
  { id: 12, name: "레벨 5 달성", description: "학생 레벨 5 달성", reward_coins: 100 },
  { id: 13, name: "레벨 10 달성", description: "학생 레벨 10 달성", reward_coins: 200 },
  { id: 14, name: "레벨 20 달성", description: "학생 레벨 20 달성", reward_coins: 500, title_reward: "엘리트" },
  { id: 15, name: "레벨 30 달성", description: "학생 레벨 30 달성", reward_coins: 1000, title_reward: "상현의 전설" },
  { id: 16, name: "첫 월급", description: "아르바이트 1회 완료", reward_coins: 50 },
  { id: 17, name: "알바 달인", description: "아르바이트 20회 완료", reward_coins: 400, title_reward: "성실한 일꾼" },
  { id: 18, name: "부자의 길", description: "누적 수입 10,000 코인 달성", reward_coins: 500, title_reward: "자산가" },
  { id: 19, name: "저축왕", description: "은행 예금 잔액 5,000 코인 보유", reward_coins: 300, title_reward: "저축왕" },
  { id: 20, name: "첫 구매", description: "매점에서 아이템 1회 구매", reward_coins: 50 },
  { id: 21, name: "단골 손님", description: "매점에서 아이템 10회 구매", reward_coins: 200, title_reward: "매점 VIP" },
  { id: 22, name: "마음 전하기", description: "다른 학생에게 송금 1회 완료", reward_coins: 50 },
  { id: 23, name: "동아리 가입", description: "학교 동아리에 가입 완료", reward_coins: 100 },
  { id: 24, name: "동아리 부장", description: "동아리 개설 완료", reward_coins: 200, title_reward: "동아리장" },
  { id: 25, name: "열정 부원", description: "동아리 활동 4회 인증", reward_coins: 300, title_reward: "열정부원" },
  { id: 26, name: "자기소개 작성", description: "학생 자기소개서 등록 완료", reward_coins: 100 },
  { id: 27, name: "생일 등록", description: "생일 정보 등록 완료", reward_coins: 50 },
  { id: 28, name: "2학년 진급", description: "2학년으로 진급 완료", reward_coins: 200 },
  { id: 29, name: "3학년 진급", description: "3학년으로 진급 완료", reward_coins: 300, title_reward: "최고학년" },
  { id: 30, name: "졸업", description: "상현 고등학교 전 과정 졸업 완료", reward_coins: 1000, title_reward: "영광의 졸업생" },
  { id: 31, name: "상현스타 데뷔", description: "인스타그램 첫 게시물 업로드", reward_coins: 100, title_reward: "인플루언서" },
  { id: 32, name: "스타 작가", description: "인스타그램 게시물 10개 업로드", reward_coins: 300, title_reward: "상현스타" },
  { id: 33, name: "인기 폭발", description: "인스타그램 좋아요 30개 획득", reward_coins: 400, title_reward: "인기스타" },
  { id: 34, name: "소통왕", description: "인스타그램 댓글 15개 작성", reward_coins: 200, title_reward: "소통의 달인" },
  { id: 35, name: "주사위의 신", description: "주사위 게임 10회 플레이", reward_coins: 150, title_reward: "행운의 주사위" },
  { id: 36, name: "동전의 승부사", description: "동전 던지기 게임 10회 플레이", reward_coins: 150, title_reward: "승부사" },
  { id: 37, name: "학폭 예방 수호자", description: "학교폭력 예방 실천 서약 완료", reward_coins: 100, title_reward: "수호천사" },
  { id: 38, name: "선행 모범생", description: "누적 상점 5점 이상 획득", reward_coins: 200, title_reward: "선행 학생" },
  { id: 39, name: "학교의 빛", description: "누적 상점 15점 이상 획득", reward_coins: 500, title_reward: "학교의 빛" },
  { id: 40, name: "적금의 달인", description: "정기적금 개설 및 이용", reward_coins: 300, title_reward: "재테크 고수" },
  { id: 41, name: "백만장자", description: "누적 총 수입 50,000 코인 돌파", reward_coins: 1500, title_reward: "상현의 거부" },
  { id: 42, name: "백일의 기적", description: "100일 연속 출석 달성", reward_coins: 2000, title_reward: "백일의 기적" },
  { id: 43, name: "다중 동아리 활동", description: "2개 이상 동아리 동시 가입", reward_coins: 200, title_reward: "만능 활동가" },
  { id: 44, name: "시간표 마스터", description: "주간 시간표 5회 이상 확인", reward_coins: 100, title_reward: "학습 플래너" },
  { id: 45, name: "오늘의 질문 지식인", description: "오늘의 질문 10회 참여", reward_coins: 300, title_reward: "지식의 탐구자" },
  { id: 46, name: "레벨 40 달성", description: "학생 레벨 40 달성", reward_coins: 1500, title_reward: "명예의 전당" },
  { id: 47, name: "레벨 50 달성", description: "학생 레벨 50 달성", reward_coins: 2500, title_reward: "상현의 초월자" },
  { id: 48, name: "채팅 5만 개", description: "채팅 메시지 50,000개 달성", reward_coins: 3000, title_reward: "서버의 심장" },
  { id: 49, name: "음성 200시간", description: "음성 채널 200시간 통화 달성", reward_coins: 2000, title_reward: "밤샘 토크왕" },
  { id: 50, name: "상현의 별", description: "30개 이상 업적 달성", reward_coins: 5000, title_reward: "상현의 별" },
];

interface AchievementsProps {
  unlockedList: Array<{
    achievement_id: number;
    unlocked_at: string;
  }>;
}

export default function AchievementsGrid({ unlockedList }: AchievementsProps) {
  const unlockedMap = new Map<number, string>();
  unlockedList.forEach((u) => unlockedMap.set(u.achievement_id, u.unlocked_at));

  const unlockedCount = unlockedMap.size;
  const totalCount = ACHIEVEMENTS_DATA.length;
  const percent = Math.floor((unlockedCount / totalCount) * 100);

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">학교 업적 달성도</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">학교 활동에 참여하여 업적을 달성하세요.</p>
          </div>
        </div>

        <div className="w-full sm:w-56 space-y-1">
          <div className="flex justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>달성률 ({unlockedCount}/{totalCount})</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{percent}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {ACHIEVEMENTS_DATA.map((ach) => {
          const unlockedAt = unlockedMap.get(ach.id);
          const isUnlocked = !!unlockedAt;

          return (
            <div
              key={ach.id}
              className={`p-3.5 rounded-lg border transition-all ${
                isUnlocked
                  ? 'border-amber-300 dark:border-amber-800/80 bg-white dark:bg-slate-900 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/30 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-xs ${
                      isUnlocked
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isUnlocked ? <Trophy className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{ach.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">#{ach.id}</div>
                  </div>
                </div>

                {isUnlocked && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-0.5">
                    <CheckCircle className="w-3 h-3" />
                    달성
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">{ach.description}</p>

              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-mono text-[11px]">
                  <Coins className="w-3 h-3" />
                  +{ach.reward_coins} 코인
                </div>

                {ach.title_reward && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium">
                    {ach.title_reward}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
