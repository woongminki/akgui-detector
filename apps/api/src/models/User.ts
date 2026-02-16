import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  provider: 'kakao' | 'google';
  providerId: string;
  nickname: string;
  nicknameChangedAt?: Date;
  role: 'user' | 'admin';
  isRestricted: boolean;
  restrictedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    provider: {
      type: String,
      enum: ['kakao', 'google'],
      required: true,
    },
    providerId: {
      type: String,
      required: true,
    },
    nickname: {
      type: String,
      required: true,
      unique: true,
      minlength: 2,
      maxlength: 10,
      trim: true,
    },
    nicknameChangedAt: {
      type: Date,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isRestricted: {
      type: Boolean,
      default: false,
    },
    restrictedUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret): Record<string, unknown> => {
        const result = {
          ...ret,
          id: ret._id.toString(),
        };
        delete result._id;
        delete result.__v;
        delete result.email;
        delete result.providerId;
        return result;
      },
    },
  }
);

// Compound index for OAuth lookup
userSchema.index({ provider: 1, providerId: 1 }, { unique: true });

// Index for nickname uniqueness check
userSchema.index({ nickname: 1 });

export const User = mongoose.model<IUserDocument>('User', userSchema);
