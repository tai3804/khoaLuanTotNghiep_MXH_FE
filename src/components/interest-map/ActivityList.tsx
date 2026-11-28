import React, { useMemo } from 'react';
import { MessageCircle, Search, Share2, ThumbsUp } from 'lucide-react';
import { InterestAction, InterestMap } from '../../services/interestMapService';
import { ACTION_TEXT } from './colors';
import { ACTION_LABEL, timeAgo } from './labels';
import { Card, CardTitle, EmptyNote } from './ui';

const ICON: Record<InterestAction, React.ReactNode> = {
  REACTION: <ThumbsUp className="w-3.5 h-3.5" />,
  COMMENT: <MessageCircle className="w-3.5 h-3.5" />,
  SHARE: <Share2 className="w-3.5 h-3.5" />,
  SEARCH: <Search className="w-3.5 h-3.5" />,
};

/** Các tương tác gần nhất (kể cả tìm kiếm) và quãng vector sở thích dịch chuyển sau mỗi tương tác, mới nhất trước */
export const ActivityList: React.FC<{ data: InterestMap }> = ({ data }) => {
  const snippetById = useMemo(() => {
    const m = new Map<string, string>();
    data.posts.forEach((p) => m.set(p.id, p.snippet));
    data.interacted.forEach((p) => m.set(p.id, p.snippet));
    return m;
  }, [data]);
  const steps = [...data.trail].reverse();

  return (
    <Card className="space-y-3">
      <CardTitle title="Các tương tác đã làm vector dịch chuyển" />
      {steps.length === 0 ? (
        <EmptyNote>Chưa có tương tác nào trong 60 ngày qua.</EmptyNote>
      ) : (
        <ol className="space-y-1">
          {steps.map((e, i) => {
            const prev = steps[i + 1];
            const moved = prev ? Math.hypot(e.x - prev.x, e.y - prev.y) : null;
            const subject = e.action === 'SEARCH'
              ? `“${e.query ?? ''}”`
              : (e.postId && snippetById.get(e.postId)) || 'bài viết';
            return (
              <li key={`${e.at}-${i}`} className="flex items-center gap-2.5 text-xs py-1">
                <span className={`w-6 h-6 rounded-full bg-gray-100 dark:bg-[#3a3b3c] ${ACTION_TEXT[e.action]} flex items-center justify-center shrink-0`}>
                  {ICON[e.action]}
                </span>
                <span className="min-w-0 flex-1 text-gray-900 dark:text-[#e4e6eb] truncate">
                  <b className="font-semibold">{ACTION_LABEL[e.action]}</b>{' '}
                  <span className="text-gray-600 dark:text-[#b0b3b8]">{subject}</span>
                </span>
                <span className="text-[11px] text-gray-500 dark:text-[#b0b3b8] tabular-nums shrink-0">
                  {moved !== null ? `dịch ${moved.toFixed(3)} · ` : ''}{timeAgo(e.at)}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
};
