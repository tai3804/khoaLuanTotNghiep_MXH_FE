import React from 'react';
import { InterestAction } from '../../services/interestMapService';
import { ACTION_BG, ACTION_WEIGHT, OTHER_BG, RECENT_BG, RECOMMEND_BG, TOPIC_BG, USER_BG } from './colors';
import { ACTION_LABEL } from './labels';
import { Dot } from './ui';

const Item: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-[#b0b3b8]">
    <Dot className={color} />
    {label}
  </span>
);

const ACTIONS: InterestAction[] = ['REACTION', 'COMMENT', 'SHARE', 'SEARCH'];

/** Chú thích màu của sơ đồ: mỗi loại đối tượng một màu, kèm trọng số ảnh hưởng của từng loại tương tác */
export const MapLegend: React.FC = () => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
    <Item color={USER_BG} label="Vector sở thích của bạn" />
    {ACTIONS.map((a) => (
      <Item key={a} color={ACTION_BG[a]} label={`Đã ${ACTION_LABEL[a].toLowerCase()} (×${ACTION_WEIGHT[a]})`} />
    ))}
    <Item color={RECOMMEND_BG} label="Bảng tin sẽ ưu tiên" />
    <Item color={RECENT_BG} label="Bài mới (24 giờ)" />
    <Item color={OTHER_BG} label="Bài khác" />
    <Item color={TOPIC_BG} label="Tâm chủ đề" />
  </div>
);
