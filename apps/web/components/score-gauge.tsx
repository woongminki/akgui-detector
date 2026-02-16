"use client";

import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const getScoreInfo = (score: number) => {
  if (score <= 3) {
    return {
      level: "안전",
      description: "건강한 환경이에요",
      color: "text-score-safe",
      bgColor: "bg-score-safe/20",
      borderColor: "border-score-safe/30",
    };
  }
  if (score <= 6) {
    return {
      level: "보통",
      description: "욕하면서 다녀도 돼요",
      color: "text-score-normal",
      bgColor: "bg-score-normal/20",
      borderColor: "border-score-normal/30",
    };
  }
  if (score <= 9) {
    return {
      level: "위험",
      description: "이직을 권장해요",
      color: "text-score-warning",
      bgColor: "bg-score-warning/20",
      borderColor: "border-score-warning/30",
    };
  }
  return {
    level: "심각",
    description: "신고를 권장해요",
    color: "text-score-danger",
    bgColor: "bg-score-danger/20",
    borderColor: "border-score-danger/30",
  };
};

const sizeClasses = {
  sm: "h-12 w-12 text-lg",
  md: "h-20 w-20 text-2xl",
  lg: "h-28 w-28 text-4xl",
};

export function ScoreGauge({ score, size = "md", showLabel = true }: ScoreGaugeProps) {
  const info = getScoreInfo(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "flex items-center justify-center rounded-full border-2 font-bold",
          sizeClasses[size],
          info.bgColor,
          info.borderColor,
          info.color
        )}
      >
        {score}
      </div>
      {showLabel && (
        <div className="text-center">
          <div className={cn("text-sm font-semibold", info.color)}>{info.level}</div>
          <div className="text-xs text-muted-foreground">{info.description}</div>
        </div>
      )}
    </div>
  );
}

export { getScoreInfo };
