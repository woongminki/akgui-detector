import type { DetectionLevel } from '@evil-spirit/shared';

// Maximum raw score before cap
const MAX_RAW_SCORE = 30;

// Calculate score from weights and pattern count
export const calculateScore = (totalWeight: number, patternCount: number): number => {
  if (patternCount === 0) {
    return 1; // Minimum score
  }

  // Base score from weight
  let rawScore = totalWeight;

  // Bonus for multiple patterns (indicates pattern of behavior)
  if (patternCount >= 3) {
    rawScore += 2;
  }
  if (patternCount >= 5) {
    rawScore += 2;
  }

  // Normalize to 1-10 scale
  const normalizedScore = Math.round((rawScore / MAX_RAW_SCORE) * 9) + 1;

  // Clamp to 1-10
  return Math.min(10, Math.max(1, normalizedScore));
};

// Map score to level
export const scoreToLevel = (score: number): DetectionLevel => {
  if (score <= 3) {
    return '건강';
  }
  if (score <= 6) {
    return '보통';
  }
  if (score <= 9) {
    return '위험';
  }
  return '신고 추천';
};

// Get level details for display
export const getLevelDetails = (level: DetectionLevel) => {
  const details = {
    건강: {
      color: '#22c55e', // green-500
      description: '특별히 문제되는 표현이 감지되지 않았습니다.',
      showCTA: false,
    },
    보통: {
      color: '#eab308', // yellow-500
      description: '일부 주의가 필요한 표현이 감지되었습니다.',
      showCTA: false,
    },
    위험: {
      color: '#f97316', // orange-500
      description: '여러 문제 표현이 감지되었습니다. 상황을 주의 깊게 살펴보세요.',
      showCTA: false,
    },
    '신고 추천': {
      color: '#ef4444', // red-500
      description: '심각한 문제 표현이 다수 감지되었습니다. 전문 상담이나 신고를 고려해 보세요.',
      showCTA: true,
    },
  };

  return details[level];
};
