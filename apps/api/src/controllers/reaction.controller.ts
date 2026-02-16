import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/index.js';
import * as reactionService from '../services/reaction.service.js';
import { REACTION_TYPES } from '@evil-spirit/shared';

const addReactionSchema = z.object({
  type: z.enum(REACTION_TYPES),
});

export const addReaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const postId = req.params.id!;
  const { type } = addReactionSchema.parse(req.body);

  const result = await reactionService.addReaction(userId, postId, type);

  res.json({
    success: true,
    data: result,
  });
};

export const removeReaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const postId = req.params.id!;
  const type = req.params.type as (typeof REACTION_TYPES)[number];

  if (!REACTION_TYPES.includes(type)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REACTION_TYPE',
        message: '유효하지 않은 리액션 타입입니다.',
      },
    });
    return;
  }

  await reactionService.removeReaction(userId, postId, type);

  res.json({
    success: true,
    data: { removed: true },
  });
};
