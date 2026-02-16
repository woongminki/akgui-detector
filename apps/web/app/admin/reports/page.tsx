'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { REPORT_REASONS } from '@evil-spirit/shared';

export default function AdminReportsPage() {
  const { toast } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'resolved' | 'dismissed'>('pending');

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/reports?status=${filter}`);
      if (response.data.success && response.data.data) {
        setReports(response.data.data);
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '신고 목록을 불러오는 데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const handleProcess = async (reportId: string, action: string) => {
    try {
      await api.patch(`/admin/reports/${reportId}`, { action });
      toast({ title: '처리 완료' });
      fetchReports();
    } catch (error) {
      toast({
        title: '오류',
        description: '처리 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">신고 관리</h1>

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        {(['pending', 'resolved', 'dismissed'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status === 'pending' ? '대기 중' : status === 'resolved' ? '처리됨' : '기각됨'}
          </Button>
        ))}
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      ) : reports.length === 0 ? (
        <p className="text-muted-foreground">신고가 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="pt-4">
                <div className="mb-2 flex justify-between">
                  <span className="font-medium">
                    {report.targetType === 'post' ? '글' : '댓글'} 신고
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <p className="mb-2 text-sm">
                  사유: {REPORT_REASONS[report.reason as keyof typeof REPORT_REASONS]}
                </p>
                {report.description && (
                  <p className="mb-2 text-sm text-muted-foreground">{report.description}</p>
                )}
                {filter === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleProcess(report.id, 'blind')}>
                      블라인드
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleProcess(report.id, 'delete')}
                    >
                      삭제
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleProcess(report.id, 'none')}
                    >
                      기각
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
