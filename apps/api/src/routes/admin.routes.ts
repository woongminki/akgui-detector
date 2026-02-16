import { Router } from 'express';
import { authenticate, requireAdmin, asyncHandler } from '../middlewares/index.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// GET /api/admin/reports - 신고 목록
router.get('/reports', asyncHandler(adminController.getReports));

// PATCH /api/admin/reports/:id - 신고 처리
router.patch('/reports/:id', asyncHandler(adminController.processReport));

// GET /api/admin/users/:id/violations - 사용자 위반 이력
router.get('/users/:id/violations', asyncHandler(adminController.getUserViolations));

// PATCH /api/admin/users/:id/restrict - 사용자 제재
router.patch('/users/:id/restrict', asyncHandler(adminController.restrictUser));

// PATCH /api/admin/users/:id/unrestrict - 사용자 제재 해제
router.patch('/users/:id/unrestrict', asyncHandler(adminController.unrestrictUser));

// GET /api/admin/audit-logs - 감사 로그
router.get('/audit-logs', asyncHandler(adminController.getAuditLogs));

export default router;
