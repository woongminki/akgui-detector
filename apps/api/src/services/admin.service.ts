import { Report, Post, Comment, User, AuditLog } from '../models/index.js';
import { AppError } from '../middlewares/index.js';

interface GetReportsOptions {
  status?: string;
  page: number;
  limit: number;
}

interface GetAuditLogsOptions {
  page: number;
  limit: number;
  action?: string;
  adminId?: string;
}

export const getReports = async (options: GetReportsOptions) => {
  const query: any = {};

  if (options.status) {
    query.status = options.status;
  }

  const skip = (options.page - 1) * options.limit;

  const [reports, total] = await Promise.all([
    Report.find(query).sort({ createdAt: -1 }).skip(skip).limit(options.limit + 1),
    Report.countDocuments(query),
  ]);

  const hasMore = reports.length > options.limit;
  if (hasMore) reports.pop();

  return {
    reports: reports.map((r) => r.toJSON()),
    total,
    hasMore,
  };
};

export const processReport = async (
  adminId: string,
  reportId: string,
  action: 'blind' | 'delete' | 'warn' | 'restrict' | 'none',
  restrictDays?: number
) => {
  const report = await Report.findById(reportId);

  if (!report) {
    throw new AppError('신고를 찾을 수 없습니다.', 404, 'REPORT_NOT_FOUND');
  }

  if (report.status !== 'pending') {
    throw new AppError('이미 처리된 신고입니다.', 400, 'ALREADY_PROCESSED');
  }

  // Process action based on target type
  let targetAuthorId: string | undefined;

  if (report.targetType === 'post') {
    const post = await Post.findById(report.targetId);
    if (post) {
      targetAuthorId = post.authorId.toString();

      if (action === 'blind') {
        post.isBlinded = true;
        post.blindedReason = report.reason;
        await post.save();

        await AuditLog.create({
          adminId,
          action: 'blind_post',
          targetType: 'post',
          targetId: report.targetId,
          details: { reason: report.reason, reportId },
        });
      } else if (action === 'delete') {
        await Post.findByIdAndDelete(report.targetId);

        await AuditLog.create({
          adminId,
          action: 'delete_post',
          targetType: 'post',
          targetId: report.targetId,
          details: { reason: report.reason, reportId },
        });
      }
    }
  } else if (report.targetType === 'comment') {
    const comment = await Comment.findById(report.targetId);
    if (comment) {
      targetAuthorId = comment.authorId.toString();

      if (action === 'blind') {
        comment.isBlinded = true;
        comment.blindedReason = report.reason;
        await comment.save();

        await AuditLog.create({
          adminId,
          action: 'blind_comment',
          targetType: 'comment',
          targetId: report.targetId,
          details: { reason: report.reason, reportId },
        });
      } else if (action === 'delete') {
        await Comment.findByIdAndDelete(report.targetId);

        await AuditLog.create({
          adminId,
          action: 'delete_comment',
          targetType: 'comment',
          targetId: report.targetId,
          details: { reason: report.reason, reportId },
        });
      }
    }
  }

  // Restrict user if needed
  if (action === 'restrict' && targetAuthorId && restrictDays) {
    const restrictedUntil = new Date();
    restrictedUntil.setDate(restrictedUntil.getDate() + restrictDays);

    await User.findByIdAndUpdate(targetAuthorId, {
      isRestricted: true,
      restrictedUntil,
    });

    await AuditLog.create({
      adminId,
      action: 'restrict_user',
      targetType: 'user',
      targetId: targetAuthorId,
      details: { days: restrictDays, reportId },
    });
  }

  // Update report status
  report.status = action === 'none' ? 'dismissed' : 'resolved';
  report.reviewedBy = adminId as any;
  report.reviewedAt = new Date();
  report.action = action;
  await report.save();

  return report.toJSON();
};

export const getUserViolations = async (userId: string) => {
  // Get reports where user's content was actioned
  const posts = await Post.find({ authorId: userId, isBlinded: true });
  const comments = await Comment.find({ authorId: userId, isBlinded: true });

  // Get restriction history from audit logs
  const restrictionLogs = await AuditLog.find({
    targetType: 'user',
    targetId: userId,
    action: { $in: ['restrict_user', 'unrestrict_user'] },
  }).sort({ createdAt: -1 });

  return {
    blindedPosts: posts.length,
    blindedComments: comments.length,
    restrictionHistory: restrictionLogs.map((l) => l.toJSON()),
  };
};

export const restrictUser = async (
  adminId: string,
  userId: string,
  days: number,
  reason?: string
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('사용자를 찾을 수 없습니다.', 404, 'USER_NOT_FOUND');
  }

  if (user.role === 'admin') {
    throw new AppError('관리자를 제재할 수 없습니다.', 400, 'CANNOT_RESTRICT_ADMIN');
  }

  const restrictedUntil = new Date();
  restrictedUntil.setDate(restrictedUntil.getDate() + days);

  user.isRestricted = true;
  user.restrictedUntil = restrictedUntil;
  await user.save();

  await AuditLog.create({
    adminId,
    action: 'restrict_user',
    targetType: 'user',
    targetId: userId,
    details: { days, reason },
  });

  return {
    userId,
    isRestricted: true,
    restrictedUntil,
  };
};

export const unrestrictUser = async (adminId: string, userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('사용자를 찾을 수 없습니다.', 404, 'USER_NOT_FOUND');
  }

  user.isRestricted = false;
  user.restrictedUntil = undefined;
  await user.save();

  await AuditLog.create({
    adminId,
    action: 'unrestrict_user',
    targetType: 'user',
    targetId: userId,
  });

  return {
    userId,
    isRestricted: false,
  };
};

export const getAuditLogs = async (options: GetAuditLogsOptions) => {
  const query: any = {};

  if (options.action) {
    query.action = options.action;
  }

  if (options.adminId) {
    query.adminId = options.adminId;
  }

  const skip = (options.page - 1) * options.limit;

  const [logs, total] = await Promise.all([
    AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(options.limit + 1),
    AuditLog.countDocuments(query),
  ]);

  const hasMore = logs.length > options.limit;
  if (hasMore) logs.pop();

  return {
    logs: logs.map((l) => l.toJSON()),
    total,
    hasMore,
  };
};
