import { Post, RegionGroup, GroupMembership, Bookmark, Block } from '../models/index.js';
import { AppError } from '../middlewares/index.js';
import type { PostTag, EmotionTag } from '@evil-spirit/shared';
import * as safetyFilterService from './safety-filter.service.js';
import * as detectionService from './detection.service.js';

interface CreatePostData {
  groupId: string;
  content: string;
  tags: PostTag[];
  emotionTag: EmotionTag;
  idempotencyKey: string;
}

export const createPost = async (userId: string, data: CreatePostData) => {
  // Check group membership
  const membership = await GroupMembership.findOne({
    userId,
    groupId: data.groupId,
  });

  if (!membership) {
    throw new AppError('그룹에 속해 있지 않습니다.', 403, 'NOT_MEMBER');
  }

  // Check idempotency
  const existingPost = await Post.findOne({
    authorId: userId,
    idempotencyKey: data.idempotencyKey,
  });

  if (existingPost) {
    return existingPost.toJSON();
  }

  // Run safety filter
  const safetyResult = await safetyFilterService.filterContent(data.content, 'post');

  if (safetyResult.blocked) {
    throw new AppError(
      `글을 작성할 수 없습니다: ${safetyResult.reason}`,
      400,
      'CONTENT_BLOCKED'
    );
  }

  // Run detection engine
  const detectionResult = detectionService.analyze(data.content);

  // Create post
  const post = await Post.create({
    groupId: data.groupId,
    authorId: userId,
    content: data.content,
    tags: data.tags,
    emotionTag: data.emotionTag,
    detectionScore: detectionResult.score,
    detectionLevel: detectionResult.level,
    matchedPatterns: detectionResult.matchedPatterns,
    idempotencyKey: data.idempotencyKey,
  });

  // Update group post count
  await RegionGroup.findByIdAndUpdate(data.groupId, { $inc: { postCount: 1 } });

  // Update membership last active
  membership.lastActiveAt = new Date();
  await membership.save();

  const result = post.toJSON();

  return {
    ...result,
    safetyWarnings: safetyResult.warnings,
  };
};

export const getPost = async (userId: string, postId: string) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError('글을 찾을 수 없습니다.', 404, 'POST_NOT_FOUND');
  }

  if (post.isBlinded) {
    throw new AppError('블라인드 처리된 글입니다.', 403, 'POST_BLINDED');
  }

  // Check group membership
  const membership = await GroupMembership.findOne({
    userId,
    groupId: post.groupId,
  });

  if (!membership) {
    throw new AppError('그룹에 속해 있지 않습니다.', 403, 'NOT_MEMBER');
  }

  // Check if blocked
  const isBlocked = await Block.findOne({
    blockerId: userId,
    blockedId: post.authorId,
  });

  if (isBlocked) {
    throw new AppError('차단한 사용자의 글입니다.', 403, 'BLOCKED_USER');
  }

  // Increment view count
  await Post.findByIdAndUpdate(postId, { $inc: { viewCount: 1 } });

  // Check if bookmarked
  const bookmark = await Bookmark.findOne({ userId, postId });

  // Check if own post
  const isOwner = post.authorId.toString() === userId;

  return {
    ...post.toJSON(),
    isBookmarked: !!bookmark,
    isOwner,
  };
};

export const deletePost = async (userId: string, postId: string) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError('글을 찾을 수 없습니다.', 404, 'POST_NOT_FOUND');
  }

  if (post.authorId.toString() !== userId) {
    throw new AppError('본인의 글만 삭제할 수 있습니다.', 403, 'NOT_OWNER');
  }

  await Post.findByIdAndDelete(postId);

  // Update group post count
  await RegionGroup.findByIdAndUpdate(post.groupId, { $inc: { postCount: -1 } });

  // Delete related bookmarks
  await Bookmark.deleteMany({ postId });
};

export const addBookmark = async (userId: string, postId: string) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError('글을 찾을 수 없습니다.', 404, 'POST_NOT_FOUND');
  }

  // Check group membership
  const membership = await GroupMembership.findOne({
    userId,
    groupId: post.groupId,
  });

  if (!membership) {
    throw new AppError('그룹에 속해 있지 않습니다.', 403, 'NOT_MEMBER');
  }

  try {
    await Bookmark.create({ userId, postId });
  } catch (error: any) {
    if (error.code === 11000) {
      // Already bookmarked, ignore
      return;
    }
    throw error;
  }
};

export const removeBookmark = async (userId: string, postId: string) => {
  await Bookmark.findOneAndDelete({ userId, postId });
};
