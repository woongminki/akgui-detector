export declare const POST_TAGS: readonly ["야근", "인격모독", "업무지시", "평가", "회식", "보고", "회의", "기타"];
export declare const EMOTION_TAGS: readonly ["분노", "슬픔", "불안", "무력감", "혼란", "기타"];
export declare const REACTION_TYPES: readonly ["empathy", "cheer", "angry", "sad"];
export declare const REACTION_LABELS: Record<string, string>;
export declare const PREDEFINED_COMMENTS: readonly ["힘내세요", "공감해요", "화이팅", "응원합니다", "같은 경험이 있어요"];
export declare const DETECTION_LEVELS: {
    readonly HEALTHY: {
        readonly min: 1;
        readonly max: 3;
        readonly label: "건강";
        readonly color: "#22c55e";
    };
    readonly NORMAL: {
        readonly min: 4;
        readonly max: 6;
        readonly label: "보통";
        readonly color: "#eab308";
    };
    readonly DANGER: {
        readonly min: 7;
        readonly max: 9;
        readonly label: "위험";
        readonly color: "#f97316";
    };
    readonly REPORT: {
        readonly min: 10;
        readonly max: 10;
        readonly label: "신고 추천";
        readonly color: "#ef4444";
    };
};
export declare const PATTERN_CATEGORIES: {
    readonly emotion_ignore: "감정 무시형";
    readonly blame_shift: "책임 전가형";
    readonly overwork_normalize: "과로 정상화";
    readonly pressure: "성과 압박";
    readonly empathy_lack: "공감 결여";
};
export declare const REPORT_REASONS: {
    readonly harassment: "괴롭힘/비방";
    readonly spam: "스팸/광고";
    readonly privacy_violation: "개인정보 노출";
    readonly inappropriate: "부적절한 내용";
    readonly other: "기타";
};
export declare const DASHBOARD_PERIODS: readonly ["7d", "30d", "all"];
export declare const VALIDATION: {
    readonly NICKNAME_MIN_LENGTH: 2;
    readonly NICKNAME_MAX_LENGTH: 10;
    readonly POST_MIN_LENGTH: 10;
    readonly POST_MAX_LENGTH: 1000;
    readonly COMMENT_MAX_LENGTH: 200;
    readonly GROUP_LABEL_MIN_LENGTH: 2;
    readonly GROUP_LABEL_MAX_LENGTH: 20;
};
export declare const EXTERNAL_LINKS: {
    readonly LABOR_REPORT: "https://www.moel.go.kr/minwon/minwonCenter.do";
    readonly MENTAL_HEALTH: "https://www.mentalhealth.go.kr/";
};
export declare const NOTICES: {
    readonly DETECTION_DISCLAIMER: "이 결과는 AI 기반 패턴 분석으로, 법적 판단이나 전문 상담을 대체하지 않습니다. 심각한 상황이라면 전문 상담 또는 신고 채널을 이용해 주세요.";
    readonly REPORT_CTA: "10점은 매우 심각한 상황입니다. 고용노동부에 도움을 요청하는 것을 권장드립니다.";
    readonly DASHBOARD_NOTICE: "대시보드는 통계 목적으로만 사용되며, 특정 개인이나 기업을 식별하지 않습니다.";
};
export declare const FORBIDDEN_WORDS: readonly ["유해 발언", "악질 관리자", "문제 기업"];
export declare const DASHBOARD_THRESHOLD = 5;
export declare const INVITE_TOKEN_LENGTH = 12;
export declare const INVITE_TOKEN_EXPIRY_DAYS = 30;
//# sourceMappingURL=index.d.ts.map