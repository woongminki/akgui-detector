'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import { Home, Flag, FileText } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (user?.role !== 'admin') {
        router.replace('/home');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/50">
        <div className="p-4">
          <h1 className="text-lg font-bold">관리자</h1>
        </div>
        <nav className="space-y-1 p-2">
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"
          >
            <Home className="h-4 w-4" />
            대시보드
          </Link>
          <Link
            href="/admin/reports"
            className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"
          >
            <Flag className="h-4 w-4" />
            신고 관리
          </Link>
          <Link
            href="/admin/audit-logs"
            className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"
          >
            <FileText className="h-4 w-4" />
            감사 로그
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
