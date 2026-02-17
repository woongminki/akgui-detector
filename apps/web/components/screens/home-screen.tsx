"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Flame, Users, Radar, Plus } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { TrendCard } from "@/components/trend-card";
import { useGroupStore } from "@/stores/group";
import { useAuthStore } from "@/stores/auth";
import { groupApi, postApi } from "@/lib/api";

type TrendingKeyword = {
  rank: number;
  keyword: string;
  count: number;
  trend: "up" | "down" | "same";
};

export function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, initialize } = useAuthStore();
  const { groups, currentGroup, fetchGroups, isLoading: groupLoading } = useGroupStore();
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [trendingKeywords, setTrendingKeywords] = useState<TrendingKeyword[]>([]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchGroups();
    }
  }, [isAuthenticated, fetchGroups]);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      // 그룹 로딩 완료 전에는 요청하지 않음
      if (groupLoading) return;

      if (!currentGroup) {
        setIsLoadingPosts(false);
        return;
      }

      try {
        const response = await groupApi.getPosts(currentGroup.id, { page: 1, limit: 5 });
        if (response.data.success && response.data.data) {
          setRecentPosts(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch recent posts:", error);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchRecentPosts();
  }, [currentGroup, groupLoading]);

  useEffect(() => {
    const fetchTrendingKeywords = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await postApi.getTrending(4);
        if (response.data.success && response.data.data) {
          setTrendingKeywords(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch trending keywords:", error);
      }
    };

    fetchTrendingKeywords();
  }, [isAuthenticated]);

  if (authLoading || groupLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
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

  return (
    <div className="space-y-6 pb-24 pt-4">
      {/* Header */}
      <header className="px-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">악귀 탐지기</h1>
              <p className="text-xs text-muted-foreground">오늘의 직장 스트레스 트렌드</p>
            </div>
          </div>
          <Link
            href="/detector"
            className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Radar className="h-4 w-4" />
            탐지 모드
          </Link>
        </div>
      </header>

      {/* My Group Quick Access */}
      {currentGroup && (
        <section className="rounded-2xl border border-border bg-gradient-to-r from-primary/10 to-transparent p-4">
          <Link
            href="/group"
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">{currentGroup.label}</div>
                <div className="text-sm text-muted-foreground">
                  멤버 {currentGroup.memberCount}명 · 글 {currentGroup.postCount}개
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        </section>
      )}

      {/* Trending Keywords */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Flame className="h-5 w-5 text-primary" />
            실시간 악귀 언어 TOP
          </h2>
          <button type="button" className="text-sm text-muted-foreground hover:text-foreground">
            더보기
          </button>
        </div>
        {trendingKeywords.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {trendingKeywords.map((item) => (
              <TrendCard key={item.rank} {...item} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
            아직 데이터가 부족합니다
          </div>
        )}
      </section>

      {/* Recent Posts */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">최근 상담소 글</h2>
          {currentGroup && (
            <Link
              href={`/group/${currentGroup.id}/feed`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              더보기
            </Link>
          )}
        </div>
        {isLoadingPosts ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            로딩 중...
          </div>
        ) : recentPosts.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            아직 작성된 글이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {recentPosts.map((post) => {
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
            })}
          </div>
        )}
      </section>
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
