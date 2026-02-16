"use client";

import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { getScoreInfo } from "./score-gauge";

interface PostCardProps {
  id: string;
  nickname: string;
  situationTag: string;
  quote: string;
  emotion: string;
  score: number;
  likes: number;
  comments: number;
  createdAt: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onClick?: () => void;
  onLike?: () => void;
  onBookmark?: () => void;
}

export function PostCard({
  nickname,
  situationTag,
  quote,
  emotion,
  score,
  likes,
  comments,
  createdAt,
  isLiked = false,
  isBookmarked = false,
  onClick,
  onLike,
  onBookmark,
}: PostCardProps) {
  const scoreInfo = getScoreInfo(score);

  return (
    <article
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-border bg-card p-4 transition-all hover:border-muted-foreground/30 active:scale-[0.99]"
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
            {nickname.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">{nickname}</div>
            <div className="text-xs text-muted-foreground">{createdAt}</div>
          </div>
        </div>
        <div
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium",
            scoreInfo.bgColor,
            scoreInfo.color
          )}
        >
          악귀 {score}점
        </div>
      </div>

      {/* Situation Tag */}
      <div className="mb-2">
        <span className="inline-block rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
          #{situationTag}
        </span>
      </div>

      {/* Quote */}
      <blockquote className="mb-3 rounded-lg bg-muted/50 p-3">
        <p className="text-sm font-medium leading-relaxed text-foreground">"{quote}"</p>
      </blockquote>

      {/* Emotion */}
      <div className="mb-4 text-sm text-muted-foreground">
        느낀 감정: <span className="font-medium text-foreground">{emotion}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className={cn(
              "flex items-center gap-1.5 text-sm transition-colors",
              isLiked ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onLike?.();
            }}
          >
            <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
            <span>{likes}</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle className="h-5 w-5" />
            <span>{comments}</span>
          </button>
        </div>
        <button
          type="button"
          className={cn(
            "transition-colors",
            isBookmarked ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onBookmark?.();
          }}
        >
          <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-current")} />
        </button>
      </div>
    </article>
  );
}
