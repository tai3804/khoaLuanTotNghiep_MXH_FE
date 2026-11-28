import React from 'react';
import { InterestTopic } from '../../services/interestMapService';
import { Card, CardTitle, EmptyNote } from './ui';

interface Props {
  topics: InterestTopic[];
  hasProfile: boolean;
  onHighlight: (topicId: number | null) => void;
}

/**
 * Các chủ đề người dùng đã tương tác (kể cả tìm kiếm), sắp theo tỉ trọng tương tác giảm dần; chủ đề 0% không hiện.
 * Khi đã có vector sở thích, mỗi dòng có thêm chấm cosine trên một trục chung.
 */
export const TopicInterestList: React.FC<Props> = ({ topics, hasProfile, onHighlight }) => {
  const engaged = topics.filter((t) => t.share > 0).sort((a, b) => b.share - a.share || b.affinity - a.affinity);

  // Biểu đồ chấm (không phải thanh) nên trục không cần bắt đầu từ 0: cosine giữa các embedding thường dồn trong khoảng hẹp
  const values = engaged.map((t) => t.affinity);
  const lo = Math.max(-1, Math.floor((Math.min(...values, 1) - 0.05) * 10) / 10);
  const hi = Math.min(1, Math.ceil((Math.max(...values, 0) + 0.02) * 10) / 10);
  const pos = (v: number) => Math.min(1, Math.max(0, (v - lo) / Math.max(1e-6, hi - lo)));

  return (
    <Card className="space-y-3">
      <CardTitle
        title="Chủ đề bạn quan tâm"
        description={`Các chủ đề bạn đã tương tác hoặc tìm kiếm, sắp theo tỉ trọng từ cao xuống thấp${
          hasProfile ? '; chấm xanh là cosine giữa vector sở thích và tâm chủ đề (càng về phải càng gần)' : ''
        }.`}
      />
      {engaged.length === 0 ? (
        <EmptyNote>Chưa có tương tác nào thuộc các chủ đề trên sơ đồ.</EmptyNote>
      ) : (
        <ul className="space-y-2">
          {engaged.map((t) => (
            <li key={t.id} onMouseEnter={() => onHighlight(t.id)} onMouseLeave={() => onHighlight(null)}
              className="rounded-lg px-1.5 py-1 -mx-1.5 hover:bg-gray-50 dark:hover:bg-[#3a3b3c] transition cursor-default">
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="font-semibold text-gray-900 dark:text-[#e4e6eb] truncate" title={t.label}>{t.label}</span>
                <span className="text-gray-500 dark:text-[#b0b3b8] tabular-nums shrink-0">
                  {(t.share * 100).toFixed(0)}% tương tác · {t.posts} bài{hasProfile ? ` · cosine ${t.affinity.toFixed(3)}` : ''}
                </span>
              </div>
              {hasProfile && (
                <div className="relative mt-1.5 h-3">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200 dark:bg-[#3a3b3c]" />
                  <div className="absolute top-1/2 w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-[#257de0] dark:bg-[#338ced] ring-2 ring-white dark:ring-[#242526]"
                    style={{ left: `${pos(t.affinity) * 100}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {engaged.length > 0 && hasProfile && (
        <div className="flex justify-between text-[10px] text-gray-500 dark:text-[#b0b3b8] tabular-nums">
          <span>cosine {lo.toFixed(1)}</span>
          <span>{hi.toFixed(1)}</span>
        </div>
      )}
    </Card>
  );
};
