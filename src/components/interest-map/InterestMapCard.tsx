import React from 'react';
import { InterestMap } from '../../services/interestMapService';
import { InterestScatter } from './InterestScatter';
import { MapLegend } from './MapLegend';
import { Card } from './ui';

/** Khung sơ đồ: chú thích, thông báo khi chưa đủ dữ liệu, sơ đồ 2 trục chính và ghi chú cách dùng */
export const InterestMapCard: React.FC<{ data: InterestMap; highlightTopic: number | null }> = ({ data, highlightTopic }) => (
  <Card className="space-y-3">
    <MapLegend />
    {!data.hasProfile && (
      <div className="rounded-xl bg-gray-50 dark:bg-[#3a3b3c] px-3 py-2 text-xs text-gray-700 dark:text-[#e4e6eb]">
        Cần ít nhất {data.minPosts} bài đã tương tác (có vector) hoặc câu đã tìm kiếm để dựng vector sở thích (hiện có{' '}
        {data.vectorizedPosts}). Hãy thích, bình luận, chia sẻ hoặc tìm kiếm rồi tải lại trang.
      </div>
    )}
    <InterestScatter data={data} highlightTopic={highlightTopic} />
    <p className="text-[11px] text-gray-500 dark:text-[#b0b3b8]">
      {data.trail.length > 0 && <>Đường mờ là quỹ đạo vector sở thích qua {data.trail.length} tương tác gần nhất. </>}
      Di chuột lên chấm để xem chi tiết, bấm vào chấm bài viết để mở bài ở tab mới. Sau khi tương tác hoặc tìm kiếm thêm, tải lại
      trang để thấy vị trí mới.
    </p>
  </Card>
);
