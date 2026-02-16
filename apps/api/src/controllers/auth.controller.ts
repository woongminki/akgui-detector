import { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service.js';

const kakaoLoginSchema = z.object({
  code: z.string().min(1, '인가 코드가 필요합니다.'),
});

const googleLoginSchema = z.object({
  code: z.string().min(1, '인가 코드가 필요합니다.'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, '리프레시 토큰이 필요합니다.'),
});

export const kakaoLogin = async (req: Request, res: Response): Promise<void> => {
  const { code } = kakaoLoginSchema.parse(req.body);
  const result = await authService.kakaoLogin(code);

  res.json({
    success: true,
    data: result,
  });
};

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  const { code } = googleLoginSchema.parse(req.body);
  const result = await authService.googleLogin(code);

  res.json({
    success: true,
    data: result,
  });
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = refreshTokenSchema.parse(req.body);
  const result = await authService.refreshToken(refreshToken);

  res.json({
    success: true,
    data: result,
  });
};
