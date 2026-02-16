import { Router } from 'express';
import { authenticate, asyncHandler } from '../middlewares/index.js';
import * as groupController from '../controllers/group.controller.js';

const router = Router();

// POST /api/groups - 그룹 생성
router.post('/', authenticate, asyncHandler(groupController.createGroup));

// GET /api/groups - 내 그룹 목록
router.get('/', authenticate, asyncHandler(groupController.getMyGroups));

// GET /api/groups/:id - 그룹 상세
router.get('/:id', authenticate, asyncHandler(groupController.getGroup));

// POST /api/groups/join - 초대 링크로 참여
router.post('/join', authenticate, asyncHandler(groupController.joinGroup));

// GET /api/groups/invite/:token - 초대 토큰 검증
router.get('/invite/:token', asyncHandler(groupController.verifyInviteToken));

// POST /api/groups/:id/invite/refresh - 초대 링크 재발급
router.post('/:id/invite/refresh', authenticate, asyncHandler(groupController.refreshInviteToken));

// GET /api/groups/:id/dashboard - 대시보드 데이터
router.get('/:id/dashboard', authenticate, asyncHandler(groupController.getDashboard));

// GET /api/groups/:id/posts - 그룹 피드
router.get('/:id/posts', authenticate, asyncHandler(groupController.getGroupPosts));

export default router;
