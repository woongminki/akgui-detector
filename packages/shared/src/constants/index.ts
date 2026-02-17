// Post Tags (상황 선택)
export const POST_TAGS = [
  '업무지시',
  '회의',
  '회식',
  '평가',
  '일상대화',
  '채팅/메신저',
  '기타',
] as const;

// Emotion Tags (느낀 감정)
export const EMOTION_TAGS = [
  '분노',
  '억울함',
  '무력감',
  '당혹감',
  '슬픔',
  '답답함',
  '불안',
  '수치심',
] as const;

// Reaction Types
export const REACTION_TYPES = ['empathy', 'cheer', 'angry', 'sad'] as const;

export const REACTION_LABELS: Record<string, string> = {
  empathy: '공감해요',
  cheer: '힘내세요',
  angry: '화나요',
  sad: '슬퍼요',
};

// Predefined Comments
export const PREDEFINED_COMMENTS = [
  '많이 힘드셨겠어요',
  '저도 비슷한 경험이 있어요',
  '응원합니다',
  '화이팅!',
  // Legacy comments (for backward compatibility)
  '힘내세요',
  '공감해요',
  '화이팅',
  '같은 경험이 있어요',
] as const;

// Detection Levels
export const DETECTION_LEVELS = {
  HEALTHY: { min: 1, max: 3, label: '건강', color: '#22c55e' },
  NORMAL: { min: 4, max: 6, label: '보통', color: '#eab308' },
  DANGER: { min: 7, max: 9, label: '위험', color: '#f97316' },
  REPORT: { min: 10, max: 10, label: '신고 추천', color: '#ef4444' },
} as const;

// Pattern Categories
export const PATTERN_CATEGORIES = {
  emotion_ignore: '감정 무시형',
  blame_shift: '책임 전가형',
  overwork_normalize: '과로 정상화',
  pressure: '성과 압박',
  empathy_lack: '공감 결여',
} as const;

// Report Reasons
export const REPORT_REASONS = {
  harassment: '괴롭힘/비방',
  spam: '스팸/광고',
  privacy_violation: '개인정보 노출',
  inappropriate: '부적절한 내용',
  other: '기타',
} as const;

// Dashboard Periods
export const DASHBOARD_PERIODS = ['7d', '30d', 'all'] as const;

// Validation Constants
export const VALIDATION = {
  NICKNAME_MIN_LENGTH: 2,
  NICKNAME_MAX_LENGTH: 10,
  POST_MIN_LENGTH: 10,
  POST_MAX_LENGTH: 1000,
  COMMENT_MAX_LENGTH: 200,
  GROUP_LABEL_MIN_LENGTH: 2,
  GROUP_LABEL_MAX_LENGTH: 20,
} as const;

// External Links
export const EXTERNAL_LINKS = {
  LABOR_REPORT: 'https://www.moel.go.kr/minwon/minwonCenter.do',
  MENTAL_HEALTH: 'https://www.mentalhealth.go.kr/',
} as const;

// Fixed Notice Messages
export const NOTICES = {
  DETECTION_DISCLAIMER:
    '이 결과는 AI 기반 패턴 분석으로, 법적 판단이나 전문 상담을 대체하지 않습니다. 심각한 상황이라면 전문 상담 또는 신고 채널을 이용해 주세요.',
  REPORT_CTA:
    '10점은 매우 심각한 상황입니다. 고용노동부에 도움을 요청하는 것을 권장드립니다.',
  DASHBOARD_NOTICE:
    '대시보드는 통계 목적으로만 사용되며, 특정 개인이나 기업을 식별하지 않습니다.',
} as const;

// Forbidden Words (for content filtering)
export const FORBIDDEN_WORDS = [
  '유해 발언',
  '악질 관리자',
  '문제 기업',
] as const;

// Minimum posts for dashboard visibility
export const DASHBOARD_THRESHOLD = 5;

// Invite token length
export const INVITE_TOKEN_LENGTH = 12;

// Invite token expiry (days)
export const INVITE_TOKEN_EXPIRY_DAYS = 30;
