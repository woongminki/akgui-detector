'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">관리자 대시보드</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              대기 중인 신고
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">-</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              오늘 처리한 신고
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">-</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              제재 중인 사용자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">-</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
