'use client';

import { Award, CheckCircle, ShieldAlert, History } from 'lucide-react';

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
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">누적 상점</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            +{record.merit_points} <span className="text-xs font-normal text-slate-500">점</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">누적 벌점</span>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            -{record.penalty_points} <span className="text-xs font-normal text-slate-500">점</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">순 상벌점</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black font-mono ${netPoints >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {netPoints > 0 ? `+${netPoints}` : netPoints} <span className="text-xs font-normal text-slate-500">점</span>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
          <History className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          상벌점 상세 내역
        </h3>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            기록된 상벌점 내역이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="pb-2 font-semibold">일시</th>
                  <th className="pb-2 font-semibold">구분</th>
                  <th className="pb-2 font-semibold">점수</th>
                  <th className="pb-2 font-semibold">사유</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 text-slate-500 text-xs">
                      {new Date(log.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="py-2.5 font-sans">
                      {log.type === 'merit' ? (
                        <span className="px-1.5 py-0.2 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          상점
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[11px] font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                          벌점
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 font-bold">
                      <span className={log.type === 'merit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {log.type === 'merit' ? `+${log.points}` : `-${log.points}`}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-700 dark:text-slate-300 font-sans">
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
