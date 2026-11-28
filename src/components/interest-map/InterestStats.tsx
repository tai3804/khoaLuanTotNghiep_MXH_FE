import React from 'react';
import { InterestMap } from '../../services/interestMapService';
import { Card } from './ui';

const Stat: React.FC<{ label: string; value: string; hint?: string }> = ({ label, value, hint }) => (
  <div className="rounded-xl bg-gray-50 dark:bg-[#3a3b3c] px-3 py-2.5 min-w-0">
    <div className="text-[11px] text-gray-500 dark:text-[#b0b3b8] truncate">{label}</div>
    <div className="text-lg font-bold text-gray-900 dark:text-[#e4e6eb] leading-tight">{value}</div>
    {hint && <div className="text-[10px] text-gray-500 dark:text-[#b0b3b8] truncate">{hint}</div>}
  </div>
);

/** Tiêu đề trang và 4 ô số liệu tổng quan */
export const InterestStats: React.FC<{ data: InterestMap }> = ({ data }) => (
  <Card className="space-y-4">
    <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-[#e4e6eb]">Sơ đồ phân tích xu hướng cá nhân</h1>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <Stat label="Tương tác 60 ngày" value={String(data.interactionCount)} hint="thích, bình luận, chia sẻ, tìm kiếm" />
      <Stat label="Dữ liệu dựng vector" value={String(data.vectorizedPosts)} hint={`bài và câu tìm, cần tối thiểu ${data.minPosts}`} />
      <Stat label="Phương sai giữ lại" value={`${((data.explainedX + data.explainedY) * 100).toFixed(1)}%`} hint="trên 2 trục chính" />
      <Stat label="Tính lúc"
        value={new Date(data.computedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        hint={`${data.posts.length} bài trên sơ đồ`} />
    </div>
  </Card>
);
