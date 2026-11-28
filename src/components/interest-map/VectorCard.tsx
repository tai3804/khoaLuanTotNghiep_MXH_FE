import React from 'react';
import { VectorHeatmap } from './VectorHeatmap';
import { Card, CardTitle } from './ui';

/** Khung hiển thị toàn bộ các chiều của vector sở thích */
export const VectorCard: React.FC<{ vector: number[] | null; dimensions: number }> = ({ vector, dimensions }) => (
  <Card className="space-y-3">
    <CardTitle
      title={`${dimensions || 768} chiều của vector sở thích`}
      description="Mỗi ô là một chiều (đã chuẩn hoá độ dài vector về 1). Từng chiều riêng lẻ không mang nghĩa cụ thể; ý nghĩa nằm ở hướng của cả vector, thể hiện trên sơ đồ phía trên."
    />
    {vector ? (
      <VectorHeatmap vector={vector} />
    ) : (
      <div className="rounded-xl bg-gray-50 dark:bg-[#3a3b3c] py-10 text-center text-xs text-gray-500 dark:text-[#b0b3b8]">
        Chưa có vector sở thích.
      </div>
    )}
  </Card>
);
