import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: '악귀 탐지기',
  description: '직장 내 유해 언행을 탐지하고 공유하는 익명 커뮤니티',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '악귀 탐지기',
  },
  openGraph: {
    title: '악귀 탐지기',
    description: '직장 내 유해 언행을 탐지하고 공유하는 익명 커뮤니티',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f0f14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
