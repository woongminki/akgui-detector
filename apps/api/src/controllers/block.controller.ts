import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/index.js';
import * as blockService from '../services/block.service.js';

const createBlockSchema = z.object({
  blockedId: z.string().min(1, '차단할 사용자 ID가 필요합니다.'),
});

export const createBlock = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { blockedId } = createBlockSchema.parse(req.body);

  const result = await blockService.createBlock(userId, blockedId);

  res.status(201).json({
    success: true,
    data: result,
  });
};

export const removeBlock = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const blockedId = req.params.blockedId!;

  await blockService.removeBlock(userId, blockedId);

  res.json({
    success: true,
    data: { removed: true },
  });
};

export const getMyBlocks = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  const result = await blockService.getUserBlocks(userId);

  res.json({
    success: true,
    data: result,
  });
};
