import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/index.js';
import * as postService from '../services/post.service.js';
import { POST_TAGS, EMOTION_TAGS } from '@evil-spirit/shared';

const createPostSchema = z.object({
  groupId: z.string().min(1, '그룹 ID가 필요합니다.'),
  content: z
    .string()
    .min(10, '내용은 최소 10자 이상이어야 합니다.')
    .max(1000, '내용은 최대 1000자까지 가능합니다.'),
  tags: z.array(z.enum(POST_TAGS)).min(1, '태그를 1개 이상 선택해주세요.'),
  emotionTag: z.enum(EMOTION_TAGS),
  idempotencyKey: z.string().min(1, 'idempotencyKey가 필요합니다.'),
});

export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const data = createPostSchema.parse(req.body) as {
    groupId: string;
    content: string;
    tags: typeof POST_TAGS[number][];
    emotionTag: typeof EMOTION_TAGS[number];
    idempotencyKey: string;
  };

  const result = await postService.createPost(userId, data);

  res.status(201).json({
    success: true,
    data: result,
  });
};

export const getPost = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const postId = req.params.id!;

  const result = await postService.getPost(userId, postId);

  res.json({
    success: true,
    data: result,
  });
};

export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const postId = req.params.id!;

  await postService.deletePost(userId, postId);

  res.json({
    success: true,
    data: { deleted: true },
  });
};

export const addBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const postId = req.params.id!;

  await postService.addBookmark(userId, postId);

  res.json({
    success: true,
    data: { bookmarked: true },
  });
};

export const removeBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const postId = req.params.id!;

  await postService.removeBookmark(userId, postId);

  res.json({
    success: true,
    data: { bookmarked: false },
  });
};
