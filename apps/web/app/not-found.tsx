import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-2 text-6xl font-bold">404</h1>
      <p className="mb-4 text-muted-foreground">페이지를 찾을 수 없습니다.</p>
      <Link href="/">
        <Button>홈으로 이동</Button>
      </Link>
    </div>
  );
}
