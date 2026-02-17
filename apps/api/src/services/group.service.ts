import { nanoid } from 'nanoid';
import { RegionGroup, GroupMembership, Post, Block } from '../models/index.js';
import { AppError } from '../middlewares/index.js';
import { checkForbiddenWords } from '../utils/filter.js';
import { INVITE_TOKEN_LENGTH, INVITE_TOKEN_EXPIRY_DAYS, DASHBOARD_THRESHOLD } from '@evil-spirit/shared';
import * as aggregateService from './aggregate.service.js';

export const createGroup = async (userId: string, label: string) => {
  // Check forbidden words
  const forbiddenCheck = checkForbiddenWords(label);
  if (!forbiddenCheck.isValid) {
    throw new AppError('사용할 수 없는 그룹 이름입니다.', 400, 'FORBIDDEN_GROUP_NAME');
  }

  const inviteToken = nanoid(INVITE_TOKEN_LENGTH);
  const inviteTokenExpiresAt = new Date();
  inviteTokenExpiresAt.setDate(inviteTokenExpiresAt.getDate() + INVITE_TOKEN_EXPIRY_DAYS);

  const group = await RegionGroup.create({
    label,
    creatorId: userId,
    inviteToken,
    inviteTokenExpiresAt,
  });

  // Add creator as member
  await GroupMembership.create({
    userId,
    groupId: group._id,
  });

  return {
    id: group._id.toString(),
    label: group.label,
    inviteToken: group.inviteToken,
    inviteTokenExpiresAt: group.inviteTokenExpiresAt,
    memberCount: group.memberCount,
    postCount: group.postCount,
    createdAt: group.createdAt,
  };
};

export const getUserGroups = async (userId: string) => {
  const memberships = await GroupMembership.find({ userId }).sort({ joinedAt: -1 });
  const groupIds = memberships.map((m) => m.groupId);

  const groups = await RegionGroup.find({ _id: { $in: groupIds } });

  return groups.map((g) => ({
    id: g._id.toString(),
    label: g.label,
    memberCount: g.memberCount,
    postCount: g.postCount,
    createdAt: g.createdAt,
  }));
};

export const getGroup = async (userId: string, groupId: string) => {
  const membership = await GroupMembership.findOne({ userId, groupId });

  if (!membership) {
    throw new AppError('그룹에 속해 있지 않습니다.', 403, 'NOT_MEMBER');
  }

  const group = await RegionGroup.findById(groupId);

  if (!group) {
    throw new AppError('그룹을 찾을 수 없습니다.', 404, 'GROUP_NOT_FOUND');
  }

  const isCreator = group.creatorId.toString() === userId;

  return {
    id: group._id.toString(),
    label: group.label,
    memberCount: group.memberCount,
    postCount: group.postCount,
    createdAt: group.createdAt,
    isCreator,
    inviteToken: isCreator ? group.inviteToken : undefined,
    inviteTokenExpiresAt: isCreator ? group.inviteTokenExpiresAt : undefined,
  };
};

export const joinGroup = async (userId: string, inviteToken: string) => {
  const group = await RegionGroup.findOne({ inviteToken });

  if (!group) {
    throw new AppError('유효하지 않은 초대 링크입니다.', 404, 'INVALID_INVITE');
  }

  if (group.inviteTokenExpiresAt < new Date()) {
    throw new AppError('만료된 초대 링크입니다.', 400, 'INVITE_EXPIRED');
  }

  // Check if already member
  const existing = await GroupMembership.findOne({ userId, groupId: group._id });

  if (existing) {
    return {
      id: group._id.toString(),
      label: group.label,
      alreadyMember: true,
    };
  }

  await GroupMembership.create({
    userId,
    groupId: group._id,
  });

  const updatedGroup = await RegionGroup.findByIdAndUpdate(
    group._id,
    { $inc: { memberCount: 1 } },
    { new: true }
  );

  return {
    id: group._id.toString(),
    label: group.label,
    alreadyMember: false,
    memberCount: updatedGroup?.memberCount || 1,
    postCount: updatedGroup?.postCount || 0,
  };
};

