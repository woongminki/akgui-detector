'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-2 text-4xl font-bold">오류 발생</h1>
      <p className="mb-4 text-muted-foreground">문제가 발생했습니다. 다시 시도해주세요.</p>
      <Button onClick={reset}>다시 시도</Button>
    </div>
  );
}
