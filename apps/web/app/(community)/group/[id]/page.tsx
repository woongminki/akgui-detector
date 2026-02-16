"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Share2, Users, Calendar, TrendingUp } from "lucide-react";
import { TrendCard } from "@/components/trend-card";
import { cn } from "@/lib/utils";
import { groupApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Period = "7d" | "30d" | "all";

const periodFilters = [
  { id: "7d", label: "7일" },
  { id: "30d", label: "30일" },
  { id: "all", label: "전체" },
];

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const { toast } = useToast();

  const [group, setGroup] = useState<any>(null);
  const [period, setPeriod] = useState<Period>("7d");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await groupApi.getGroup(groupId);
        if (response.data.success && response.data.data) {
          setGroup(response.data.data);
        }
      } catch (error) {
        toast({
          title: "오류",
          description: "그룹 정보를 불러오는 데 실패했습니다.",
          variant: "destructive",
        });
        router.back();
      }
    };

    fetchGroup();
  }, [groupId, router, toast]);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!groupId) return;

      setIsLoading(true);
      try {
        const response = await groupApi.getDashboard(groupId, period);
        if (response.data.success && response.data.data) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [groupId, period]);

  const handleShare = async () => {
    if (!group?.inviteToken) return;

    const inviteUrl = `${window.location.origin}/invite/${group.inviteToken}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `악귀 탐지기 - ${group.label}`,
          text: "우리 그룹에 참여하세요!",
          url: inviteUrl,
        });
      } catch {
        await navigator.clipboard.writeText(inviteUrl);
        toast({ title: "초대 링크가 복사되었습니다." });
      }
    } else {
      await navigator.clipboard.writeText(inviteUrl);
      toast({ title: "초대 링크가 복사되었습니다." });
    }
  };

  if (!group) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  const topKeywords = dashboardData?.keywords?.slice(0, 5).map((k: any, i: number) => ({
    rank: i + 1,
    keyword: k.keyword,
    count: k.count,
    trend: "same" as const,
  })) || [];

  const situationTags = dashboardData?.tagDistribution
    ? Object.entries(dashboardData.tagDistribution)
        .map(([tag, count]) => ({
          tag,
          count: count as number,
          percentage: Math.round(((count as number) / (dashboardData.totalPosts || 1)) * 100),
        }))
        .filter((t) => t.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    : [];

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
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{group.label}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {group.memberCount}명
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              글 {group.postCount}개
            </span>
          </div>
        </div>
        {group.isCreator && group.inviteToken && (
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Share2 className="h-4 w-4" />
            초대
          </button>
        )}
      </header>

      {/* Period Filter */}
      <div className="mb-4 flex gap-2">
        {periodFilters.map((filter) => (
          <button
            type="button"
            key={filter.id}
            onClick={() => setPeriod(filter.id as Period)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              period === filter.id
                ? "bg-primary/20 text-primary"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="animate-pulse text-muted-foreground">로딩 중...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-foreground">{dashboardData?.totalPosts || 0}</p>
                <p className="text-sm text-muted-foreground">총 글 수</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{dashboardData?.avgScore || 0}</p>
                <p className="text-sm text-muted-foreground">평균 점수</p>
              </div>
            </div>
          </section>

          {/* Top Keywords */}
          {topKeywords.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
                <TrendingUp className="h-5 w-5 text-primary" />
                악귀 언어 TOP 5
              </h2>
              <div className="space-y-2">
                {topKeywords.map((item: any) => (
                  <TrendCard key={item.rank} {...item} />
                ))}
              </div>
            </section>
          )}

          {/* Situation Distribution */}
          {situationTags.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold text-foreground">상황별 분포</h2>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="space-y-3">
                  {situationTags.map((item) => (
                    <div key={item.tag}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-foreground">#{item.tag}</span>
                        <span className="text-muted-foreground">{item.count}건</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Empty State */}
          {dashboardData?.insufficient && (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <p className="mb-2 font-semibold text-foreground">데이터가 부족합니다</p>
              <p className="text-sm text-muted-foreground">
                대시보드를 표시하려면 더 많은 글이 필요합니다.
              </p>
            </div>
          )}

          {/* Feed Link */}
          <Link
            href={`/group/${groupId}/feed`}
            className="flex w-full items-center justify-center rounded-xl border border-border py-4 font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            상담소 피드 보기
          </Link>
        </div>
      )}
    </div>
  );
}
