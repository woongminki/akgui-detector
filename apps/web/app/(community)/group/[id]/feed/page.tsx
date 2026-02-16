"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { cn } from "@/lib/utils";
import { groupApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const POST_TAGS = ["업무지시", "회의", "회식", "평가", "일상대화", "채팅/메신저", "기타"];

const scoreFilters = [
  { label: "전체", min: undefined, max: undefined },
  { label: "안전 (1-3)", min: 1, max: 3 },
  { label: "보통 (4-6)", min: 4, max: 6 },
  { label: "위험 (7-9)", min: 7, max: 9 },
  { label: "심각 (10)", min: 10, max: 10 },
];

export default function GroupFeedPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const { toast } = useToast();

  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [scoreFilter, setScoreFilter] = useState<{ min?: number; max?: number }>({});

  const fetchPosts = useCallback(async (pageNum: number, reset = false) => {
    setIsLoading(true);
    try {
      const response = await groupApi.getPosts(groupId, {
        page: pageNum,
        limit: 20,
        tags: selectedTags.length > 0 ? selectedTags.join(",") : undefined,
        scoreMin: scoreFilter.min,
        scoreMax: scoreFilter.max,
      });

      if (response.data.success && response.data.data) {
        if (reset) {
          setPosts(response.data.data);
        } else {
          setPosts((prev) => [...prev, ...response.data.data!]);
        }
        setHasMore((response.data as any).meta?.hasMore || false);
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "글 목록을 불러오는 데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [groupId, selectedTags, scoreFilter, toast]);

  useEffect(() => {
    setPage(1);
    fetchPosts(1, true);
  }, [selectedTags, scoreFilter, fetchPosts]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleScoreFilter = (min?: number, max?: number) => {
    setScoreFilter({ min, max });
  };

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
        <h1 className="text-xl font-bold text-foreground">상담소 피드</h1>
      </header>

      {/* Filters */}
      <div className="mb-4 space-y-3">
        {/* Tag Filter */}
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">태그 필터</p>
          <div className="flex flex-wrap gap-1">
            {POST_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedTags.includes(tag)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Score Filter */}
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">점수 필터</p>
          <div className="flex flex-wrap gap-1">
            {scoreFilters.map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={() => handleScoreFilter(filter.min, filter.max)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  scoreFilter.min === filter.min && scoreFilter.max === filter.max
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts */}
      {isLoading && posts.length === 0 ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="animate-pulse text-muted-foreground">로딩 중...</div>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center">
          <p className="text-muted-foreground">조건에 맞는 글이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              nickname={post.authorNickname || "익명"}
              situationTag={post.tags?.[0] || "일반"}
              quote={post.content}
              emotion={post.emotionTag || ""}
              score={post.detectionScore || 0}
              likes={post.reactionCounts?.heart || 0}
              comments={post.commentCount || 0}
              createdAt={formatRelativeTime(post.createdAt)}
              isLiked={post.userReactions?.includes("heart")}
              isBookmarked={post.isBookmarked}
              onClick={() => router.push(`/post/${post.id}`)}
            />
          ))}

          {hasMore && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoading}
              className="w-full rounded-xl border border-border py-4 font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
            >
              {isLoading ? "로딩 중..." : "더 보기"}
            </button>
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
