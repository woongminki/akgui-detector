// User Types
export interface IUser {
  id: string;
  email: string;
  provider: 'kakao' | 'google';
  providerId: string;
  nickname: string;
  nicknameChangedAt?: Date;
  role: 'user' | 'admin';
  isRestricted: boolean;
  restrictedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPublic {
  id: string;
  nickname: string;
}

// Region Group Types
export interface IRegionGroup {
  id: string;
  label: string;
  creatorId: string;
  inviteToken: string;
  inviteTokenExpiresAt: Date;
  memberCount: number;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroupMembership {
  id: string;
  userId: string;
  groupId: string;
  joinedAt: Date;
  lastActiveAt: Date;
}

// Post Types
export type PostTag =
  | '야근'
  | '인격모독'
  | '업무지시'
  | '평가'
  | '회식'
  | '보고'
  | '회의'
  | '기타';

export type EmotionTag = '분노' | '슬픔' | '불안' | '무력감' | '혼란' | '기타';

export interface IPost {
  id: string;
  groupId: string;
  authorId: string;
  content: string;
  tags: PostTag[];
  emotionTag: EmotionTag;
  detectionScore: number;
  detectionLevel: DetectionLevel;
  matchedPatterns: IMatchedPattern[];
  isBlinded: boolean;
  blindedReason?: string;
  viewCount: number;
  reactionCounts: Record<ReactionType, number>;
  commentCount: number;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMatchedPattern {
  category: PatternCategory;
  pattern: string;
  weight: number;
}

export type DetectionLevel = '건강' | '보통' | '위험' | '신고 추천';

export type PatternCategory =
  | 'emotion_ignore'
  | 'blame_shift'
  | 'overwork_normalize'
  | 'pressure'
  | 'empathy_lack';

// Reaction Types
export type ReactionType = 'empathy' | 'cheer' | 'angry' | 'sad';

export interface IReaction {
  id: string;
  postId: string;
  userId: string;
  type: ReactionType;
  createdAt: Date;
}

// Comment Types
export type PredefinedComment =
  | '힘내세요'
  | '공감해요'
  | '화이팅'
  | '응원합니다'
  | '같은 경험이 있어요';

export interface IComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  isPredefined: boolean;
  isBlinded: boolean;
  blindedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Report Types
export type ReportReason =
  | 'harassment'
  | 'spam'
  | 'privacy_violation'
  | 'inappropriate'
  | 'other';

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export type ReportTargetType = 'post' | 'comment';

export interface IReport {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  action?: 'blind' | 'delete' | 'warn' | 'restrict' | 'none';
  createdAt: Date;
  updatedAt: Date;
}

// Block Types
export interface IBlock {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: Date;
}

// Aggregate Types
export type AggregateType = 'keyword' | 'pattern' | 'tag' | 'score';

export interface IAggregate {
  id: string;
  groupId: string;
  type: AggregateType;
  period: '7d' | '30d' | 'all';
  data: Record<string, number>;
  totalPosts: number;
  calculatedAt: Date;
}

// Filter Rule Types
export type FilterRuleType = 'regex' | 'keyword' | 'pattern';
export type FilterRuleSeverity = 'warn' | 'block';
export type FilterRuleCategory =
  | 'realname'
  | 'contact'
  | 'assertion'
  | 'profanity'
  | 'hate';

export interface IFilterRule {
  id: string;
  type: FilterRuleType;
  category: FilterRuleCategory;
  pattern: string;
  severity: FilterRuleSeverity;
  appliesTo: ('post' | 'comment')[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Audit Log Types
export type AuditAction =
  | 'blind_post'
  | 'delete_post'
  | 'blind_comment'
  | 'delete_comment'
  | 'restrict_user'
  | 'unrestrict_user'
  | 'dismiss_report'
  | 'update_filter_rule';

export interface IAuditLog {
  id: string;
  adminId: string;
  action: AuditAction;
  targetType: 'post' | 'comment' | 'user' | 'filter_rule';
  targetId: string;
  details?: Record<string, unknown>;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

// Auth Types
export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ILoginResponse {
  user: IUserPublic;
  tokens: IAuthTokens;
  isNewUser: boolean;
}

// Detection Result Types
export interface IDetectionResult {
  score: number;
  level: DetectionLevel;
  matchedPatterns: IMatchedPattern[];
}

// Dashboard Types
export interface IDashboardData {
  keywords: { keyword: string; count: number }[];
  trends: { date: string; avgScore: number; postCount: number }[];
  tagDistribution: Record<PostTag, number>;
  totalPosts: number;
  avgScore: number;
  period: '7d' | '30d' | 'all';
}
