import { Post, Aggregate } from '../models/index.js';
import type { IDashboardData, PostTag } from '@evil-spirit/shared';
import { POST_TAGS } from '@evil-spirit/shared';

const getPeriodStartDate = (period: '7d' | '30d' | 'all'): Date | null => {
  if (period === 'all') return null;

  const now = new Date();
  const days = period === '7d' ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
};

export const getDashboardData = async (
  groupId: string,
  period: '7d' | '30d' | 'all'
): Promise<IDashboardData> => {
  const startDate = getPeriodStartDate(period);

  const dateQuery = startDate ? { createdAt: { $gte: startDate } } : {};

  const query = {
    groupId,
    isBlinded: false,
    ...dateQuery,
  };

  // Get posts
  const posts = await Post.find(query).select('content tags detectionScore createdAt matchedPatterns');

  if (posts.length === 0) {
    return {
      keywords: [],
      trends: [],
      tagDistribution: POST_TAGS.reduce((acc, tag) => ({ ...acc, [tag]: 0 }), {} as Record<PostTag, number>),
      totalPosts: 0,
      avgScore: 0,
      period,
    };
  }

  // Calculate tag distribution
  const tagDistribution: Record<PostTag, number> = POST_TAGS.reduce(
    (acc, tag) => ({ ...acc, [tag]: 0 }),
    {} as Record<PostTag, number>
  );

  for (const post of posts) {
    for (const tag of post.tags) {
      tagDistribution[tag as PostTag]++;
    }
  }

  // Extract keywords from matched patterns
  const keywordCounts: Record<string, number> = {};
  for (const post of posts) {
    for (const mp of post.matchedPatterns) {
      const keyword = mp.pattern.slice(0, 20); // Truncate long patterns
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    }
  }

  const keywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword, count]) => ({ keyword, count }));

  // Calculate trends (daily averages)
  const trendMap: Record<string, { totalScore: number; count: number }> = {};
  for (const post of posts) {
    const dateKey = post.createdAt.toISOString().split('T')[0];
    if (!trendMap[dateKey]) {
      trendMap[dateKey] = { totalScore: 0, count: 0 };
    }
    trendMap[dateKey].totalScore += post.detectionScore;
    trendMap[dateKey].count++;
  }

  const trends = Object.entries(trendMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, data]) => ({
      date,
      avgScore: Math.round((data.totalScore / data.count) * 10) / 10,
      postCount: data.count,
    }));

  // Calculate overall average
  const totalScore = posts.reduce((sum, p) => sum + p.detectionScore, 0);
  const avgScore = Math.round((totalScore / posts.length) * 10) / 10;

  return {
    keywords,
    trends,
    tagDistribution,
    totalPosts: posts.length,
    avgScore,
    period,
  };
};

export const getGlobalTrendingKeywords = async (limit: number = 4) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7); // Last 7 days

  const posts = await Post.find({
    isBlinded: false,
    createdAt: { $gte: startDate },
  }).select('matchedPatterns');

  // Extract keywords from matched patterns
  const keywordCounts: Record<string, number> = {};
  for (const post of posts) {
    for (const mp of post.matchedPatterns) {
      const keyword = mp.pattern.slice(0, 20);
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    }
  }

  const keywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([keyword, count], index) => ({
      rank: index + 1,
      keyword,
      count,
      trend: 'same' as const, // Could implement actual trend calculation later
    }));

  return keywords;
};

export const updateAggregates = async (groupId: string) => {
  // This would be called by a cron job or after post creation
  for (const period of ['7d', '30d', 'all'] as const) {
    const data = await getDashboardData(groupId, period);

    // Update or create aggregate documents
    await Aggregate.findOneAndUpdate(
      { groupId, type: 'keyword', period },
      {
        data: new Map(data.keywords.map((k) => [k.keyword, k.count])),
        totalPosts: data.totalPosts,
        calculatedAt: new Date(),
      },
      { upsert: true }
    );

    await Aggregate.findOneAndUpdate(
      { groupId, type: 'tag', period },
      {
        data: new Map(Object.entries(data.tagDistribution)),
        totalPosts: data.totalPosts,
        calculatedAt: new Date(),
      },
      { upsert: true }
    );
  }
};
