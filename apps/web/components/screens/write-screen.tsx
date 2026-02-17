"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronRight, Sparkles, X } from "lucide-react";
import { ScoreGauge, getScoreInfo } from "@/components/score-gauge";
import { cn } from "@/lib/utils";
import { useGroupStore } from "@/stores/group";
import { postApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const situationOptions = [
  "업무지시",
  "회의",
  "회식",
  "평가",
  "일상대화",
  "채팅/메신저",
  "기타",
];

const emotionOptions = [
  "분노",
  "억울함",
  "무력감",
  "당혹감",
  "슬픔",
  "답답함",
  "불안",
  "수치심",
];

interface PostResult {
  id: string;
  detectionScore: number;
  detectionLevel: string;
  matchedPatterns: {
    category: string;
    pattern: string;
    weight: number;
  }[];
  safetyWarnings?: string[];
}

export function WriteScreen() {
  const router = useRouter();
  const { currentGroup } = useGroupStore();
  const { toast } = useToast();

  const [step, setStep] = useState<"write" | "analyzing" | "result">("write");
  const [situation, setSituation] = useState("");
  const [quote, setQuote] = useState("");
  const [emotions, setEmotions] = useState<string[]>([]);
  const [result, setResult] = useState<PostResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectEmotion = (emotion: string) => {
    setEmotions((prev) =>
      prev.includes(emotion) ? [] : [emotion] // Single selection only
    );
  };

  const handleAnalyze = async () => {
    if (!situation || !quote || emotions.length === 0) return;

    if (!currentGroup) {
      toast({
        title: "그룹 선택 필요",
        description: "글을 작성할 그룹을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (quote.length < 10) {
      toast({
        title: "내용 부족",
        description: "최소 10자 이상 작성해주세요.",
        variant: "destructive",
      });
      return;
    }

    setStep("analyzing");
    setIsSubmitting(true);

    try {
      const response = await postApi.create({
        groupId: currentGroup.id,
        content: quote,
        tags: [situation],
        emotionTag: emotions[0], // Send only first emotion (backend accepts single value)
        idempotencyKey: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      });

      if (response.data.success && response.data.data) {
        setResult(response.data.data);
        setStep("result");
      }
    } catch (error: any) {
      toast({
        title: "작성 실패",
        description: error.response?.data?.error?.message || "글 작성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      setStep("write");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    router.push("/");
  };

  if (step === "analyzing") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/20">
          <Sparkles className="h-12 w-12 animate-pulse text-primary" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-foreground">악귀 분석 중...</h2>
        <p className="text-center text-sm text-muted-foreground">
          AI가 악귀 언어 패턴을 분석하고 있어요
        </p>
      </div>
    );
  }

  if (step === "result" && result) {
    const score = result.detectionScore;
    const scoreInfo = getScoreInfo(score);
    const isDangerous = score === 10;

    return (
      <div className="pb-24 pt-4">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">분석 결과</h1>
          <button type="button" onClick={() => router.push("/")} className="text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
          </button>
        </header>

        {/* Score Display */}
        <div className="mb-6 flex flex-col items-center rounded-2xl border border-border bg-card p-6">
          <ScoreGauge score={score} size="lg" />
        </div>

        {/* Quote Display */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <div className="mb-2 text-xs text-muted-foreground">탐지된 악귀 언어</div>
          <blockquote className="text-lg font-medium text-foreground">"{quote}"</blockquote>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
              #{situation}
            </span>
            {emotions.map((e) => (
              <span key={e} className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                {e}
              </span>
            ))}
          </div>
        </div>

        {/* Matched Patterns */}
        {result.matchedPatterns && result.matchedPatterns.length > 0 && (
          <div className="mb-6 rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-3 font-semibold text-foreground">감지된 패턴</h3>
            <div className="flex flex-wrap gap-1.5">
              {result.matchedPatterns.map((p, i) => (
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
                  "{p.pattern}" ({p.weight}점)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Danger Alert */}
        {isDangerous && (
          <div className="mb-6 rounded-2xl border border-score-danger/30 bg-score-danger/10 p-4">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-score-danger" />
              <span className="font-semibold text-score-danger">직장 내 괴롭힘이 의심됩니다</span>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              전문적인 도움을 받을 수 있는 공식 채널로 안내해 드릴게요. 혼자 해결하려 하지 마세요.
            </p>
            <a
              href="https://www.moel.go.kr/index.do"
              target="_blank"
              rel="noreferrer noopener"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-score-danger py-3 font-medium text-white transition-colors hover:bg-score-danger/90"
            >
              고용노동부 신고하러 가기
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>
        )}

        {/* Safety Warnings */}
        {result.safetyWarnings && result.safetyWarnings.length > 0 && (
          <div className="mb-6 rounded-2xl border border-score-warning/30 bg-score-warning/10 p-4">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-score-warning" />
              <span className="font-semibold text-score-warning">주의 사항</span>
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {result.safetyWarnings.map((warning, i) => (
                <li key={i}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mb-6 rounded-2xl border border-border bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground">
            AI 기반 패턴 분석으로 법적 판단을 대체하지 않습니다.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full rounded-xl bg-primary py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">새 글 작성</h1>
        <button type="button" onClick={() => router.push("/")} className="text-muted-foreground hover:text-foreground">
          <X className="h-6 w-6" />
        </button>
      </header>

      {/* Guide Notice */}
      <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/10 p-4">
        <p className="mb-2 font-medium text-foreground">작성 가이드</p>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• 실명, 회사명, 부서명 등 특정 가능 정보는 작성하지 마세요</li>
          <li>• 전화번호, 이메일 등 연락처는 자동으로 필터링됩니다</li>
        </ul>
      </div>

      {/* Situation Selection */}
      <section className="mb-6">
        <label className="mb-2 block text-sm font-medium text-foreground">상황 선택</label>
        <div className="flex flex-wrap gap-2">
          {situationOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSituation(opt)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                situation === opt
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </section>

      {/* Quote Input */}
      <section className="mb-6">
        <label className="mb-2 block text-sm font-medium text-foreground">
          들은 말 ({quote.length}/1000)
        </label>
        <textarea
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder='예: "야근 안 할 거면 팀에서 나가."'
          className="h-32 w-full resize-none rounded-xl border border-border bg-input p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          maxLength={1000}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          실명, 회사명, 연락처 등 개인정보는 입력하지 마세요
        </p>
      </section>

      {/* Emotion Selection */}
      <section className="mb-8">
        <label className="mb-2 block text-sm font-medium text-foreground">느낀 감정</label>
        <div className="flex flex-wrap gap-2">
          {emotionOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => selectEmotion(opt)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                emotions.includes(opt)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </section>

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={!situation || !quote || emotions.length === 0 || isSubmitting}
        className="w-full rounded-xl bg-primary py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        악귀 분석하기
      </button>
    </div>
  );
}
