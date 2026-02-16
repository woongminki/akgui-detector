"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  TrendingUp,
  FileText,
  FileBarChart,
  Loader2,
  Download,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { ScoreGauge, getScoreInfo } from "@/components/score-gauge";
import { cn } from "@/lib/utils";

// Evil patterns definition
const patternCategories = {
  high: {
    name: "높음 (3점)",
    weight: 3,
    patterns: [
      { regex: /책임\s*전가/, display: "책임 전가" },
      { regex: /맥락에\s*벗어난/, display: "맥락에 벗어난" },
      { regex: /내가\s*정할게/, display: "내가 정할게" },
      { regex: /너\s*태도/, display: "너 태도" },
      { regex: /면피/, display: "면피" },
      { regex: /나가|퇴사해/, display: "나가/퇴사해" },
      { regex: /짤려|자를/, display: "짤려/자를" },
    ],
  },
  medium: {
    name: "중간 (2점)",
    weight: 2,
    patterns: [
      { regex: /태도/, display: "태도" },
      { regex: /위임/, display: "위임" },
      { regex: /너\s*잘못/, display: "너 잘못" },
      { regex: /너\s*문제/, display: "너 문제" },
      { regex: /너\s*탓/, display: "너 탓" },
      { regex: /너\s*때문/, display: "너 때문" },
      { regex: /야근/, display: "야근" },
      { regex: /의지가\s*없/, display: "의지가 없" },
    ],
  },
  low: {
    name: "낮음 (1점)",
    weight: 1,
    patterns: [
      { regex: /그건\s*아니야/, display: "그건 아니야" },
      { regex: /그건\s*틀렸어/, display: "그건 틀렸어" },
      { regex: /그건\s*잘못됐어/, display: "그건 잘못됐어" },
      { regex: /젊은\s*애들/, display: "젊은 애들" },
      { regex: /요즘\s*애들/, display: "요즘 애들" },
    ],
  },
};

interface DetectedPattern {
  pattern: string;
  category: string;
  weight: number;
}

interface LogEntry {
  id: number;
  text: string;
  score: number;
  patterns: DetectedPattern[];
  timestamp: string;
  day: string;
}

interface DayStats {
  scores: number[];
  count: number;
  total: number;
}

const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

type TabType = "stats" | "logs" | "report";

