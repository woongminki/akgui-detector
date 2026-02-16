import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/index.js';
import * as userService from '../services/user.service.js';

const updateNicknameSchema = z.object({
  nickname: z
    .string()
    .min(2, '닉네임은 최소 2자 이상이어야 합니다.')
    .max(10, '닉네임은 최대 10자까지 가능합니다.')
    .regex(/^[가-힣a-zA-Z0-9_]+$/, '닉네임은 한글, 영문, 숫자, 밑줄만 사용 가능합니다.'),
});

const checkNicknameSchema = z.object({
  nickname: z.string().min(2).max(10),
});

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;

  res.json({
    success: true,
    data: {
      id: user._id.toString(),
      nickname: user.nickname,
      role: user.role,
      nicknameChangedAt: user.nicknameChangedAt,
      createdAt: user.createdAt,
    },
  });
};

export const updateNickname = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { nickname } = updateNicknameSchema.parse(req.body);

  const result = await userService.updateNickname(userId, nickname);

  res.json({
    success: true,
    data: result,
  });
};

export const checkNickname = async (req: Request, res: Response): Promise<void> => {
  const { nickname } = checkNicknameSchema.parse(req.query);

  const result = await userService.checkNickname(nickname);

  res.json({
    success: true,
    data: result,
  });
};
