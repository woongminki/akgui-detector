import mongoose, { Schema, Document } from 'mongoose';
import type { ReactionType } from '@evil-spirit/shared';

export interface IReactionDocument extends Document {
  _id: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: ReactionType;
  createdAt: Date;
}

const reactionSchema = new Schema<IReactionDocument>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['empathy', 'cheer', 'angry', 'sad'],
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (_doc, ret): Record<string, unknown> => {
        const result = {
          ...ret,
          id: ret._id.toString(),
          postId: ret.postId.toString(),
          userId: ret.userId.toString(),
        };
        delete result._id;
        delete result.__v;
        return result;
      },
    },
  }
);

// Compound index for user-post-type uniqueness
reactionSchema.index({ postId: 1, userId: 1, type: 1 }, { unique: true });

// Index for post reactions
reactionSchema.index({ postId: 1 });

// Index for user reactions
reactionSchema.index({ userId: 1 });

export const Reaction = mongoose.model<IReactionDocument>('Reaction', reactionSchema);
