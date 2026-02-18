"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flame, Info } from "lucide-react";
import { TrendCard } from "@/components/trend-card";
import { useAuthStore } from "@/stores/auth";
import { postApi } from "@/lib/api";

type TrendingKeyword = {
  rank: number;
  keyword: string;
  count: number;
  trend: "up" | "down" | "same";
};

export function TrendingScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, initialize } = useAuthStore();
  const [trendingKeywords, setTrendingKeywords] = useState<TrendingKeyword[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchTrendingKeywords = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await postApi.getTrending(20);
        if (response.data.success && response.data.data) {
          setTrendingKeywords(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch trending keywords:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingKeywords();
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4">
      {/* Header */}
      <header className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">실시간 악귀 언어 트렌드</h1>
        </div>
      </header>

      {/* Description */}
      <div className="mb-6 rounded-xl bg-primary/10 p-4">
        <p className="text-sm text-muted-foreground">
          최근 7일간 가장 많이 탐지된 악귀 언어 패턴입니다.
        </p>
      </div>

      {/* Trending List */}
      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="animate-pulse text-muted-foreground">로딩 중...</div>
        </div>
      ) : trendingKeywords.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center">
          <p className="text-muted-foreground">아직 데이터가 부족합니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {trendingKeywords.map((item) => (
            <TrendCard key={item.rank} {...item} />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 flex items-start gap-2 rounded-xl border border-border bg-card p-4">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          AI 기반 패턴 분석으로 법적 판단을 대체하지 않습니다.
        </p>
      </div>
    </div>
  );
}
