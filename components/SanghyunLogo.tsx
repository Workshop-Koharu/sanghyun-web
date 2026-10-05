'use client';

interface SanghyunLogoProps {
  size?: number;
  className?: string;
  showGlow?: boolean;
}

export default function SanghyunLogo({
  size = 36,
  className = '',
  showGlow = true,
}: SanghyunLogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
        showGlow ? 'shadow-md shadow-indigo-500/25' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full rounded-2xl overflow-hidden select-none drop-shadow-sm"
      >
        <defs>
          <linearGradient id="shLogoBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="shInnerBorder" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Squircle Background tile matching dash.jxayx.dev aesthetic */}
        <rect width="64" height="64" rx="16" fill="url(#shLogoBg)" />
        <rect
          x="0.75"
          y="0.75"
          width="62.5"
          height="62.5"
          rx="15.25"
          stroke="url(#shInnerBorder)"
          strokeWidth="1.5"
        />

        {/* Minimalist Hangeul Monogram: 'ㅅ' (Sang) & 'ㅎ' (Hyun) */}
        {/* 'ㅅ' Apex */}
        <path
          d="M 19 30 L 32 16 L 45 30"
          stroke="#ffffff"
          strokeWidth="4.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 'ㅎ' Horizontal bridge */}
        <line
          x1="25"
          y1="36"
          x2="39"
          y2="36"
          stroke="#ffffff"
          strokeWidth="3.8"
          strokeLinecap="round"
        />

        {/* 'ㅎ' Circle */}
        <circle
          cx="32"
          cy="46"
          r="6"
          stroke="#ffffff"
          strokeWidth="4.2"
          fill="none"
        />

        {/* Luminous cyan celestial dot at apex (상현달 / Polaris) */}
        <circle cx="32" cy="16" r="2.2" fill="#38bdf8" />
      </svg>
    </div>
  );
}
