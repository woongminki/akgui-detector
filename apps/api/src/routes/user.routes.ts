import { Router } from 'express';
import { authenticate, asyncHandler } from '../middlewares/index.js';
import * as userController from '../controllers/user.controller.js';

const router = Router();

// GET /api/users/me - 내 정보 조회
router.get('/me', authenticate, asyncHandler(userController.getMe));

// PATCH /api/users/me/nickname - 닉네임 변경
router.patch('/me/nickname', authenticate, asyncHandler(userController.updateNickname));

// GET /api/users/nickname/check - 닉네임 중복 확인
router.get('/nickname/check', asyncHandler(userController.checkNickname));

export default router;