export function DetectorScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("stats");
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastResult, setLastResult] = useState<{
    score: number;
    patterns: DetectedPattern[];
  } | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [dayData, setDayData] = useState<Record<string, DayStats>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const detectEvil = useCallback((text: string) => {
    const detected: DetectedPattern[] = [];
    let totalScore = 0;

    for (const [, category] of Object.entries(patternCategories)) {
      for (const pattern of category.patterns) {
        if (pattern.regex.test(text)) {
          detected.push({
            pattern: pattern.display,
            category: category.name,
            weight: category.weight,
          });
          totalScore += category.weight;
        }
      }
    }

    return {
      score: Math.min(10, Math.max(detected.length > 0 ? 1 : 0, totalScore)),
      patterns: detected,
    };
  }, []);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const result = detectEvil(inputText);
    setLastResult(result);

    // Add to logs
    const today = dayNames[new Date().getDay()];
    const newLog: LogEntry = {
      id: Date.now(),
      text: inputText,
      score: result.score,
      patterns: result.patterns,
      timestamp: new Date().toISOString(),
      day: today,
    };
    setLogs((prev) => [newLog, ...prev]);

    // Update day stats
    setDayData((prev) => {
      const dayStats = prev[today] || { scores: [], count: 0, total: 0 };
      return {
        ...prev,
        [today]: {
          scores: [...dayStats.scores, result.score],
          count: dayStats.count + 1,
          total: dayStats.total + result.score,
        },
      };
    });

    setIsAnalyzing(false);
    setInputText("");
  };

  const clearData = () => {
    setLogs([]);
    setDayData({});
    setLastResult(null);
  };

  const exportLogs = () => {
    const csvContent = [
      "날짜,요일,점수,텍스트,패턴",
      ...logs.map(
        (log) =>
          `"${new Date(log.timestamp).toLocaleDateString("ko-KR")}","${log.day}","${log.score}","${log.text}","${log.patterns.map((p) => p.pattern).join(", ")}"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evil-detector-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.patterns.some((p) => p.pattern.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalCount = logs.length;
  const avgScore = totalCount > 0 ? (logs.reduce((sum, l) => sum + l.score, 0) / totalCount).toFixed(1) : "0.0";
  const maxScore = totalCount > 0 ? Math.max(...logs.map((l) => l.score)) : 0;

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background px-4 pb-24 pt-4">
      {/* Header */}
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">악귀 탐지기</h1>
            <p className="text-sm text-muted-foreground">탐지 모드</p>
          </div>
        </div>
      </header>

      {/* Detection Input */}
      <section className="mb-6 rounded-2xl border border-border bg-card p-4">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder='예: 맥락에 벗어난 얘기 하지마. 너 태도 이상해.'
          className="mb-3 w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
        />
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isAnalyzing || !inputText.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              분석 중...
            </>
          ) : (
            "감지하기"
          )}
        </button>

        {/* Result */}
        {lastResult && (
          <div className="mt-4 animate-fade-in">
            <div className="flex items-center gap-4">
              <ScoreGauge score={lastResult.score} size="sm" showLabel={false} />
              <div className="flex-1">
                <div className={cn("font-semibold", getScoreInfo(lastResult.score).color)}>
                  {getScoreInfo(lastResult.score).level} ({lastResult.score}점)
                </div>
                <div className="text-sm text-muted-foreground">
                  {getScoreInfo(lastResult.score).description}
                </div>
              </div>
            </div>
            {lastResult.patterns.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {lastResult.patterns.map((p, i) => (
                  <span
                    key={i}
                    className={cn(
                      "rounded-md px-2 py-1 text-xs font-medium",
                      p.weight === 3
                        ? "bg-score-danger/20 text-score-danger"
                        : p.weight === 2
                          ? "bg-score-warning/20 text-score-warning"
                          : "bg-score-normal/20 text-score-normal"
                    )}
                  >
                    {p.pattern} ({p.weight}점)
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Tab Navigation */}
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {[
          { id: "stats", icon: TrendingUp, label: "통계" },
          { id: "logs", icon: FileText, label: "로그" },
          { id: "report", icon: FileBarChart, label: "리포트" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Tab */}
      {activeTab === "stats" && (
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-4 text-lg font-bold text-foreground">요일별 악귀 점수</h2>

            {/* Day Chart */}
            <div className="mb-4 flex items-end justify-between gap-2 h-40">
              {dayNames.map((day) => {
                const stats = dayData[day];
                const avgDayScore = stats ? stats.total / stats.count : 0;
                const heightPercent = avgDayScore > 0 ? (avgDayScore / 10) * 100 : 5;
                const scoreInfo = getScoreInfo(Math.round(avgDayScore));

                return (
                  <div key={day} className="flex flex-1 flex-col items-center gap-1">
                    <div className="relative w-full flex justify-center">
                      <div
                        className={cn(
                          "w-8 rounded-t-lg transition-all",
                          avgDayScore > 0 ? scoreInfo.bgColor : "bg-secondary"
                        )}
                        style={{ height: `${heightPercent}%`, minHeight: "8px" }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{day}</span>
                    <span className="text-xs font-medium text-foreground">
                      {stats ? avgDayScore.toFixed(1) : "-"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">총 감지</div>
                <div className="text-lg font-bold text-foreground">{totalCount}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">평균 점수</div>
                <div className="text-lg font-bold text-foreground">{avgScore}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">최고 점수</div>
                <div className="text-lg font-bold text-score-danger">{maxScore}</div>
              </div>
            </div>
          </section>

          <button
            type="button"
            onClick={clearData}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <Trash2 className="h-4 w-4" />
            데이터 초기화
          </button>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색..."
                className="w-full rounded-xl border border-border bg-input py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="button"
              onClick={exportLogs}
              disabled={logs.length === 0}
              className="flex items-center gap-2 rounded-xl bg-score-safe px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-score-safe/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              내보내기
            </button>
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
                {logs.length === 0 ? "로그가 없습니다" : "검색 결과가 없습니다"}
              </div>
            ) : (
              filteredLogs.map((log) => {
                const scoreInfo = getScoreInfo(log.score);
                return (
                  <div
                    key={log.id}
                    className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-card/80"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className={cn("font-bold", scoreInfo.color)}>{log.score}점</span>
                      <span className="text-xs text-muted-foreground">{log.day}요일</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString("ko-KR")}
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-foreground">{log.text}</p>
                    {log.patterns.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {log.patterns.map((p, i) => (
                          <span
                            key={i}
                            className={cn(
                              "rounded px-2 py-0.5 text-xs",
                              p.weight === 3
                                ? "bg-score-danger/20 text-score-danger"
                                : p.weight === 2
                                  ? "bg-score-warning/20 text-score-warning"
                                  : "bg-score-normal/20 text-score-normal"
                            )}
                          >
                            {p.pattern} ({p.weight}점)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Report Tab */}
      {activeTab === "report" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-bold text-foreground">주간 리포트</h2>

            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                데이터가 없습니다. 먼저 악귀 언어를 감지해보세요.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary */}
                <div className="rounded-xl bg-secondary p-4">
                  <h3 className="mb-2 font-semibold text-foreground">요약</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>총 {totalCount}건의 악귀 언어가 감지되었습니다.</li>
                    <li>평균 악귀 점수는 {avgScore}점입니다.</li>
                    <li>최고 점수는 {maxScore}점입니다.</li>
                  </ul>
                </div>

                {/* Pattern Analysis */}
                <div className="rounded-xl bg-secondary p-4">
                  <h3 className="mb-2 font-semibold text-foreground">자주 등장한 패턴</h3>
                  {(() => {
                    const patternCounts: Record<string, number> = {};
                    logs.forEach((log) => {
                      log.patterns.forEach((p) => {
                        patternCounts[p.pattern] = (patternCounts[p.pattern] || 0) + 1;
                      });
                    });
                    const sortedPatterns = Object.entries(patternCounts)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5);

                    return sortedPatterns.length > 0 ? (
                      <ul className="space-y-1 text-sm">
                        {sortedPatterns.map(([pattern, count]) => (
                          <li key={pattern} className="flex justify-between text-muted-foreground">
                            <span>{pattern}</span>
                            <span className="font-medium text-foreground">{count}회</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">아직 패턴이 없습니다.</p>
                    );
                  })()}
                </div>

                {/* Recommendation */}
                <div
                  className={cn(
                    "rounded-xl p-4",
                    Number(avgScore) >= 7
                      ? "bg-score-danger/10 border border-score-danger/30"
                      : Number(avgScore) >= 4
                        ? "bg-score-warning/10 border border-score-warning/30"
                        : "bg-score-safe/10 border border-score-safe/30"
                  )}
                >
                  <h3 className="mb-2 font-semibold text-foreground">권장 액션</h3>
                  <p className="text-sm text-muted-foreground">
                    {Number(avgScore) >= 7
                      ? "평균 점수가 높습니다. 이직을 고려하거나 전문 상담을 받아보세요."
                      : Number(avgScore) >= 4
                        ? "주의가 필요한 환경입니다. 상황을 기록하고 지켜보세요."
                        : "현재 환경은 비교적 건강합니다. 좋은 상태를 유지하세요."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
