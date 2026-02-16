import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/index.js';
import * as commentService from '../services/comment.service.js';
import { PREDEFINED_COMMENTS } from '@evil-spirit/shared';

const getCommentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

const createCommentSchema = z.object({
  content: z.string().max(200, '댓글은 최대 200자까지 가능합니다.'),
  isPredefined: z.boolean().default(false),
});

export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const postId = req.params.id!;
  const { page, limit } = getCommentsSchema.parse(req.query);

  const result = await commentService.getComments(userId, postId, page, limit);

  res.json({
    success: true,
    data: result.comments,
    meta: {
      page,
      limit,
      total: result.total,
      hasMore: result.hasMore,
    },
  });
};

export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const postId = req.params.id!;
  const { content, isPredefined } = createCommentSchema.parse(req.body);

  // Validate predefined comment
  if (isPredefined && !PREDEFINED_COMMENTS.includes(content as any)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_PREDEFINED_COMMENT',
        message: '유효하지 않은 정형 응답입니다.',
      },
    });
    return;
  }

  const result = await commentService.createComment(userId, postId, content, isPredefined);

  res.status(201).json({
    success: true,
    data: result,
  });
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const postId = req.params.postId!;
  const commentId = req.params.commentId!;

  await commentService.deleteComment(userId, postId, commentId);

  res.json({
    success: true,
    data: { deleted: true },
  });
};
