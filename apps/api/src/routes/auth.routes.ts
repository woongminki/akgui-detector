import { Router } from 'express';
import { asyncHandler } from '../middlewares/index.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

// POST /api/auth/kakao - 카카오 로그인
router.post('/kakao', asyncHandler(authController.kakaoLogin));

// POST /api/auth/google - 구글 로그인
router.post('/google', asyncHandler(authController.googleLogin));

// POST /api/auth/refresh - 토큰 갱신
router.post('/refresh', asyncHandler(authController.refreshToken));

export default router;
