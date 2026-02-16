import { Router } from 'express';
import { authenticate, asyncHandler } from '../middlewares/index.js';
import * as blockController from '../controllers/block.controller.js';

const router = Router();

// POST /api/blocks - 블락
router.post('/', authenticate, asyncHandler(blockController.createBlock));

// DELETE /api/blocks/:blockedId - 블락 해제
router.delete('/:blockedId', authenticate, asyncHandler(blockController.removeBlock));

// GET /api/blocks - 내 블락 목록
router.get('/', authenticate, asyncHandler(blockController.getMyBlocks));

export default router;
