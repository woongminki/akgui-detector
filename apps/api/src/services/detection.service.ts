import type { DetectionLevel, IMatchedPattern, PatternCategory } from '@evil-spirit/shared';
import { emotionIgnorePatterns } from '../utils/detection/patterns/emotion-ignore.js';
import { blameShiftPatterns } from '../utils/detection/patterns/blame-shift.js';
import { overworkNormalizePatterns } from '../utils/detection/patterns/overwork-normalize.js';
import { pressurePatterns } from '../utils/detection/patterns/pressure.js';
import { empathyLackPatterns } from '../utils/detection/patterns/empathy-lack.js';
import { calculateScore, scoreToLevel } from '../utils/detection/scorer.js';

interface DetectionPattern {
  pattern: string | RegExp;
  weight: number;
  category: PatternCategory;
}

interface AnalysisResult {
  score: number;
  level: DetectionLevel;
  matchedPatterns: IMatchedPattern[];
}

const allPatterns: DetectionPattern[] = [
  ...emotionIgnorePatterns.map((p) => ({ ...p, category: 'emotion_ignore' as const })),
  ...blameShiftPatterns.map((p) => ({ ...p, category: 'blame_shift' as const })),
  ...overworkNormalizePatterns.map((p) => ({ ...p, category: 'overwork_normalize' as const })),
  ...pressurePatterns.map((p) => ({ ...p, category: 'pressure' as const })),
  ...empathyLackPatterns.map((p) => ({ ...p, category: 'empathy_lack' as const })),
];

export const analyze = (content: string): AnalysisResult => {
  const matchedPatterns: IMatchedPattern[] = [];
  let totalWeight = 0;

  for (const { pattern, weight, category } of allPatterns) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'gi') : pattern;
    const matches = content.match(regex);

    if (matches) {
      // Add unique matches only
      for (const match of matches) {
        const existing = matchedPatterns.find(
          (p) => p.pattern === match && p.category === category
        );
        if (!existing) {
          matchedPatterns.push({
            category,
            pattern: match,
            weight,
          });
          totalWeight += weight;
        }
      }
    }
  }

  const score = calculateScore(totalWeight, matchedPatterns.length);
  const level = scoreToLevel(score);

  return {
    score,
    level,
    matchedPatterns,
  };
};

export const getPatternCategories = () => {
  const categories: Record<PatternCategory, number> = {
    emotion_ignore: emotionIgnorePatterns.length,
    blame_shift: blameShiftPatterns.length,
    overwork_normalize: overworkNormalizePatterns.length,
    pressure: pressurePatterns.length,
    empathy_lack: empathyLackPatterns.length,
  };

  return categories;
};
