import { Router } from 'express';
import { authenticate, asyncHandler } from '../middlewares/index.js';
import * as commentController from '../controllers/comment.controller.js';

const router = Router();

// GET /api/posts/:id/comments - 댓글 목록
router.get('/:id/comments', authenticate, asyncHandler(commentController.getComments));

// POST /api/posts/:id/comments - 댓글 작성
router.post('/:id/comments', authenticate, asyncHandler(commentController.createComment));

// DELETE /api/posts/:postId/comments/:commentId - 댓글 삭제 (본인)
router.delete(
  '/:postId/comments/:commentId',
  authenticate,
  asyncHandler(commentController.deleteComment)
);

export default router;
