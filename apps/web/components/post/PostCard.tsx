'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { DETECTION_LEVELS, REACTION_LABELS } from '@evil-spirit/shared';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    tags: string[];
    emotionTag: string;
    detectionScore: number;
    detectionLevel: string;
    reactionCounts: Record<string, number>;
    commentCount: number;
    createdAt: string;
  };
}

const getLevelColor = (level: string) => {
  switch (level) {
    case '건강':
      return DETECTION_LEVELS.HEALTHY.color;
    case '보통':
      return DETECTION_LEVELS.NORMAL.color;
    case '위험':
      return DETECTION_LEVELS.DANGER.color;
    case '신고 추천':
      return DETECTION_LEVELS.REPORT.color;
    default:
      return '#888888';
  }
};

export default function PostCard({ post }: PostCardProps) {
  const totalReactions = Object.values(post.reactionCounts || {}).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <Link href={`/post/${post.id}`}>
      <Card className="cursor-pointer transition-colors hover:bg-muted/50">
        <CardContent className="p-4">
          {/* Tags */}
          <div className="mb-2 flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-2 py-0.5 text-xs"
              >
                {tag}
              </span>
            ))}
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
              {post.emotionTag}
            </span>
          </div>

          {/* Content Preview */}
          <p className="mb-3 line-clamp-3 text-sm">{post.content}</p>

          {/* Score Badge */}
          <div className="mb-3 flex items-center gap-2">
            <div
              className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: getLevelColor(post.detectionLevel) }}
            >
              <span>점수: {post.detectionScore}</span>
              <span>·</span>
              <span>{post.detectionLevel}</span>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex gap-3">
              <span>공감 {totalReactions}</span>
              <span>댓글 {post.commentCount}</span>
            </div>
            <span>
              {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
