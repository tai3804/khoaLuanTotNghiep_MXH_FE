import React from 'react';
import { InterestRecommendation } from '../../services/interestMapService';
import { RECOMMEND_BG } from './colors';
import { recommendReason } from './labels';
import { Card, CardTitle, Dot, EmptyNote } from './ui';

/**
 * Bài bảng tin sẽ ưu tiên cho người xem, mỗi bài ghi rõ lý do: gần câu vừa tìm (trong 24 giờ) hoặc gần vector sở thích.
 */
export const RecommendationList: React.FC<{ items: InterestRecommendation[] }> = ({ items }) => (
  <Card className="space-y-3">
    <CardTitle
      title="Bảng tin sẽ ưu tiên cho bạn"
      description="Bài chưa tương tác gần câu bạn vừa tìm (trong 24 giờ, độ giống từ 0,40) hoặc gần vector sở thích (độ giống trên 0,45 thì được cộng điểm)."
    />
    {items.length === 0 ? (
      <EmptyNote>Chưa có. Hãy tương tác hoặc tìm kiếm vài bài rồi tải lại trang.</EmptyNote>
    ) : (
      <ul className="space-y-1.5">
        {items.map((r) => (
          <li key={r.id}>
            <a href={`/posts/${r.id}`} target="_blank" rel="noopener"
              className="flex items-start gap-2.5 rounded-lg px-1.5 py-1.5 -mx-1.5 hover:bg-gray-50 dark:hover:bg-[#3a3b3c] transition">
              <span className="mt-1"><Dot className={RECOMMEND_BG} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-gray-900 dark:text-[#e4e6eb] line-clamp-2">{r.snippet || '(không có nội dung chữ)'}</span>
                <span className="block text-[11px] text-gray-500 dark:text-[#b0b3b8] tabular-nums">{recommendReason(r)}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    )}
  </Card>
);
