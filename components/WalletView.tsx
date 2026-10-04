'use client';

import { Coins, Landmark, TrendingUp, Package } from 'lucide-react';

interface WalletProps {
  wallet: {
    coins: number;
    total_earned: number;
    total_spent: number;
  };
  bank: {
    balance: number;
    total_interest: number;
    last_interest_at: string | null;
  };
  inventory: Array<{
    item_id: number;
    name: string;
    description: string;
    quantity: number;
    item_type: string;
    price: number;
  }>;
}

export default function WalletView({ wallet, bank, inventory }: WalletProps) {
  const totalAssets = wallet.coins + bank.balance;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">보유 지갑 코인</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {wallet.coins.toLocaleString()} <span className="text-xs font-normal text-slate-500">코인</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex justify-between">
            <span>획득: {wallet.total_earned.toLocaleString()}</span>
            <span>지출: {wallet.total_spent.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">상현은행 예금 잔액</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {bank.balance.toLocaleString()} <span className="text-xs font-normal text-slate-500">코인</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
            <span>누적 이자: +{bank.total_interest.toLocaleString()}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">복리 적용</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">총 보유 자산</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {totalAssets.toLocaleString()} <span className="text-xs font-normal text-slate-500">코인</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            지갑 잔액 및 은행 예금 합산
          </div>
        </div>
      </div>

      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
          <Package className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          가방 및 보유 소지품 ({inventory.length}개)
        </h3>

        {inventory.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            보유 중인 소지품이 없습니다. 디스코드에서 <code className="text-blue-600 dark:text-blue-400 font-mono">/매점</code> 명령어로 아이템을 구매해 보세요.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {inventory.map((item) => (
              <div
                key={item.item_id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{item.name}</span>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                      {item.item_type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
                </div>
                <div>
                  <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono font-bold text-xs">
                    x{item.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
