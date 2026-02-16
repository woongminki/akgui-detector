import { Router } from 'express';
import { authenticate, asyncHandler } from '../middlewares/index.js';
import * as reportController from '../controllers/report.controller.js';

const router = Router();

// POST /api/reports - 신고
router.post('/', authenticate, asyncHandler(reportController.createReport));

export default router;
