import mongoose, { Schema, Document } from 'mongoose';

export interface ICommentDocument extends Document {
  _id: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  content: string;
  isPredefined: boolean;
  isBlinded: boolean;
  blindedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<ICommentDocument>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
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
      maxlength: 200,
    },
    isPredefined: {
      type: Boolean,
      default: false,
    },
    isBlinded: {
      type: Boolean,
      default: false,
    },
    blindedReason: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret): Record<string, unknown> => {
        const result = {
          ...ret,
          id: ret._id.toString(),
          postId: ret.postId.toString(),
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

// Index for post comments
commentSchema.index({ postId: 1, createdAt: 1 });

// Index for user comments
commentSchema.index({ authorId: 1, createdAt: -1 });

export const Comment = mongoose.model<ICommentDocument>('Comment', commentSchema);
