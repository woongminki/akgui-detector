import mongoose, { Schema, Document } from 'mongoose';
import type {
  PostTag,
  EmotionTag,
  DetectionLevel,
  IMatchedPattern,
  ReactionType,
} from '@evil-spirit/shared';

export interface IPostDocument extends Document {
  _id: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
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

const matchedPatternSchema = new Schema(
  {
    category: {
      type: String,
      enum: ['emotion_ignore', 'blame_shift', 'overwork_normalize', 'pressure', 'empathy_lack'],
      required: true,
    },
    pattern: {
      type: String,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const postSchema = new Schema<IPostDocument>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'RegionGroup',
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
    },
    tags: {
      type: [String],
      enum: ['야근', '인격모독', '업무지시', '평가', '회식', '보고', '회의', '기타'],
      default: [],
    },
    emotionTag: {
      type: String,
      enum: ['분노', '슬픔', '불안', '무력감', '혼란', '기타'],
      required: true,
    },
    detectionScore: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    detectionLevel: {
      type: String,
      enum: ['건강', '보통', '위험', '신고 추천'],
      required: true,
    },
    matchedPatterns: {
      type: [matchedPatternSchema],
      default: [],
    },
    isBlinded: {
      type: Boolean,
      default: false,
    },
    blindedReason: {
      type: String,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reactionCounts: {
      type: Map,
      of: Number,
      default: { empathy: 0, cheer: 0, angry: 0, sad: 0 },
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    idempotencyKey: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret): Record<string, unknown> => {
        const result = {
          ...ret,
          id: ret._id.toString(),
          groupId: ret.groupId.toString(),
          // Convert Map to object
          reactionCounts: ret.reactionCounts instanceof Map
            ? Object.fromEntries(ret.reactionCounts)
            : ret.reactionCounts,
        };
        // Do NOT expose authorId to protect anonymity
        delete result.authorId;
        delete result._id;
        delete result.__v;
        return result;
      },
    },
  }
);

// Compound index for idempotency
postSchema.index({ authorId: 1, idempotencyKey: 1 }, { unique: true });

// Index for group feed
postSchema.index({ groupId: 1, createdAt: -1 });

// Index for user's posts
postSchema.index({ authorId: 1, createdAt: -1 });

// Index for filtering
postSchema.index({ groupId: 1, tags: 1, detectionScore: 1 });

export const Post = mongoose.model<IPostDocument>('Post', postSchema);
