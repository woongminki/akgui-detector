import mongoose, { Schema, Document } from 'mongoose';

export interface IBlockDocument extends Document {
  _id: mongoose.Types.ObjectId;
  blockerId: mongoose.Types.ObjectId;
  blockedId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const blockSchema = new Schema<IBlockDocument>(
  {
    blockerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    blockedId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
          blockerId: ret.blockerId.toString(),
          blockedId: ret.blockedId.toString(),
        };
        delete result._id;
        delete result.__v;
        return result;
      },
    },
  }
);

// Compound index for uniqueness
blockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });

// Index for checking if user is blocked
blockSchema.index({ blockedId: 1 });

export const Block = mongoose.model<IBlockDocument>('Block', blockSchema);
