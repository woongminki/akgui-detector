"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, Flag, MessageCircle, ExternalLink, Trash2, Heart } from "lucide-react";
import { ScoreGauge, getScoreInfo } from "@/components/score-gauge";
import { cn } from "@/lib/utils";
import { postApi, reactionApi, commentApi, reportApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const REACTION_LABELS: Record<string, string> = {
  empathy: "공감해요",
  cheer: "힘내요",
  angry: "화나요",
  sad: "슬퍼요",
};

const PREDEFINED_COMMENTS = [
  "많이 힘드셨겠어요",
  "저도 비슷한 경험이 있어요",
  "응원합니다",
  "화이팅!",
];

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const { toast } = useToast();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await postApi.get(postId);
        if (response.data.success && response.data.data) {
          setPost(response.data.data);
        }
      } catch (error: any) {
        toast({
          title: "오류",
          description: error.response?.data?.error?.message || "글을 불러오는 데 실패했습니다.",
          variant: "destructive",
        });
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await commentApi.getAll(postId, 1, 50);
        if (response.data.success && response.data.data) {
          setComments(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      }
    };

    fetchPost();
    fetchComments();
  }, [postId, router, toast]);

  const handleReaction = async (type: string) => {
    try {
      const response = await reactionApi.add(postId, type);
      if (response.data.success && response.data.data) {
        setPost((prev: any) => ({
          ...prev,
          reactionCounts: response.data.data!.reactionCounts,
        }));
      }
    } catch (error: any) {
      if (error.response?.data?.error?.code === "ALREADY_REACTED") {
        await reactionApi.remove(postId, type);
        const response = await postApi.get(postId);
        if (response.data.success && response.data.data) {
          setPost(response.data.data);
        }
      }
    }
  };

  const handleBookmark = async () => {
    try {
      if (post.isBookmarked) {
        await postApi.removeBookmark(postId);
        setPost((prev: any) => ({ ...prev, isBookmarked: false }));
        toast({ title: "북마크 해제" });
      } else {
        await postApi.addBookmark(postId);
        setPost((prev: any) => ({ ...prev, isBookmarked: true }));
        toast({ title: "북마크 추가" });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "북마크 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleReport = async () => {
    try {
      await reportApi.create({
        targetType: "post",
        targetId: postId,
        reason: "inappropriate",
      });
      toast({ title: "신고 완료", description: "검토 후 조치하겠습니다." });
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.response?.data?.error?.message || "신고 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await postApi.delete(postId);
      toast({ title: "삭제 완료" });
      router.back();
    } catch (error) {
      toast({
        title: "오류",
        description: "삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handlePredefinedComment = async (content: string) => {
    setIsSubmitting(true);
    try {
      const response = await commentApi.create(postId, content, true);
      if (response.data.success && response.data.data) {
        setComments((prev) => [...prev, response.data.data]);
        setPost((prev: any) => ({ ...prev, commentCount: prev.commentCount + 1 }));
      }
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.response?.data?.error?.message || "댓글 작성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomComment = async () => {
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await commentApi.create(postId, commentText, false);
      if (response.data.success && response.data.data) {
        setComments((prev) => [...prev, response.data.data]);
        setPost((prev: any) => ({ ...prev, commentCount: prev.commentCount + 1 }));
        setCommentText("");
      }
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.response?.data?.error?.message || "댓글 작성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!post) return null;

  const scoreInfo = getScoreInfo(post.detectionScore);
  const showCTA = post.detectionScore === 10;

  return (
    <div className="pb-24 pt-4">
      {/* Header */}
      <header className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBookmark}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
              post.isBookmarked ? "bg-primary/20 text-primary" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            <Bookmark className={cn("h-5 w-5", post.isBookmarked && "fill-current")} />
          </button>
          <button
            type="button"
            onClick={handleReport}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <Flag className="h-5 w-5" />
          </button>
          {post.isOwner && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </header>

      {/* Post Content */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-4">
        {/* Tags */}
        <div className="mb-3 flex flex-wrap gap-2">
          {post.tags?.map((tag: string) => (
            <span key={tag} className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
              #{tag}
            </span>
          ))}
          <span className="rounded-md bg-primary/20 px-2 py-1 text-xs text-primary">
            {post.emotionTag}
          </span>
        </div>

        {/* Content */}
        <p className="mb-4 whitespace-pre-wrap text-foreground">{post.content}</p>

        {/* Score */}
        <div className="flex items-center justify-center py-4">
          <ScoreGauge score={post.detectionScore} size="md" />
        </div>

        {/* Matched Patterns */}
        {post.matchedPatterns?.length > 0 && (
          <div className="mb-4 rounded-xl bg-muted/50 p-4">
            <p className="mb-2 text-sm font-medium text-foreground">감지된 패턴</p>
            <div className="flex flex-wrap gap-1.5">
              {post.matchedPatterns.map((p: any, i: number) => (
                <span
                  key={i}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-medium",
                    p.weight >= 3
                      ? "bg-score-danger/20 text-score-danger"
                      : p.weight >= 2
                        ? "bg-score-warning/20 text-score-warning"
                        : "bg-score-normal/20 text-score-normal"
                  )}
                >
                  "{p.pattern}"
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 10점 CTA */}
        {showCTA && (
          <div className="mb-4 rounded-xl border border-score-danger/30 bg-score-danger/10 p-4">
            <p className="mb-3 text-sm text-muted-foreground">
              직장 내 괴롭힘이 의심됩니다. 전문적인 도움을 받아보세요.
            </p>
            <a
              href="https://www.moel.go.kr/index.do"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-score-danger py-3 font-medium text-white transition-colors hover:bg-score-danger/90"
            >
              <ExternalLink className="h-4 w-4" />
              고용노동부 신고
            </a>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground">
          AI 기반 패턴 분석으로 법적 판단을 대체하지 않습니다.
        </p>
      </div>

      {/* Reactions */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-4">
        <div className="flex justify-around">
          {Object.entries(REACTION_LABELS).map(([type, label]) => (
            <button
              key={type}
              type="button"
              onClick={() => handleReaction(type)}
              className="flex flex-col items-center gap-1 transition-transform hover:scale-105"
            >
              <span className="text-2xl">
                {type === "empathy" && "💙"}
                {type === "cheer" && "💪"}
                {type === "angry" && "😠"}
                {type === "sad" && "😢"}
              </span>
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-sm font-medium text-foreground">
                {post.reactionCounts?.[type] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold text-foreground">댓글 {post.commentCount}</span>
        </div>

        {/* Predefined Comments */}
        <div className="mb-4 flex flex-wrap gap-2">
          {PREDEFINED_COMMENTS.map((comment) => (
            <button
              key={comment}
              type="button"
              onClick={() => handlePredefinedComment(comment)}
              disabled={isSubmitting}
              className="rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
            >
              {comment}
            </button>
          ))}
        </div>

        {/* Custom Comment Input */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="댓글을 입력하세요"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            maxLength={200}
            className="flex-1 rounded-xl border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={handleCustomComment}
            disabled={isSubmitting || !commentText.trim()}
            className="rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            작성
          </button>
        </div>

        {/* Comment List */}
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-border pb-3 last:border-b-0">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{comment.authorNickname}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              첫 댓글을 남겨보세요
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
