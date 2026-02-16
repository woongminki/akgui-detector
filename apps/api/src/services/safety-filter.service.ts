import { FilterRule } from '../models/index.js';

interface FilterResult {
  blocked: boolean;
  reason?: string;
  warnings: string[];
}

// Default filter patterns (used when no DB rules exist)
const defaultPatterns = {
  realname: [
    // Korean name + position patterns
    { pattern: /[가-힣]{2,4}\s*(과장|대리|부장|팀장|사원|차장|실장|이사|상무|전무|사장|대표)/g, severity: 'block' as const },
    // Department + name patterns
    { pattern: /(인사|총무|영업|개발|기획|마케팅|재무|회계|법무)\s*[가-힣]{2,4}/g, severity: 'warn' as const },
  ],
  contact: [
    // Phone numbers
    { pattern: /01[0-9]-?\d{3,4}-?\d{4}/g, severity: 'block' as const },
    { pattern: /0\d{1,2}-?\d{3,4}-?\d{4}/g, severity: 'block' as const },
    // Email
    { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, severity: 'block' as const },
  ],
  assertion: [
    // Factual assertion patterns
    { pattern: /(틀림없이|분명히|확실히|100%)\s*.{0,20}(이다|입니다|했다|했습니다)/g, severity: 'warn' as const },
    { pattern: /반드시\s*.{0,20}(범죄|불법|위법)/g, severity: 'warn' as const },
  ],
  profanity: [
    // Common profanity (simplified)
    { pattern: /시발|씨발|씨팔|ㅅㅂ|ㅆㅂ|병신|ㅂㅅ|지랄|ㅈㄹ|개새끼|썅/gi, severity: 'block' as const },
  ],
  hate: [
    // Hate speech patterns
    { pattern: /한남|한녀|틀딱|급식충|맘충/gi, severity: 'block' as const },
  ],
};

const severityMessages: Record<string, string> = {
  realname: '실명이나 직함이 포함되어 있습니다.',
  contact: '연락처 정보가 포함되어 있습니다.',
  assertion: '단정적인 표현이 포함되어 있습니다.',
  profanity: '부적절한 표현이 포함되어 있습니다.',
  hate: '혐오 표현이 포함되어 있습니다.',
};

export const filterContent = async (
  content: string,
  type: 'post' | 'comment'
): Promise<FilterResult> => {
  const warnings: string[] = [];
  let blocked = false;
  let blockReason: string | undefined;

  // Try to get rules from DB
  let dbRules;
  try {
    dbRules = await FilterRule.find({
      isActive: true,
      appliesTo: type,
    });
  } catch {
    // DB not available, use defaults
    dbRules = [];
  }

  if (dbRules.length > 0) {
    // Use DB rules
    for (const rule of dbRules) {
      try {
        const regex = new RegExp(rule.pattern, 'gi');
        if (regex.test(content)) {
          if (rule.severity === 'block') {
            blocked = true;
            blockReason = severityMessages[rule.category] || '작성이 제한된 내용입니다.';
            break;
          } else {
            warnings.push(severityMessages[rule.category] || '주의가 필요한 내용입니다.');
          }
        }
      } catch {
        // Invalid regex, skip
        continue;
      }
    }
  } else {
    // Use default patterns
    for (const [category, patterns] of Object.entries(defaultPatterns)) {
      for (const { pattern, severity } of patterns) {
        if (pattern.test(content)) {
          // Reset regex lastIndex
          pattern.lastIndex = 0;

          if (severity === 'block') {
            blocked = true;
            blockReason = severityMessages[category];
            break;
          } else {
            if (!warnings.includes(severityMessages[category])) {
              warnings.push(severityMessages[category]);
            }
          }
        }
      }
      if (blocked) break;
    }
  }

  return {
    blocked,
    reason: blockReason,
    warnings,
  };
};

// For client-side preview
export const getFilterRules = async () => {
  try {
    const rules = await FilterRule.find({ isActive: true });
    return rules.map((r) => ({
      category: r.category,
      pattern: r.pattern,
      severity: r.severity,
    }));
  } catch {
    // Return default pattern summaries
    return Object.entries(defaultPatterns).flatMap(([category, patterns]) =>
      patterns.map((p) => ({
        category,
        pattern: p.pattern.source,
        severity: p.severity,
      }))
    );
  }
};
