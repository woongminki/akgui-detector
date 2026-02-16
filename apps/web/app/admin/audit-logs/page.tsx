'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const ACTION_LABELS: Record<string, string> = {
  blind_post: '글 블라인드',
  delete_post: '글 삭제',
  blind_comment: '댓글 블라인드',
  delete_comment: '댓글 삭제',
  restrict_user: '사용자 제재',
  unrestrict_user: '사용자 제재 해제',
  dismiss_report: '신고 기각',
  update_filter_rule: '필터 규칙 변경',
};

export default function AdminAuditLogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchLogs = async (pageNum: number, reset = false) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/audit-logs?page=${pageNum}&limit=20`);
      if (response.data.success && response.data.data) {
        if (reset) {
          setLogs(response.data.data);
        } else {
          setLogs((prev) => [...prev, ...response.data.data!]);
        }
        setHasMore(response.data.meta?.hasMore || false);
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '감사 로그를 불러오는 데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1, true);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLogs(nextPage);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">감사 로그</h1>

      {isLoading && logs.length === 0 ? (
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      ) : logs.length === 0 ? (
        <p className="text-muted-foreground">로그가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">
                      {ACTION_LABELS[log.action] || log.action}
                    </span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {log.targetType} #{log.targetId.slice(-6)}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString('ko-KR')}
                  </span>
                </div>
                {log.details && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {JSON.stringify(log.details)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          {hasMore && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? '로딩 중...' : '더 보기'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
