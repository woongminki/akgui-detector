import { Reaction, Post, GroupMembership } from '../models/index.js';
import { AppError } from '../middlewares/index.js';
import type { ReactionType } from '@evil-spirit/shared';

export const addReaction = async (
  userId: string,
  postId: string,
  type: ReactionType
) => {
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

  // Remove existing reaction if any (single reaction per user)
  const existingReaction = await Reaction.findOneAndDelete({ postId, userId });
  if (existingReaction) {
    await Post.findByIdAndUpdate(postId, {
      $inc: { [`reactionCounts.${existingReaction.type}`]: -1 },
    });
  }

  // Add new reaction
  await Reaction.create({ postId, userId, type });

  // Update reaction count
  await Post.findByIdAndUpdate(postId, {
    $inc: { [`reactionCounts.${type}`]: 1 },
  });

  // Get updated reaction counts
  const updatedPost = await Post.findById(postId);

  return {
    reactionCounts: updatedPost?.reactionCounts,
  };
};

export const removeReaction = async (
  userId: string,
  postId: string,
  type: ReactionType
) => {
  const reaction = await Reaction.findOneAndDelete({ postId, userId, type });

  if (!reaction) {
    throw new AppError('리액션을 찾을 수 없습니다.', 404, 'REACTION_NOT_FOUND');
  }

  // Update reaction count
  await Post.findByIdAndUpdate(postId, {
    $inc: { [`reactionCounts.${type}`]: -1 },
  });
};

export const getUserReactions = async (userId: string, postId: string) => {
  const reactions = await Reaction.find({ postId, userId });
  return reactions.map((r) => r.type);
};
