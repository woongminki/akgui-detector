"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INVITE_TOKEN_EXPIRY_DAYS = exports.INVITE_TOKEN_LENGTH = exports.DASHBOARD_THRESHOLD = exports.FORBIDDEN_WORDS = exports.NOTICES = exports.EXTERNAL_LINKS = exports.VALIDATION = exports.DASHBOARD_PERIODS = exports.REPORT_REASONS = exports.PATTERN_CATEGORIES = exports.DETECTION_LEVELS = exports.PREDEFINED_COMMENTS = exports.REACTION_LABELS = exports.REACTION_TYPES = exports.EMOTION_TAGS = exports.POST_TAGS = void 0;
// Post Tags
exports.POST_TAGS = [
    '야근',
    '인격모독',
    '업무지시',
    '평가',
    '회식',
    '보고',
    '회의',
    '기타',
];
// Emotion Tags
exports.EMOTION_TAGS = ['분노', '슬픔', '불안', '무력감', '혼란', '기타'];
// Reaction Types
exports.REACTION_TYPES = ['empathy', 'cheer', 'angry', 'sad'];
exports.REACTION_LABELS = {
    empathy: '공감해요',
    cheer: '힘내세요',
    angry: '화나요',
    sad: '슬퍼요',
};
// Predefined Comments
exports.PREDEFINED_COMMENTS = [
    '많이 힘드셨겠어요',
    '저도 비슷한 경험이 있어요',
    '응원합니다',
    '화이팅!',
    // Legacy comments (for backward compatibility)
    '힘내세요',
    '공감해요',
    '화이팅',
    '같은 경험이 있어요',
];
// Detection Levels
exports.DETECTION_LEVELS = {
    HEALTHY: { min: 1, max: 3, label: '건강', color: '#22c55e' },
    NORMAL: { min: 4, max: 6, label: '보통', color: '#eab308' },
    DANGER: { min: 7, max: 9, label: '위험', color: '#f97316' },
    REPORT: { min: 10, max: 10, label: '신고 추천', color: '#ef4444' },
};
// Pattern Categories
exports.PATTERN_CATEGORIES = {
    emotion_ignore: '감정 무시형',
    blame_shift: '책임 전가형',
    overwork_normalize: '과로 정상화',
    pressure: '성과 압박',
    empathy_lack: '공감 결여',
};
// Report Reasons
exports.REPORT_REASONS = {
    harassment: '괴롭힘/비방',
    spam: '스팸/광고',
    privacy_violation: '개인정보 노출',
    inappropriate: '부적절한 내용',
    other: '기타',
};
// Dashboard Periods
exports.DASHBOARD_PERIODS = ['7d', '30d', 'all'];
// Validation Constants
exports.VALIDATION = {
    NICKNAME_MIN_LENGTH: 2,
    NICKNAME_MAX_LENGTH: 10,
    POST_MIN_LENGTH: 10,
    POST_MAX_LENGTH: 1000,
    COMMENT_MAX_LENGTH: 200,
    GROUP_LABEL_MIN_LENGTH: 2,
    GROUP_LABEL_MAX_LENGTH: 20,
};
// External Links
exports.EXTERNAL_LINKS = {
    LABOR_REPORT: 'https://www.moel.go.kr/minwon/minwonCenter.do',
    MENTAL_HEALTH: 'https://www.mentalhealth.go.kr/',
};
// Fixed Notice Messages
exports.NOTICES = {
    DETECTION_DISCLAIMER: '이 결과는 AI 기반 패턴 분석으로, 법적 판단이나 전문 상담을 대체하지 않습니다. 심각한 상황이라면 전문 상담 또는 신고 채널을 이용해 주세요.',
    REPORT_CTA: '10점은 매우 심각한 상황입니다. 고용노동부에 도움을 요청하는 것을 권장드립니다.',
    DASHBOARD_NOTICE: '대시보드는 통계 목적으로만 사용되며, 특정 개인이나 기업을 식별하지 않습니다.',
};
// Forbidden Words (for content filtering)
exports.FORBIDDEN_WORDS = [
    '유해 발언',
    '악질 관리자',
    '문제 기업',
];
// Minimum posts for dashboard visibility
exports.DASHBOARD_THRESHOLD = 5;
// Invite token length
exports.INVITE_TOKEN_LENGTH = 12;
// Invite token expiry (days)
exports.INVITE_TOKEN_EXPIRY_DAYS = 30;
