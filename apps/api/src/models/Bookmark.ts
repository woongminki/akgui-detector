import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmarkDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmarkDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
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
          userId: ret.userId.toString(),
          postId: ret.postId.toString(),
        };
        delete result._id;
        delete result.__v;
        return result;
      },
    },
  }
);

// Compound index for uniqueness
bookmarkSchema.index({ userId: 1, postId: 1 }, { unique: true });

// Index for user's bookmarks
bookmarkSchema.index({ userId: 1, createdAt: -1 });

export const Bookmark = mongoose.model<IBookmarkDocument>('Bookmark', bookmarkSchema);
