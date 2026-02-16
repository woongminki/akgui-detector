import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUserDocument } from '../models/index.js';
import { AppError } from './error.middleware.js';

export interface AuthRequest extends Request {
  user?: IUserDocument;
  userId?: string;
}

interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('인증이 필요합니다.', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('인증이 필요합니다.', 401, 'UNAUTHORIZED');
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as JwtPayload;

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AppError('사용자를 찾을 수 없습니다.', 401, 'USER_NOT_FOUND');
    }

    if (user.isRestricted && user.restrictedUntil && user.restrictedUntil > new Date()) {
      throw new AppError('이용이 제한된 계정입니다.', 403, 'USER_RESTRICTED');
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback-secret'
      ) as JwtPayload;

      const user = await User.findById(decoded.userId);

      if (user && (!user.isRestricted || !user.restrictedUntil || user.restrictedUntil <= new Date())) {
        req.user = user;
        req.userId = user._id.toString();
      }
    } catch {
      // Ignore token errors for optional auth
    }

    next();
  } catch (error) {
    next(error);
  }
};
