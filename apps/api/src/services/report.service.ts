import { Report, Post, Comment } from '../models/index.js';
import { AppError } from '../middlewares/index.js';
import type { ReportReason, ReportTargetType } from '@evil-spirit/shared';

interface CreateReportData {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
}

export const createReport = async (userId: string, data: CreateReportData) => {
  // Verify target exists
  if (data.targetType === 'post') {
    const post = await Post.findById(data.targetId);
    if (!post) {
      throw new AppError('신고 대상을 찾을 수 없습니다.', 404, 'TARGET_NOT_FOUND');
    }
  } else if (data.targetType === 'comment') {
    const comment = await Comment.findById(data.targetId);
    if (!comment) {
      throw new AppError('신고 대상을 찾을 수 없습니다.', 404, 'TARGET_NOT_FOUND');
    }
  }

  // Check for duplicate report
  const existing = await Report.findOne({
    reporterId: userId,
    targetType: data.targetType,
    targetId: data.targetId,
    status: { $in: ['pending', 'reviewed'] },
  });

  if (existing) {
    throw new AppError('이미 신고한 대상입니다.', 409, 'ALREADY_REPORTED');
  }

  const report = await Report.create({
    reporterId: userId,
    targetType: data.targetType,
    targetId: data.targetId,
    reason: data.reason,
    description: data.description,
  });

  return report.toJSON();
};

export const getReportsByTarget = async (
  targetType: ReportTargetType,
  targetId: string
) => {
  const reports = await Report.find({ targetType, targetId }).sort({ createdAt: -1 });
  return reports.map((r) => r.toJSON());
};
