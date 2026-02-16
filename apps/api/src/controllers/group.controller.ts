import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/index.js';
import * as groupService from '../services/group.service.js';

const createGroupSchema = z.object({
  label: z
    .string()
    .min(2, '그룹 이름은 최소 2자 이상이어야 합니다.')
    .max(20, '그룹 이름은 최대 20자까지 가능합니다.'),
});

const joinGroupSchema = z.object({
  inviteToken: z.string().min(1, '초대 토큰이 필요합니다.'),
});

const getGroupPostsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  tags: z.string().optional(),
  scoreMin: z.coerce.number().int().min(1).max(10).optional(),
  scoreMax: z.coerce.number().int().min(1).max(10).optional(),
});

const getDashboardSchema = z.object({
  period: z.enum(['7d', '30d', 'all']).default('7d'),
});

export const createGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { label } = createGroupSchema.parse(req.body);

  const result = await groupService.createGroup(userId, label);

  res.status(201).json({
    success: true,
    data: result,
  });
};

export const getMyGroups = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  const result = await groupService.getUserGroups(userId);

  res.json({
    success: true,
    data: result,
  });
};

export const getGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const groupId = req.params.id!;

  const result = await groupService.getGroup(userId, groupId);

  res.json({
    success: true,
    data: result,
  });
};

export const joinGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { inviteToken } = joinGroupSchema.parse(req.body);

  const result = await groupService.joinGroup(userId, inviteToken);

  res.json({
    success: true,
    data: result,
  });
};

export const verifyInviteToken = async (req: Request, res: Response): Promise<void> => {
  const token = req.params.token!;

  const result = await groupService.verifyInviteToken(token);

  res.json({
    success: true,
    data: result,
  });
};

export const refreshInviteToken = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const groupId = req.params.id!;

  const result = await groupService.refreshInviteToken(userId, groupId);

  res.json({
    success: true,
    data: result,
  });
};

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const groupId = req.params.id!;
  const { period } = getDashboardSchema.parse(req.query);

  const result = await groupService.getDashboard(userId, groupId, period);

  res.json({
    success: true,
    data: result,
  });
};

export const getGroupPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const groupId = req.params.id!;
  const { page, limit, tags, scoreMin, scoreMax } = getGroupPostsSchema.parse(req.query);

  const result = await groupService.getGroupPosts(userId, groupId, {
    page,
    limit,
    tags: tags?.split(','),
    scoreMin,
    scoreMax,
  });

  res.json({
    success: true,
    data: result.posts,
    meta: {
      page,
      limit,
      total: result.total,
      hasMore: result.hasMore,
    },
  });
};
