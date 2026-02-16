import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupMembershipDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  joinedAt: Date;
  lastActiveAt: Date;
}

const groupMembershipSchema = new Schema<IGroupMembershipDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'RegionGroup',
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    lastActiveAt: {
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
          id: ret._id.toString(),
          userId: ret.userId.toString(),
          groupId: ret.groupId.toString(),
        };
        delete result._id;
        delete result.__v;
        return result;
      },
    },
  }
);

// Compound index for user-group uniqueness
groupMembershipSchema.index({ userId: 1, groupId: 1 }, { unique: true });

// Index for finding user's groups
groupMembershipSchema.index({ userId: 1 });

// Index for finding group members
groupMembershipSchema.index({ groupId: 1 });

export const GroupMembership = mongoose.model<IGroupMembershipDocument>(
  'GroupMembership',
  groupMembershipSchema
);
