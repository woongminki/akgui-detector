import { Comment, Post, GroupMembership, Block, User } from '../models/index.js';
import { AppError } from '../middlewares/index.js';
import * as safetyFilterService from './safety-filter.service.js';

export const getComments = async (
  userId: string,
  postId: string,
  page: number,
  limit: number
) => {
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

  // Get blocked users
  const blocks = await Block.find({ blockerId: userId });
  const blockedUserIds = blocks.map((b) => b.blockedId);

  const query = {
    postId,
    isBlinded: false,
    authorId: { $nin: blockedUserIds },
  };

  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    Comment.find(query).sort({ createdAt: 1 }).skip(skip).limit(limit + 1),
    Comment.countDocuments(query),
  ]);

  const hasMore = comments.length > limit;
  if (hasMore) comments.pop();

  // Get author nicknames (maintaining anonymity via nickname only)
  const authorIds = [...new Set(comments.map((c) => c.authorId.toString()))];
  const authors = await User.find({ _id: { $in: authorIds } }).select('_id nickname');
  const authorMap = new Map(authors.map((a) => [a._id.toString(), a.nickname]));

  const commentsWithAuthor = comments.map((c) => {
    const json = c.toJSON();
    return {
      ...json,
      authorNickname: authorMap.get(c.authorId.toString()) || '알 수 없음',
      isOwner: c.authorId.toString() === userId,
    };
  });

  return {
    comments: commentsWithAuthor,
    total,
    hasMore,
  };
};

export const createComment = async (
  userId: string,
  postId: string,
  content: string,
  isPredefined: boolean
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

  // Run safety filter for non-predefined comments
  if (!isPredefined) {
    const safetyResult = await safetyFilterService.filterContent(content, 'comment');

    if (safetyResult.blocked) {
      throw new AppError(
        `댓글을 작성할 수 없습니다: ${safetyResult.reason}`,
        400,
        'CONTENT_BLOCKED'
      );
    }
  }

  const comment = await Comment.create({
    postId,
    authorId: userId,
    content,
    isPredefined,
  });

  // Update post comment count
  await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

  // Get author nickname
  const author = await User.findById(userId).select('nickname');

  return {
    ...comment.toJSON(),
    authorNickname: author?.nickname || '알 수 없음',
    isOwner: true,
  };
};

export const deleteComment = async (
  userId: string,
  postId: string,
  commentId: string
) => {
  const comment = await Comment.findOne({ _id: commentId, postId });

  if (!comment) {
    throw new AppError('댓글을 찾을 수 없습니다.', 404, 'COMMENT_NOT_FOUND');
  }

  if (comment.authorId.toString() !== userId) {
    throw new AppError('본인의 댓글만 삭제할 수 있습니다.', 403, 'NOT_OWNER');
  }

  await Comment.findByIdAndDelete(commentId);

  // Update post comment count
  await Post.findByIdAndUpdate(postId, { $inc: { commentCount: -1 } });
};
