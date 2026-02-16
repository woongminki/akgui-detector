import mongoose, { Schema, Document } from 'mongoose';
import type { ReportReason, ReportStatus, ReportTargetType } from '@evil-spirit/shared';

export interface IReportDocument extends Document {
  _id: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId;
  targetType: ReportTargetType;
  targetId: mongoose.Types.ObjectId;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  action?: 'blind' | 'delete' | 'warn' | 'restrict' | 'none';
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReportDocument>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['post', 'comment'],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType',
    },
    reason: {
      type: String,
      enum: ['harassment', 'spam', 'privacy_violation', 'inappropriate', 'other'],
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    action: {
      type: String,
      enum: ['blind', 'delete', 'warn', 'restrict', 'none'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret): Record<string, unknown> => {
        const result = {
          ...ret,
          id: ret._id.toString(),
          reporterId: ret.reporterId.toString(),
          targetId: ret.targetId.toString(),
          reviewedBy: ret.reviewedBy ? ret.reviewedBy.toString() : undefined,
        };
        delete result._id;
        delete result.__v;
        return result;
      },
    },
  }
);

// Index for pending reports
reportSchema.index({ status: 1, createdAt: -1 });

// Index for target lookup
reportSchema.index({ targetType: 1, targetId: 1 });

// Index for reporter history
reportSchema.index({ reporterId: 1, createdAt: -1 });

export const Report = mongoose.model<IReportDocument>('Report', reportSchema);
