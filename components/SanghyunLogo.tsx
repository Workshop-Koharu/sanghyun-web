'use client';

import Image from 'next/image';

interface SanghyunLogoProps {
  size?: number;
  className?: string;
  variant?: 'image' | 'vector';
  showGlow?: boolean;
}

export default function SanghyunLogo({
  size = 36,
  className = '',
  variant = 'image',
  showGlow = true,
}: SanghyunLogoProps) {
  if (variant === 'image') {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl overflow-hidden shrink-0 transition-transform group-hover:scale-105 ${
          showGlow ? 'shadow-md shadow-indigo-500/20' : ''
        } ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.png"
          alt="상현고등학교 로고"
          width={size}
          height={size}
          priority
          className="w-full h-full object-cover rounded-xl"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center rounded-xl overflow-hidden shrink-0 transition-transform group-hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="shBgGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f111a" />
            <stop offset="100%" stopColor="#181a27" />
          </linearGradient>
          <linearGradient id="shCrestGrad" x1="16" y1="8" x2="48" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="45%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>

        <rect width="64" height="64" rx="16" fill="url(#shBgGrad)" stroke="#312e81" strokeWidth="1.5" />
        <path
          d="M16 18 L32 10 L48 18 V34 C48 45 32 54 32 54 C32 54 16 45 16 34 Z"
          stroke="url(#shCrestGrad)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="#1e1b4b"
          fillOpacity="0.3"
        />
        {/* 상현달 (Crescent Moon) */}
        <path
          d="M30 14 C32 14 34.5 15.5 35 17.5 C33.5 17 31.5 17.2 30.5 18.5 C29.5 19.8 29.8 21.5 30.5 22.5 C28.5 22 27 20 27 18 C27 15.8 28.3 14 30 14 Z"
          fill="#38bdf8"
        />
        {/* Left Wing */}
        <path d="M20 22 C23 23 26 27 27 31 C24 30 21 28 20 26 Z" fill="url(#shCrestGrad)" />
        <path d="M18 27 C22 28 25 33 26 37 C23 35 19 33 18 30 Z" fill="url(#shCrestGrad)" opacity="0.8" />
        {/* Right Wing */}
        <path d="M44 22 C41 23 38 27 37 31 C40 30 43 28 44 26 Z" fill="url(#shCrestGrad)" />
        <path d="M46 27 C42 28 39 33 38 37 C41 35 45 33 46 30 Z" fill="url(#shCrestGrad)" opacity="0.8" />
        {/* ㅅ Symbol */}
        <path d="M32 25 L25 38 M32 25 L39 38" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* ㅎ Symbol */}
        <line x1="28" y1="42" x2="36" y2="42" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <circle cx="32" cy="47" r="3.5" stroke="#ffffff" strokeWidth="2" fill="none" />
      </svg>
    </div>
  );
}
