import jwt from 'jsonwebtoken';
import axios from 'axios';
import { User } from '../models/index.js';
import { AppError } from '../middlewares/index.js';
import { generateRandomNickname } from '../utils/nickname.js';

interface OAuthUserInfo {
  email: string;
  providerId: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const generateTokens = (userId: string): TokenPair => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as jwt.SignOptions['expiresIn'] }
  );

  return { accessToken, refreshToken };
};

const getKakaoUserInfo = async (code: string): Promise<OAuthUserInfo> => {
  // Exchange code for tokens
  let tokenResponse;
  try {
    tokenResponse = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_CLIENT_ID || '',
        redirect_uri: process.env.KAKAO_REDIRECT_URI || '',
        code,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
  } catch (error: any) {
    console.error('Kakao token exchange error:', error.response?.data || error.message);
    throw error;
  }

  const { access_token } = tokenResponse.data;

  // Get user info
  const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  const { id, kakao_account } = userResponse.data;

  return {
    email: kakao_account?.email || `kakao_${id}@placeholder.com`,
    providerId: String(id),
  };
};

const getGoogleUserInfo = async (code: string): Promise<OAuthUserInfo> => {
  // Exchange code for tokens
  const tokenResponse = await axios.post(
    'https://oauth2.googleapis.com/token',
    {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }
  );

  const { access_token } = tokenResponse.data;

  // Get user info
  const userResponse = await axios.get(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  const { id, email } = userResponse.data;

  return {
    email: email || `google_${id}@placeholder.com`,
    providerId: String(id),
  };
};

export const kakaoLogin = async (code: string) => {
  const userInfo = await getKakaoUserInfo(code);

  let user = await User.findOne({
    provider: 'kakao',
    providerId: userInfo.providerId,
  });

  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    const nickname = await generateRandomNickname();

    user = await User.create({
      email: userInfo.email,
      provider: 'kakao',
      providerId: userInfo.providerId,
      nickname,
    });
  }

  const tokens = generateTokens(user._id.toString());

  return {
    user: {
      id: user._id.toString(),
      nickname: user.nickname,
      role: user.role,
    },
    tokens,
    isNewUser,
  };
};

export const googleLogin = async (code: string) => {
  const userInfo = await getGoogleUserInfo(code);

  let user = await User.findOne({
    provider: 'google',
    providerId: userInfo.providerId,
  });

  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    const nickname = await generateRandomNickname();

    user = await User.create({
      email: userInfo.email,
      provider: 'google',
      providerId: userInfo.providerId,
      nickname,
    });
  }

  const tokens = generateTokens(user._id.toString());

  return {
    user: {
      id: user._id.toString(),
      nickname: user.nickname,
      role: user.role,
    },
    tokens,
    isNewUser,
  };
};

export const refreshToken = async (refreshTokenStr: string) => {
  try {
    const decoded = jwt.verify(
      refreshTokenStr,
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
    ) as { userId: string; type: string };

    if (decoded.type !== 'refresh') {
      throw new AppError('유효하지 않은 리프레시 토큰입니다.', 401, 'INVALID_REFRESH_TOKEN');
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AppError('사용자를 찾을 수 없습니다.', 401, 'USER_NOT_FOUND');
    }

    const tokens = generateTokens(user._id.toString());

    return {
      tokens,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('유효하지 않은 리프레시 토큰입니다.', 401, 'INVALID_REFRESH_TOKEN');
  }
};
