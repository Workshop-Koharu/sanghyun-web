import Link from 'next/link';
import {
  School,
  BookOpen,
  CalendarCheck,
  Landmark,
  ShieldCheck,
  Users,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-12 py-6">
      <section className="text-center max-w-2xl mx-auto space-y-4 pt-4 pb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>상현고등학교 공식 학사 정보 시스템</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          상현고등학교
          <br />
          <span className="text-blue-600 dark:text-blue-400">학생 및 교무 종합 포털</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          상현고등학교 재학생 및 교직원을 위한 종합 학사 포털입니다. 학생증 조회, 출석 관리, 은행 예금, 상벌점 및 동아리 활동을 실시간으로 확인하실 수 있습니다.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            학생 포털 바로가기
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <a
            href="/api/auth/login"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs transition-colors"
          >
            디스코드 계정 로그인
          </a>
        </div>
      </section>

      <section className="space-y-4">
        <div className="text-left space-y-1 border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">학사 포털 서비스</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">교내 활동 및 개인 학적을 관리하는 주요 기능</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <School className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">디지털 학생증 및 학적부</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              입학 시 학년, 반, 번호와 고유 학번이 자동 부여되며, 언제든 디지털 학생증을 확인하고 학적 정보를 관리할 수 있습니다.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">출석 체크 및 개근 기록</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              매일 09시부터 등교 출석 체크를 진행하고 연속 출석일수에 따라 코인과 경험치 보너스 및 개근 칭호를 획득합니다.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Landmark className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">상현 은행 및 금융 관리</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              활동 코인을 은행에 안전하게 예금하고 매일 자정에 정기 복리 이자 수익을 적립받을 수 있습니다.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">동아리 개설 및 활동 인증</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              학우들과 동아리를 창설하고 주간 활동 내역을 등록하여 학교 활동 보조금을 지원받습니다.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">학교 매점</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              교내 활동으로 모은 코인으로 전용 칭호, 뱃지 프레임, 특별 역할, 각종 아이템을 구매할 수 있습니다.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">학칙 준수 및 상벌점 기록</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              교직원에 의해 상점과 벌점이 투명하게 기록되며, 누적 벌점 및 상벌 현황을 상시 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      <section className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">디스코드 봇 명령어 바로가기</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            디스코드 채팅창에 슬래시(/) 입력
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-blue-600 dark:text-blue-400 font-bold">/입학</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">이름/나이로 학적 등록</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-blue-600 dark:text-blue-400 font-bold">/학생증</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">내 디지털 학생증 조회</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-blue-600 dark:text-blue-400 font-bold">/출석</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">당일 출석 및 보상 수령</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-blue-600 dark:text-blue-400 font-bold">/지갑 & /은행</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">코인 확인 및 입출금</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-blue-600 dark:text-blue-400 font-bold">/매점</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">상품 카탈로그 및 구매</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-blue-600 dark:text-blue-400 font-bold">/동아리</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">목록/개설/가입/활동인증</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-blue-600 dark:text-blue-400 font-bold">/학적부</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">상벌점 및 생활 기록</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-blue-600 dark:text-blue-400 font-bold">/업적</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">30종의 업적 달성 현황</p>
          </div>
        </div>
      </section>
    </div>
  );
}
