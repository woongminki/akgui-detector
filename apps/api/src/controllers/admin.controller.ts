import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/index.js';
import * as adminService from '../services/admin.service.js';

const getReportsSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'resolved', 'dismissed']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const processReportSchema = z.object({
  action: z.enum(['blind', 'delete', 'warn', 'restrict', 'none']),
  restrictDays: z.number().int().positive().optional(),
});

const restrictUserSchema = z.object({
  days: z.number().int().positive().min(1).max(365),
  reason: z.string().max(500).optional(),
});

const getAuditLogsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  action: z.string().optional(),
  adminId: z.string().optional(),
});

export const getReports = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, page, limit } = getReportsSchema.parse(req.query);

  const result = await adminService.getReports({ status, page, limit });

  res.json({
    success: true,
    data: result.reports,
    meta: {
      page,
      limit,
      total: result.total,
      hasMore: result.hasMore,
    },
  });
};

export const processReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const adminId = req.userId!;
  const reportId = req.params.id!;
  const { action, restrictDays } = processReportSchema.parse(req.body);

  const result = await adminService.processReport(adminId, reportId, action, restrictDays);

  res.json({
    success: true,
    data: result,
  });
};

export const getUserViolations = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.params.id!;

  const result = await adminService.getUserViolations(userId);

  res.json({
    success: true,
    data: result,
  });
};

export const restrictUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const adminId = req.userId!;
  const userId = req.params.id!;
  const { days, reason } = restrictUserSchema.parse(req.body);

  const result = await adminService.restrictUser(adminId, userId, days, reason);

  res.json({
    success: true,
    data: result,
  });
};

export const unrestrictUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const adminId = req.userId!;
  const userId = req.params.id!;

  const result = await adminService.unrestrictUser(adminId, userId);

  res.json({
    success: true,
    data: result,
  });
};

export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page, limit, action, adminId } = getAuditLogsSchema.parse(req.query);

  const result = await adminService.getAuditLogs({ page, limit, action, adminId });

  res.json({
    success: true,
    data: result.logs,
    meta: {
      page,
      limit,
      total: result.total,
      hasMore: result.hasMore,
    },
  });
};
