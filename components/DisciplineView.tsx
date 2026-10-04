'use client';

import { AlertTriangle, Award, CheckCircle, ShieldAlert, History } from 'lucide-react';

interface DisciplineProps {
  record: {
    merit_points: number;
    penalty_points: number;
  };
  logs: Array<{
    id: number;
    teacher_id: string;
    points: number;
    type: string;
    reason: string;
    created_at: string;
  }>;
}

export default function DisciplineView({ record, logs }: DisciplineProps) {
  const netPoints = record.merit_points - record.penalty_points;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-slate-900/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-400">누적 상점</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            +{record.merit_points} <span className="text-sm font-normal text-emerald-400">점</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border-rose-500/20 bg-gradient-to-br from-rose-950/20 to-slate-900/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-400">누적 벌점</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            -{record.penalty_points} <span className="text-sm font-normal text-rose-400">점</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border-sky-500/20 bg-gradient-to-br from-sky-950/20 to-slate-900/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-sky-400">순 상벌점 점수</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-3xl font-black font-mono ${netPoints >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netPoints > 0 ? `+${netPoints}` : netPoints} <span className="text-sm font-normal text-slate-400">점</span>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-sky-400" />
          상벌점 부과 상세 내역
        </h3>

        {logs.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            기록된 상벌점 내역이 없습니다. 모범적인 학교 생활을 이어가고 있습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs">
                  <th className="pb-3 font-semibold">일시</th>
                  <th className="pb-3 font-semibold">구분</th>
                  <th className="pb-3 font-semibold">점수</th>
                  <th className="pb-3 font-semibold">사유</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 text-slate-400 text-xs">
                      {new Date(log.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="py-3 font-sans">
                      {log.type === 'merit' ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          상점
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          벌점
                        </span>
                      )}
                    </td>
                    <td className="py-3 font-bold">
                      <span className={log.type === 'merit' ? 'text-emerald-400' : 'text-rose-400'}>
                        {log.type === 'merit' ? `+${log.points}` : `-${log.points}`}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300 font-sans text-xs">
                      {log.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
