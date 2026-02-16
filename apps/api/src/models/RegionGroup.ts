import mongoose, { Schema, Document } from 'mongoose';

export interface IRegionGroupDocument extends Document {
  _id: mongoose.Types.ObjectId;
  label: string;
  creatorId: mongoose.Types.ObjectId;
  inviteToken: string;
  inviteTokenExpiresAt: Date;
  memberCount: number;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const regionGroupSchema = new Schema<IRegionGroupDocument>(
  {
    label: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 20,
      trim: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inviteToken: {
      type: String,
      required: true,
      unique: true,
    },
    inviteTokenExpiresAt: {
      type: Date,
      required: true,
    },
    memberCount: {
      type: Number,
      default: 1,
      min: 0,
    },
    postCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret): Record<string, unknown> => {
        const result = {
          ...ret,
          id: ret._id.toString(),
          creatorId: ret.creatorId.toString(),
        };
        delete result._id;
        delete result.__v;
        return result;
      },
    },
  }
);

// Index for invite token lookup
regionGroupSchema.index({ inviteToken: 1 });

// Index for user's groups
regionGroupSchema.index({ creatorId: 1 });

export const RegionGroup = mongoose.model<IRegionGroupDocument>(
  'RegionGroup',
  regionGroupSchema
);
