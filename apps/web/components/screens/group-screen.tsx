"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Share2, Users, TrendingUp, Calendar, Plus } from "lucide-react";
import { TrendCard } from "@/components/trend-card";
import { PostCard } from "@/components/post-card";
import { cn } from "@/lib/utils";
import { useGroupStore } from "@/stores/group";
import { groupApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const periodFilters = [
  { id: "7d", label: "7일" },
  { id: "30d", label: "30일" },
  { id: "all", label: "전체" },
];

type TabType = "dashboard" | "posts";
type Period = "7d" | "30d" | "all";

export function GroupScreen() {
  const router = useRouter();
  const { currentGroup, groups, fetchGroups, isLoading: groupsLoading } = useGroupStore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [activePeriod, setActivePeriod] = useState<Period>("7d");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 마운트 시 그룹 목록 불러오기
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentGroup) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        if (activeTab === "dashboard") {
          const response = await groupApi.getDashboard(currentGroup.id, activePeriod);
          if (response.data.success && response.data.data) {
            setDashboardData(response.data.data);
          }
        } else {
          const response = await groupApi.getPosts(currentGroup.id, { page: 1, limit: 20 });
          if (response.data.success && response.data.data) {
            setPosts(response.data.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentGroup, activeTab, activePeriod]);

  const handleShare = async () => {
    if (!currentGroup) return;

    try {
      const groupDetail = await groupApi.getGroup(currentGroup.id);
      const inviteToken = groupDetail.data.data?.inviteToken;

      if (inviteToken) {
        const inviteUrl = `${window.location.origin}/invite/${inviteToken}`;

        // 항상 클립보드에 복사 (navigator.share 사용 안 함)
        await navigator.clipboard.writeText(inviteUrl);
        toast({
          title: "초대 링크가 복사되었습니다!",
          description: inviteUrl,
        });
      } else {
        toast({
          title: "권한 없음",
          description: "그룹 생성자만 초대 링크를 공유할 수 있습니다.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Share error:", error);
      toast({
        title: "오류",
        description: "초대 링크를 가져오는 데 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 그룹 로딩 중
  if (groupsLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">그룹 목록 로딩 중...</div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 pb-24">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20">
          <Users className="h-10 w-10 text-primary" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-foreground">그룹이 없습니다</h2>
        <p className="mb-6 text-center text-muted-foreground">
          새 그룹을 만들거나 초대 링크를 통해 참여하세요.
        </p>
        <Link
          href="/group/new"
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-5 w-5" />
          새 그룹 만들기
        </Link>
      </div>
    );
  }

  if (!currentGroup) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  // Transform dashboard keywords to trend format
  const topKeywords = dashboardData?.keywords?.slice(0, 5).map((k: any, i: number) => ({
    rank: i + 1,
    keyword: k.keyword,
    count: k.count,
    trend: "same" as const,
  })) || [];

  // Transform tag distribution
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
      {/* Group Header */}
      <header className="mb-6 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">{currentGroup.label}</h1>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {currentGroup.memberCount}명
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                글 {currentGroup.postCount}개
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Share2 className="h-4 w-4" />
            초대
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("dashboard")}
          className={cn(
            "flex-1 rounded-xl py-3 text-sm font-medium transition-colors",
            activeTab === "dashboard"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          )}
        >
          <TrendingUp className="mb-1 mx-auto h-5 w-5" />
          대시보드
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("posts")}
          className={cn(
            "flex-1 rounded-xl py-3 text-sm font-medium transition-colors",
            activeTab === "posts"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          )}
        >
          <Users className="mb-1 mx-auto h-5 w-5" />
          상담소
        </button>
      </div>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="animate-pulse text-muted-foreground">로딩 중...</div>
        </div>
      ) : activeTab === "dashboard" ? (
        <div className="space-y-6">
          {/* Period Filter */}
          <div className="flex gap-2">
            {periodFilters.map((filter) => (
              <button
                type="button"
                key={filter.id}
                onClick={() => setActivePeriod(filter.id as Period)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  activePeriod === filter.id
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

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
              <h2 className="mb-3 text-lg font-bold text-foreground">악귀 언어 TOP 5</h2>
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
        </div>
      ) : (
        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
              아직 작성된 글이 없습니다.
            </div>
          ) : (
            posts.map((post) => {
              const totalReactions = (post.reactionCounts?.empathy || 0) +
                (post.reactionCounts?.cheer || 0) +
                (post.reactionCounts?.angry || 0) +
                (post.reactionCounts?.sad || 0);
              return (
                <PostCard
                  key={post.id}
                  id={post.id}
                  nickname={post.authorNickname || "익명"}
                  situationTag={post.tags?.[0] || "일반"}
                  quote={post.content}
                  emotion={post.emotionTag || ""}
                  score={post.detectionScore || 0}
                  likes={totalReactions}
                  comments={post.commentCount || 0}
                  createdAt={formatRelativeTime(post.createdAt)}
                  isLiked={post.userReactions?.length > 0}
                  isBookmarked={post.isBookmarked}
                  onClick={() => router.push(`/post/${post.id}`)}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "방금 전";
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString("ko-KR");
}
