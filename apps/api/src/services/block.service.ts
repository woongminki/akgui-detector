import { Block, User } from '../models/index.js';
import { AppError } from '../middlewares/index.js';

export const createBlock = async (userId: string, blockedId: string) => {
  if (userId === blockedId) {
    throw new AppError('자신을 차단할 수 없습니다.', 400, 'CANNOT_BLOCK_SELF');
  }

  // Verify target user exists
  const targetUser = await User.findById(blockedId);
  if (!targetUser) {
    throw new AppError('사용자를 찾을 수 없습니다.', 404, 'USER_NOT_FOUND');
  }

  try {
    const block = await Block.create({ blockerId: userId, blockedId });
    return block.toJSON();
  } catch (error: any) {
    if (error.code === 11000) {
      throw new AppError('이미 차단한 사용자입니다.', 409, 'ALREADY_BLOCKED');
    }
    throw error;
  }
};

export const removeBlock = async (userId: string, blockedId: string) => {
  const result = await Block.findOneAndDelete({ blockerId: userId, blockedId });

  if (!result) {
    throw new AppError('차단 내역을 찾을 수 없습니다.', 404, 'BLOCK_NOT_FOUND');
  }
};

export const getUserBlocks = async (userId: string) => {
  const blocks = await Block.find({ blockerId: userId }).sort({ createdAt: -1 });

  // Get blocked user info
  const blockedIds = blocks.map((b) => b.blockedId);
  const users = await User.find({ _id: { $in: blockedIds } }).select('_id nickname');
  const userMap = new Map(users.map((u) => [u._id.toString(), u.nickname]));

  return blocks.map((b) => ({
    id: b._id.toString(),
    blockedId: b.blockedId.toString(),
    blockedNickname: userMap.get(b.blockedId.toString()) || '알 수 없음',
    createdAt: b.createdAt,
  }));
};

export const isBlocked = async (blockerId: string, blockedId: string) => {
  const block = await Block.findOne({ blockerId, blockedId });
  return !!block;
};
