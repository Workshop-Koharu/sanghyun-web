'use client';

import { Trophy, CheckCircle, Lock, Coins, Sparkles } from 'lucide-react';

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
  { id: 29, "name": "3학년 진급", description: "3학년으로 진급 완료", reward_coins: 300, title_reward: "최고학년" },
  { id: 30, "name": "졸업", description: "상현 고등학교 전 과정 졸업 완료", reward_coins: 1000, title_reward: "영광의 졸업생" },
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
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">학교 업적 달성도</h3>
            <p className="text-xs text-slate-400">다양한 학교 생활에 참여하여 업적을 달성해 보세요.</p>
          </div>
        </div>

        <div className="w-full sm:w-64 space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">달성률 ({unlockedCount}/{totalCount})</span>
            <span className="text-amber-400 font-bold">{percent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {ACHIEVEMENTS_DATA.map((ach) => {
          const unlockedAt = unlockedMap.get(ach.id);
          const isUnlocked = !!unlockedAt;

          return (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border transition-all ${
                isUnlocked
                  ? 'bg-slate-900/60 border-amber-500/30 shadow-sm shadow-amber-950/20'
                  : 'bg-slate-900/30 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isUnlocked
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isUnlocked ? <Trophy className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{ach.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">업적 #{ach.id}</div>
                  </div>
                </div>

                {isUnlocked && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    달성
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 mb-3">{ach.description}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px]">
                  <Coins className="w-3.5 h-3.5" />
                  +{ach.reward_coins} 코인
                </div>

                {ach.title_reward && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                    칭호: {ach.title_reward}
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
