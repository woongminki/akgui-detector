import { Router } from 'express';
import { authenticate, asyncHandler } from '../middlewares/index.js';
import * as reactionController from '../controllers/reaction.controller.js';

const router = Router();

// POST /api/posts/:id/reactions - 리액션 추가
router.post('/:id/reactions', authenticate, asyncHandler(reactionController.addReaction));

// DELETE /api/posts/:id/reactions/:type - 리액션 취소
router.delete('/:id/reactions/:type', authenticate, asyncHandler(reactionController.removeReaction));

export default router;
