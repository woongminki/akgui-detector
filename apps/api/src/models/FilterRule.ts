import mongoose, { Schema, Document } from 'mongoose';
import type {
  FilterRuleType,
  FilterRuleCategory,
  FilterRuleSeverity,
} from '@evil-spirit/shared';

export interface IFilterRuleDocument extends Document {
  _id: mongoose.Types.ObjectId;
  type: FilterRuleType;
  category: FilterRuleCategory;
  pattern: string;
  severity: FilterRuleSeverity;
  appliesTo: ('post' | 'comment')[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const filterRuleSchema = new Schema<IFilterRuleDocument>(
  {
    type: {
      type: String,
      enum: ['regex', 'keyword', 'pattern'],
      required: true,
    },
    category: {
      type: String,
      enum: ['realname', 'contact', 'assertion', 'profanity', 'hate'],
      required: true,
    },
    pattern: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['warn', 'block'],
      required: true,
    },
    appliesTo: {
      type: [String],
      enum: ['post', 'comment'],
      default: ['post', 'comment'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for active rules lookup
filterRuleSchema.index({ isActive: 1, appliesTo: 1 });

export const FilterRule = mongoose.model<IFilterRuleDocument>('FilterRule', filterRuleSchema);
