import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: '상현고등학교 포털 | SANGHYUN HIGH SCHOOL',
  description: '디스코드 가상 역할극 상현고등학교 공식 학사 관리 및 학생 포털 시스템',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-bold text-slate-400">상현고등학교 가상 학사 포털</div>
              <p className="mt-0.5">Workshop Koharu. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <a href="https://github.com/Workshop-Koharu" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                GitHub
              </a>
              <span>●</span>
              <span>상현 고등학교 1528353970714841110</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