export const verifyInviteToken = async (token: string) => {
  const group = await RegionGroup.findOne({ inviteToken: token });

  if (!group) {
    throw new AppError('유효하지 않은 초대 링크입니다.', 404, 'INVALID_INVITE');
  }

  const isExpired = group.inviteTokenExpiresAt < new Date();

  return {
    valid: !isExpired,
    groupLabel: group.label,
    memberCount: group.memberCount,
    isExpired,
  };
};

export const refreshInviteToken = async (userId: string, groupId: string) => {
  const group = await RegionGroup.findById(groupId);

  if (!group) {
    throw new AppError('그룹을 찾을 수 없습니다.', 404, 'GROUP_NOT_FOUND');
  }

  if (group.creatorId.toString() !== userId) {
    throw new AppError('그룹 생성자만 초대 링크를 재발급할 수 있습니다.', 403, 'NOT_CREATOR');
  }

  const newInviteToken = nanoid(INVITE_TOKEN_LENGTH);
  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + INVITE_TOKEN_EXPIRY_DAYS);

  group.inviteToken = newInviteToken;
  group.inviteTokenExpiresAt = newExpiresAt;
  await group.save();

  return {
    inviteToken: newInviteToken,
    inviteTokenExpiresAt: newExpiresAt,
  };
};

export const getDashboard = async (
  userId: string,
  groupId: string,
  period: '7d' | '30d' | 'all'
) => {
  const membership = await GroupMembership.findOne({ userId, groupId });

  if (!membership) {
    throw new AppError('그룹에 속해 있지 않습니다.', 403, 'NOT_MEMBER');
  }

  const group = await RegionGroup.findById(groupId);

  if (!group) {
    throw new AppError('그룹을 찾을 수 없습니다.', 404, 'GROUP_NOT_FOUND');
  }

  // Check threshold
  if (group.postCount < DASHBOARD_THRESHOLD) {
    return {
      insufficient: true,
      threshold: DASHBOARD_THRESHOLD,
      currentCount: group.postCount,
      totalPosts: group.postCount,
      avgScore: 0,
      message: `대시보드를 표시하려면 최소 ${DASHBOARD_THRESHOLD}개의 글이 필요합니다.`,
    };
  }

  // Get aggregated data
  const dashboardData = await aggregateService.getDashboardData(groupId, period);

  return dashboardData;
};

export const getGroupPosts = async (
  userId: string,
  groupId: string,
  options: {
    page: number;
    limit: number;
    tags?: string[];
    scoreMin?: number;
    scoreMax?: number;
  }
) => {
  const membership = await GroupMembership.findOne({ userId, groupId });

  if (!membership) {
    throw new AppError('그룹에 속해 있지 않습니다.', 403, 'NOT_MEMBER');
  }

  // Get blocked users
  const blocks = await Block.find({ blockerId: userId });
  const blockedUserIds = blocks.map((b) => b.blockedId);

  // Build query
  const query: any = {
    groupId,
    isBlinded: false,
    authorId: { $nin: blockedUserIds },
  };

  if (options.tags?.length) {
    query.tags = { $in: options.tags };
  }

  if (options.scoreMin !== undefined || options.scoreMax !== undefined) {
    query.detectionScore = {};
    if (options.scoreMin !== undefined) {
      query.detectionScore.$gte = options.scoreMin;
    }
    if (options.scoreMax !== undefined) {
      query.detectionScore.$lte = options.scoreMax;
    }
  }

  const skip = (options.page - 1) * options.limit;

  const [posts, total] = await Promise.all([
    Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit + 1),
    Post.countDocuments(query),
  ]);

  const hasMore = posts.length > options.limit;
  if (hasMore) posts.pop();

  return {
    posts: posts.map((p) => p.toJSON()),
    total,
    hasMore,
  };
};
