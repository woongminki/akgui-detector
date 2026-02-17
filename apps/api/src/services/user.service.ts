import { User } from '../models/index.js';
import { AppError } from '../middlewares/index.js';
import { checkForbiddenWords } from '../utils/filter.js';

const NICKNAME_CHANGE_COOLDOWN_DAYS = 30;

export const updateNickname = async (userId: string, newNickname: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('사용자를 찾을 수 없습니다.', 404, 'USER_NOT_FOUND');
  }

  // Check cooldown
  if (user.nicknameChangedAt) {
    const daysSinceLastChange = Math.floor(
      (Date.now() - user.nicknameChangedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastChange < NICKNAME_CHANGE_COOLDOWN_DAYS) {
      const remainingDays = NICKNAME_CHANGE_COOLDOWN_DAYS - daysSinceLastChange;
      throw new AppError(
        `닉네임은 ${remainingDays}일 후에 변경할 수 있습니다.`,
        400,
        'NICKNAME_COOLDOWN'
      );
    }
  }

  // Check forbidden words
  const forbiddenCheck = checkForbiddenWords(newNickname);
  if (!forbiddenCheck.isValid) {
    throw new AppError('사용할 수 없는 닉네임입니다.', 400, 'FORBIDDEN_NICKNAME');
  }

  // Check uniqueness
  const existing = await User.findOne({
    nickname: newNickname,
    _id: { $ne: userId },
  });

  if (existing) {
    throw new AppError('이미 사용 중인 닉네임입니다.', 409, 'NICKNAME_TAKEN');
  }

  user.nickname = newNickname;
  user.nicknameChangedAt = new Date();
  await user.save();

  return {
    nickname: user.nickname,
    nicknameChangedAt: user.nicknameChangedAt,
  };
};

export const checkNickname = async (nickname: string, userId?: string) => {
  // Check forbidden words
  const forbiddenCheck = checkForbiddenWords(nickname);
  if (!forbiddenCheck.isValid) {
    return {
      available: false,
      reason: 'FORBIDDEN',
    };
  }

  // Check uniqueness (exclude current user if provided)
  const query: { nickname: string; _id?: { $ne: string } } = { nickname };
  if (userId) {
    query._id = { $ne: userId };
  }
  const existing = await User.findOne(query);

  return {
    available: !existing,
    reason: existing ? 'TAKEN' : null,
  };
};
