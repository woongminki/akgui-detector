import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/index.js';
import * as reportService from '../services/report.service.js';
import type { ReportReason, ReportTargetType } from '@evil-spirit/shared';

const createReportSchema = z.object({
  targetType: z.enum(['post', 'comment']),
  targetId: z.string().min(1, '대상 ID가 필요합니다.'),
  reason: z.enum(['harassment', 'spam', 'privacy_violation', 'inappropriate', 'other']),
  description: z.string().max(500).optional(),
});

export const createReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const parsed = createReportSchema.parse(req.body);

  const data = {
    targetType: parsed.targetType as ReportTargetType,
    targetId: parsed.targetId,
    reason: parsed.reason as ReportReason,
    description: parsed.description,
  };

  const result = await reportService.createReport(userId, data);

  res.status(201).json({
    success: true,
    data: result,
  });
};
