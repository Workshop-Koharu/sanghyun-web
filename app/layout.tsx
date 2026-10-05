import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import PwaInstallPrompt from '@/components/PwaInstallPrompt';

export const metadata: Metadata = {
  title: '상현고등학교 포털 | SANGHYUN HIGH SCHOOL',
  description: '상현고등학교 공식 학사 관리 및 학생 포털 시스템',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '상현고등학교',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#181a24" />
        <meta name="color-scheme" content="dark" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('theme');
                if (stored === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-primary selection:text-primary-foreground relative">
        <div className="app-backdrop" />
        <Navbar />
        <PwaInstallPrompt />
        <main className="flex-1 max-w-[88rem] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          {children}
        </main>
        <footer className="border-t border-border/60 bg-card/60 backdrop-blur-xl py-6 px-4 text-center text-xs text-muted-foreground relative z-10 mt-auto">
          <div className="max-w-[88rem] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left">
              <div className="font-bold text-foreground">상현고등학교 공식 학사 포털</div>
              <p className="mt-0.5 text-muted-foreground">Sanghyun High School • Discord Interactive Campus</p>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span>서버 ID: 1528353970714841110</span>
              <span>•</span>
              <span className="text-primary font-medium">Spender Engine Connected</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
