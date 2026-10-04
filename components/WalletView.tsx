'use client';

import { Coins, Landmark, TrendingUp, Package, Tag } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-slate-900/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-amber-400">보유 지갑 코인</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {wallet.coins.toLocaleString()} <span className="text-sm font-normal text-amber-400">코인</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex justify-between">
            <span>누적 획득: {wallet.total_earned.toLocaleString()}</span>
            <span>누적 지출: {wallet.total_spent.toLocaleString()}</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border-sky-500/20 bg-gradient-to-br from-sky-950/20 to-slate-900/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-sky-400">상현은행 예금 잔액</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {bank.balance.toLocaleString()} <span className="text-sm font-normal text-sky-400">코인</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>이자 수익: +{bank.total_interest.toLocaleString()}</span>
            <span className="text-emerald-400 font-medium">연이자 복리 적용</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 to-slate-900/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-indigo-400">총 보유 자산</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {totalAssets.toLocaleString()} <span className="text-sm font-normal text-indigo-400">코인</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            지갑 잔액 및 은행 예금 합산
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-400" />
          가방 및 보유 소지품 ({inventory.length}개)
        </h3>

        {inventory.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            보유 중인 소지품이 없습니다. 디스코드에서 <code className="text-sky-400 font-mono">/매점</code> 명령어로 아이템을 구매해 보세요.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {inventory.map((item) => (
              <div
                key={item.item_id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-sm">{item.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                      {item.item_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.description}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 rounded-lg bg-sky-500/10 text-sky-300 font-mono font-bold text-xs border border-sky-500/20">
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
