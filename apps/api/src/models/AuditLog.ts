import mongoose, { Schema, Document } from 'mongoose';
import type { AuditAction } from '@evil-spirit/shared';

export interface IAuditLogDocument extends Document {
  _id: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  action: AuditAction;
  targetType: 'post' | 'comment' | 'user' | 'filter_rule';
  targetId: mongoose.Types.ObjectId;
  details?: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: [
        'blind_post',
        'delete_post',
        'blind_comment',
        'delete_comment',
        'restrict_user',
        'unrestrict_user',
        'dismiss_report',
        'update_filter_rule',
      ],
      required: true,
    },
    targetType: {
      type: String,
      enum: ['post', 'comment', 'user', 'filter_rule'],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (_doc, ret): Record<string, unknown> => {
        const result = {
          ...ret,
          id: ret._id.toString(),
          adminId: ret.adminId.toString(),
          targetId: ret.targetId.toString(),
        };
        delete result._id;
        delete result.__v;
        return result;
      },
    },
  }
);

// Index for listing logs
auditLogSchema.index({ createdAt: -1 });

// Index for admin activity
auditLogSchema.index({ adminId: 1, createdAt: -1 });

// Index for target history
auditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLogDocument>('AuditLog', auditLogSchema);
