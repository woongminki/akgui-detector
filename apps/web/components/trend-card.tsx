"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendCardProps {
  rank: number;
  keyword: string;
  count: number;
  trend: "up" | "down" | "same";
  onClick?: () => void;
}

export function TrendCard({ rank, keyword, count, trend, onClick }: TrendCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up" ? "text-score-danger" : trend === "down" ? "text-score-safe" : "text-muted-foreground";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-muted-foreground/30 active:scale-[0.99]"
    >
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold",
          rank <= 3 ? "bg-primary/20 text-primary" : "bg-secondary text-secondary-foreground"
        )}
      >
        {rank}
      </div>
      <div className="flex-1 text-left">
        <div className="font-medium text-foreground">{keyword}</div>
        <div className="text-xs text-muted-foreground">{count}회 탐지</div>
      </div>
      <TrendIcon className={cn("h-5 w-5", trendColor)} />
    </button>
  );
}
