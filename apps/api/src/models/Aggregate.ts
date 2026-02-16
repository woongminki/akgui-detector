import mongoose, { Schema, Document } from 'mongoose';
import type { AggregateType } from '@evil-spirit/shared';

export interface IAggregateDocument extends Document {
  _id: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  type: AggregateType;
  period: '7d' | '30d' | 'all';
  data: Map<string, number>;
  totalPosts: number;
  calculatedAt: Date;
}

const aggregateSchema = new Schema<IAggregateDocument>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'RegionGroup',
      required: true,
    },
    type: {
      type: String,
      enum: ['keyword', 'pattern', 'tag', 'score'],
      required: true,
    },
    period: {
      type: String,
      enum: ['7d', '30d', 'all'],
      required: true,
    },
    data: {
      type: Map,
      of: Number,
      default: {},
    },
    totalPosts: {
      type: Number,
      default: 0,
      min: 0,
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    toJSON: {
      transform: (_doc, ret): Record<string, unknown> => {
        const result = {
          ...ret,
          id: ret._id?.toString(),
          groupId: ret.groupId?.toString(),
          data: ret.data instanceof Map ? Object.fromEntries(ret.data) : ret.data,
        };
        delete result._id;
        delete result.__v;
        return result;
      },
    },
  }
);

// Compound index for uniqueness
aggregateSchema.index({ groupId: 1, type: 1, period: 1 }, { unique: true });

export const Aggregate = mongoose.model<IAggregateDocument>('Aggregate', aggregateSchema);
