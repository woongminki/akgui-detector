import { FORBIDDEN_WORDS } from '@evil-spirit/shared';

interface ForbiddenCheckResult {
  isValid: boolean;
  matchedWord?: string;
}

// Additional forbidden patterns for nicknames/labels
const additionalForbiddenPatterns = [
  /관리자/,
  /운영자/,
  /admin/i,
  /moderator/i,
  /시스템/,
  /system/i,
  /테스트/,
  /test/i,
];

export const checkForbiddenWords = (text: string): ForbiddenCheckResult => {
  // Check shared forbidden words
  for (const word of FORBIDDEN_WORDS) {
    if (text.includes(word)) {
      return {
        isValid: false,
        matchedWord: word,
      };
    }
  }

  // Check additional patterns
  for (const pattern of additionalForbiddenPatterns) {
    if (pattern.test(text)) {
      return {
        isValid: false,
        matchedWord: text.match(pattern)?.[0],
      };
    }
  }

  // Check for profanity
  const profanityPattern = /시발|씨발|씨팔|병신|지랄|개새끼|썅/gi;
  if (profanityPattern.test(text)) {
    return {
      isValid: false,
      matchedWord: text.match(profanityPattern)?.[0],
    };
  }

  return { isValid: true };
};
