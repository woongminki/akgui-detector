import { Router } from 'express';
import { authenticate, asyncHandler } from '../middlewares/index.js';
import * as postController from '../controllers/post.controller.js';

const router = Router();

// POST /api/posts - 글 작성
router.post('/', authenticate, asyncHandler(postController.createPost));

// GET /api/posts/:id - 글 상세
router.get('/:id', authenticate, asyncHandler(postController.getPost));

// DELETE /api/posts/:id - 글 삭제 (본인)
router.delete('/:id', authenticate, asyncHandler(postController.deletePost));

// POST /api/posts/:id/bookmark - 북마크 추가
router.post('/:id/bookmark', authenticate, asyncHandler(postController.addBookmark));

// DELETE /api/posts/:id/bookmark - 북마크 제거
router.delete('/:id/bookmark', authenticate, asyncHandler(postController.removeBookmark));

export default router;
