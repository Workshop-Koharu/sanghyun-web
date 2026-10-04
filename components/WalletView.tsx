'use client';

import { useState } from 'react';
import {
  Coins,
  Landmark,
  TrendingUp,
  Package,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  SlidersHorizontal,
  PieChart as PieIcon,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

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
    payload_json?: string;
  }>;
  transactions?: Array<{
    id: number;
    type: string;
    amount: number;
    balance_after: number;
    counterparty_id: string | null;
    memo: string | null;
    created_at: number;
  }>;
}

export default function WalletView({ wallet, bank, inventory, transactions = [] }: WalletProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'earn' | 'spend' | 'shop'>('all');
  const [equippedItems, setEquippedItems] = useState<Record<number, boolean>>({});

  const totalAssets = wallet.coins + bank.balance;
  const walletPct = totalAssets > 0 ? Math.round((wallet.coins / totalAssets) * 100) : 50;
  const bankPct = totalAssets > 0 ? 100 - walletPct : 50;

  const toggleEquip = (itemId: number) => {
    setEquippedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchSearch =
      (tx.memo && tx.memo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tx.type.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (typeFilter === 'earn') return tx.amount > 0;
    if (typeFilter === 'spend') return tx.amount < 0 || tx.type.includes('spend') || tx.type.includes('confiscate');
    if (typeFilter === 'shop') return tx.type.includes('shop') || tx.type.includes('purchase');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 3 Asset Overview Cards */}
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
            <span>누적 획득: {wallet.total_earned.toLocaleString()}</span>
            <span>누적 소비: {wallet.total_spent.toLocaleString()}</span>
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
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">복리 이자 시스템</span>
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
            지갑 현금 및 은행 예치금 합산
          </div>
        </div>
      </div>

      {/* 205. 자산 및 지출 비중 인포그래픽 차트 */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <PieIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          자산 포트폴리오 및 지출 비중 분석
        </h3>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> 지갑 현금 ({walletPct}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> 상현은행 예금 ({bankPct}%)
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
            <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${walletPct}%` }} />
            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${bankPct}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-500 block">총 누적 수입</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              +{wallet.total_earned.toLocaleString()}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-500 block">총 누적 지출</span>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">
              -{wallet.total_spent.toLocaleString()}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-500 block">순자산 저축률</span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
              {wallet.total_earned > 0 ? Math.round(((wallet.total_earned - wallet.total_spent) / wallet.total_earned) * 100) : 0}%
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-500 block">소지 아이템 수</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
              {inventory.reduce((acc, cur) => acc + cur.quantity, 0)}개
            </span>
          </div>
        </div>
      </div>

      {/* 208, 209. 인벤토리 상세 뷰어 & 즉석 아이템 장착/사용 토글 */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Package className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            가방 및 보유 소지품 ({inventory.length}종)
          </span>
          <span className="text-xs text-slate-500 font-normal">웹에서 원클릭으로 칭호 및 뱃지를 장착할 수 있습니다</span>
        </h3>

        {inventory.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            보유 중인 소지품이 없습니다. 디스코드에서 <code className="text-blue-600 dark:text-blue-400 font-mono">/매점</code> 명령어로 아이템을 구매해 보세요.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {inventory.map((item) => {
              const isEquipped = equippedItems[item.item_id];
              return (
                <div
                  key={item.item_id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between space-y-3 hover:border-blue-400 dark:hover:border-blue-500 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1">
                        {item.name}
                        {isEquipped && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 inline" />}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono font-medium">
                        {item.item_type || '소모품'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {item.description || '아이템 설명이 등록되지 않았습니다.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      수량: <b className="text-slate-900 dark:text-white font-bold">{item.quantity}개</b>
                    </span>
                    <button
                      onClick={() => toggleEquip(item.item_id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isEquipped
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                      }`}
                    >
                      {isEquipped ? '장착 중' : '장착/사용'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 206. 거래 내역 실시간 검색 및 필터 */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            최근 거래 및 입출금 내역
          </h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="내역 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white w-40 sm:w-48"
              />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-2 py-0.5 rounded ${typeFilter === 'all' ? 'bg-white dark:bg-slate-900 shadow-sm font-bold' : 'text-slate-500'}`}
              >
                전체
              </button>
              <button
                onClick={() => setTypeFilter('earn')}
                className={`px-2 py-0.5 rounded ${typeFilter === 'earn' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm font-bold' : 'text-slate-500'}`}
              >
                수입
              </button>
              <button
                onClick={() => setTypeFilter('spend')}
                className={`px-2 py-0.5 rounded ${typeFilter === 'spend' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm font-bold' : 'text-slate-500'}`}
              >
                지출
              </button>
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            조회된 거래 내역이 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
            {filteredTransactions.map((tx) => {
              const isPositive = tx.amount >= 0;
              const dateStr = new Date(Number(tx.created_at) * 1000).toLocaleString('ko-KR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isPositive
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                      }`}
                    >
                      {isPositive ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{tx.memo || tx.type}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{dateStr}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-mono font-bold ${
                        isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {tx.amount.toLocaleString()} 코인
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      잔액: {tx.balance_after.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
