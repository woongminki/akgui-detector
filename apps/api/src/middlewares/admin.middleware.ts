import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { AppError } from './error.middleware.js';

export const requireAdmin = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('인증이 필요합니다.', 401, 'UNAUTHORIZED');
    }

    if (req.user.role !== 'admin') {
      throw new AppError('관리자 권한이 필요합니다.', 403, 'FORBIDDEN');
    }

    next();
  } catch (error) {
    next(error);
  }
};
