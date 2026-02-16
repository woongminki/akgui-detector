'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DETECTION_LEVELS, PATTERN_CATEGORIES, NOTICES, EXTERNAL_LINKS } from '@evil-spirit/shared';
import { ExternalLink, AlertTriangle } from 'lucide-react';

interface ScoreResultProps {
  post: {
    id: string;
    detectionScore: number;
    detectionLevel: string;
    matchedPatterns: {
      category: string;
      pattern: string;
      weight: number;
    }[];
    safetyWarnings?: string[];
  };
  onClose: () => void;
}

const getLevelConfig = (level: string) => {
  switch (level) {
    case '건강':
      return { ...DETECTION_LEVELS.HEALTHY, bgClass: 'bg-green-100', textClass: 'text-green-800' };
    case '보통':
      return { ...DETECTION_LEVELS.NORMAL, bgClass: 'bg-yellow-100', textClass: 'text-yellow-800' };
    case '위험':
      return { ...DETECTION_LEVELS.DANGER, bgClass: 'bg-orange-100', textClass: 'text-orange-800' };
    case '신고 추천':
      return { ...DETECTION_LEVELS.REPORT, bgClass: 'bg-red-100', textClass: 'text-red-800' };
    default:
      return { color: '#888888', bgClass: 'bg-gray-100', textClass: 'text-gray-800' };
  }
};

export default function ScoreResult({ post, onClose }: ScoreResultProps) {
  const levelConfig = getLevelConfig(post.detectionLevel);
  const showCTA = post.detectionScore === 10;

  // Group patterns by category
  const patternsByCategory = post.matchedPatterns.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, typeof post.matchedPatterns>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4">
      {/* Score Display */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="text-center">
            <div
              className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full"
              style={{ backgroundColor: levelConfig.color + '20' }}
            >
              <span
                className="text-5xl font-bold"
                style={{ color: levelConfig.color }}
              >
                {post.detectionScore}
              </span>
            </div>
            <div
              className={`inline-block rounded-full px-4 py-1 text-lg font-semibold ${levelConfig.bgClass} ${levelConfig.textClass}`}
            >
              {post.detectionLevel}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Warnings */}
      {post.safetyWarnings && post.safetyWarnings.length > 0 && (
        <Card className="mb-4 border-yellow-300 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">주의 사항</p>
                <ul className="mt-1 list-inside list-disc text-sm text-yellow-700">
                  {post.safetyWarnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matched Patterns */}
      {post.matchedPatterns.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">감지된 패턴</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(patternsByCategory).map(([category, patterns]) => (
                <div key={category}>
                  <p className="text-sm font-medium text-muted-foreground">
                    {PATTERN_CATEGORIES[category as keyof typeof PATTERN_CATEGORIES] || category}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {patterns.map((p, i) => (
                      <span
                        key={i}
                        className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700"
                      >
                        "{p.pattern}"
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report CTA (10점일 때만) */}
      {showCTA && (
        <Card className="mb-4 border-red-300 bg-red-50">
          <CardContent className="pt-4">
            <p className="mb-3 text-sm text-red-800">{NOTICES.REPORT_CTA}</p>
            <a
              href={EXTERNAL_LINKS.LABOR_REPORT}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="destructive" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                고용노동부 신고하러 가기
              </Button>
            </a>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="mb-4 bg-muted">
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">
            {NOTICES.DETECTION_DISCLAIMER}
          </p>
        </CardContent>
      </Card>

      {/* Mental Health Link */}
      <div className="mb-4 text-center">
        <a
          href={EXTERNAL_LINKS.MENTAL_HEALTH}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary underline"
        >
          정신건강 상담이 필요하신가요?
        </a>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          홈으로
        </Button>
        <Button className="flex-1" onClick={onClose}>
          글 확인하기
        </Button>
      </div>
    </div>
  );
}
