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
  Award,
  Terminal,
  Clock,
  Compass,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="relative space-y-16 py-8">
      {/* Hex background accent */}
      <div className="hex-bg absolute -top-10 -left-10 w-[120%] h-[550px] pointer-events-none opacity-40 z-0" />

      {/* Hero Section */}
      <section className="relative z-10 text-center max-w-3xl mx-auto space-y-6 pt-6 pb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-white/10 text-xs text-foreground/90 font-medium shadow-sm transition-all hover:border-primary/50">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="tracking-wide">상현고등학교 공식 스마트 학사 인트라넷</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            상현고등학교
            <br />
            <span className="shine-text">학생 및 교무 종합 포털</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            상현고등학교 재학생 및 교직원을 위한 프리미엄 학사 정보 플랫폼입니다. 디지털 학생증 발급, Latin Square 무충돌 시간표, 
            출석 체크, 상현 은행 금융 서비스 및 동아리 활동을 실시간으로 확인하세요.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <BookOpen className="w-4 h-4" />
            학생 포털 열기
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="/api/auth/login"
            className="flex items-center gap-2 px-6 py-3 rounded-xl glass border border-border/70 hover:border-primary/50 text-foreground font-medium text-sm transition-all hover:bg-accent/40"
          >
            디스코드 계정 로그인
          </a>
        </div>
      </section>

      {/* Core Services Grid */}
      <section className="relative z-10 space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <School className="w-5 h-5 text-primary" />
              학사 포털 주요 서비스
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">교내 활동 및 개인 학적을 관리하는 스마트 시스템</p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-accent/60 text-muted-foreground border border-border/40">
            10개 반 전용 시스템
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl glass border border-border/50 hover:border-primary/50 transition-all duration-200 space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <School className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">디지털 학생증 및 학적부</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              입학 시 학년, 반, 번호와 고유 학번이 자동 부여되며, 언제든 바코드와 QR 코드가 포함된 디지털 학생증을 조회하고 지갑 패스로 저장할 수 있습니다.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass border border-border/50 hover:border-primary/50 transition-all duration-200 space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-info/10 border border-info/20 flex items-center justify-center text-info group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Latin Square 무충돌 시간표</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              1반부터 10반까지 교사 중복 수업(1교시, 3교시 동시 수업 충돌)을 수학적 직교 라틴 방진 알고리즘으로 완전 해결하여 전 학급 100% 독립 수업을 제공합니다.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass border border-border/50 hover:border-primary/50 transition-all duration-200 space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">출석 체크 및 연속 개근</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              매일 09시부터 등교 출석 체크를 진행하고 연속 출석일수에 따라 코인과 경험치 보너스 및 개근 칭호를 획득합니다.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass border border-border/50 hover:border-primary/50 transition-all duration-200 space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <Landmark className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">상현 은행 및 금융 관리</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              활동 코인을 은행에 안전하게 예금하고 매일 자정에 정기 복리 이자 수익을 적립받으며 소지품과 거래 내역을 실시간으로 추적합니다.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass border border-border/50 hover:border-primary/50 transition-all duration-200 space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">동아리 개설 및 연합 활동</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              학우들과 다중 동아리를 자유롭게 창설하고 주간 활동 내역을 등록하여 학교 활동 보조금과 활동 인증 점수를 지원받습니다.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass border border-border/50 hover:border-primary/50 transition-all duration-200 space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">학칙 준수 및 상벌점 시스템</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              교직원에 의해 상점과 벌점이 투명하게 기록되며, 누적 벌점 및 상벌 현황을 상시 확인할 수 있어 건전한 학교 문화를 지켜나갑니다.
            </p>
          </div>
        </div>
      </section>

      {/* Slash Commands Quick Reference */}
      <section className="relative z-10 p-6 sm:p-8 rounded-2xl glass border border-border/60 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-foreground">디스코드 봇 주요 슬래시 명령어</h3>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            디스코드 채팅창에 슬래시(/)를 입력하여 즉시 호출
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-background/50 border border-border/40 hover:border-primary/40 transition-colors">
            <span className="text-primary font-bold">/학교 입학</span>
            <p className="text-[11px] text-muted-foreground font-sans mt-1">이름/나이로 학적 등록</p>
          </div>
          <div className="p-3 rounded-xl bg-background/50 border border-border/40 hover:border-primary/40 transition-colors">
            <span className="text-primary font-bold">/학교 학생증</span>
            <p className="text-[11px] text-muted-foreground font-sans mt-1">내 디지털 학생증 조회</p>
          </div>
          <div className="p-3 rounded-xl bg-background/50 border border-border/40 hover:border-primary/40 transition-colors">
            <span className="text-primary font-bold">/학교 시간표</span>
            <p className="text-[11px] text-muted-foreground font-sans mt-1">1~10반 1~7교시 무충돌 시간표</p>
          </div>
          <div className="p-3 rounded-xl bg-background/50 border border-border/40 hover:border-primary/40 transition-colors">
            <span className="text-primary font-bold">/출석</span>
            <p className="text-[11px] text-muted-foreground font-sans mt-1">당일 출석 및 보상 수령</p>
          </div>
          <div className="p-3 rounded-xl bg-background/50 border border-border/40 hover:border-primary/40 transition-colors">
            <span className="text-primary font-bold">/경제 지갑 & 은행</span>
            <p className="text-[11px] text-muted-foreground font-sans mt-1">코인 잔액 조회 및 입출금</p>
          </div>
          <div className="p-3 rounded-xl bg-background/50 border border-border/40 hover:border-primary/40 transition-colors">
            <span className="text-primary font-bold">/경제 주사위</span>
            <p className="text-[11px] text-muted-foreground font-sans mt-1">액션 애니메이션 주사위 던지기</p>
          </div>
          <div className="p-3 rounded-xl bg-background/50 border border-border/40 hover:border-primary/40 transition-colors">
            <span className="text-primary font-bold">/동아리 개설</span>
            <p className="text-[11px] text-muted-foreground font-sans mt-1">원클릭 창설 및 회원 모집</p>
          </div>
          <div className="p-3 rounded-xl bg-background/50 border border-border/40 hover:border-primary/40 transition-colors">
            <span className="text-primary font-bold">/상벌점 조회</span>
            <p className="text-[11px] text-muted-foreground font-sans mt-1">누적 상벌점 내역 확인</p>
          </div>
        </div>
      </section>
    </div>
  );
}
