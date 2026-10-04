import Link from 'next/link';
import {
  School,
  BookOpen,
  CalendarCheck,
  Landmark,
  ShieldCheck,
  Sparkles,
  Users,
  ShoppingBag,
  Briefcase,
  Trophy,
  ArrowRight,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-16 py-8">
      <section className="relative text-center max-w-3xl mx-auto space-y-6 pt-6 pb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>상현고등학교 공식 가상 학사 포털 시스템</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          배움과 성장이 함께하는
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            상현고등학교
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          디스코드 상현고등학교 서버 전용 학사 포털입니다. 모바일과 데스크톱 어디서든
          학생증 확인, 출석 기록, 은행 예금, 상벌점 및 동아리 현황을 실시간으로 관리하세요.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-sm shadow-xl shadow-blue-950/40 transition-all hover:scale-[1.02]"
          >
            <BookOpen className="w-4 h-4" />
            내 학생증 및 포털 열기
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="/api/auth/login"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-sm transition-all hover:border-slate-600"
          >
            디스코드 계정으로 연동
          </a>
        </div>
      </section>

      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white">주요 학사 시스템</h2>
          <p className="text-sm text-slate-400">봇과 포털에서 완전히 연동되는 주요 기능</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="glass-panel p-6 rounded-2xl space-y-3 hover:border-blue-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <School className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">디지털 학생증 및 학적부</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              입학 시 학년, 반, 번호와 고유 학번이 자동 부여되며, 언제든 고해상도 디지털 학생증을 열람하고 공유할 수 있습니다.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3 hover:border-sky-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">출석 체크 및 개근 보상</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              매일 09시부터 등교 출석 체크를 진행하고 연속 출석일수에 따라 코인과 경험치 보너스 및 개근 칭호를 획득합니다.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Landmark className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">상현 은행 및 금융 시스템</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              활동 코인을 은행에 안전하게 예금하고 매일 자정에 정기 복리 이자 수익을 적립받을 수 있습니다.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3 hover:border-indigo-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">동아리 개설 및 활동 인증</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              관심사가 맞는 학우들과 동아리를 창설하고 주간 활동 내역을 등록하여 학교 활동 보조금을 지원받습니다.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3 hover:border-amber-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">학교 매점 및 특별 아이템</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              학업과 활동으로 모은 코인으로 전용 칭호, 뱃지 프레임, 특별 역할, 각종 소비 아이템을 구매할 수 있습니다.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3 hover:border-rose-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">학칙 준수 및 상벌점 기록</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              교직원에 의해 투명하게 상점과 벌점이 기록되며, 누적 벌점 단계에 따라 교내 봉사 또는 선도 절차가 진행됩니다.
            </p>
          </div>
        </div>
      </section>

      <section className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">상현고등학교 봇 슬래시 명령어 안내</h3>
            <p className="text-xs text-slate-400 mt-1">디스코드 채팅창에 슬래시(/)를 입력하여 바로 사용할 수 있습니다.</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
            Discord Components V2 지원
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-sky-400 font-bold">/입학</span>
            <p className="text-[11px] text-slate-400 font-sans mt-1">이름/나이로 학적 등록</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-sky-400 font-bold">/학생증</span>
            <p className="text-[11px] text-slate-400 font-sans mt-1">내 디지털 학생증 조회</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-sky-400 font-bold">/출석</span>
            <p className="text-[11px] text-slate-400 font-sans mt-1">당일 출석 및 보상 수령</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-sky-400 font-bold">/지갑 & /은행</span>
            <p className="text-[11px] text-slate-400 font-sans mt-1">코인 확인 및 입출금</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-sky-400 font-bold">/매점</span>
            <p className="text-[11px] text-slate-400 font-sans mt-1">상품 카탈로그 및 구매</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-sky-400 font-bold">/동아리</span>
            <p className="text-[11px] text-slate-400 font-sans mt-1">목록/개설/가입/활동인증</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-sky-400 font-bold">/학적부</span>
            <p className="text-[11px] text-slate-400 font-sans mt-1">상벌점 및 생활 기록</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-sky-400 font-bold">/업적</span>
            <p className="text-[11px] text-slate-400 font-sans mt-1">30종의 업적 달성 현황</p>
          </div>
        </div>
      </section>
    </div>
  );
}
