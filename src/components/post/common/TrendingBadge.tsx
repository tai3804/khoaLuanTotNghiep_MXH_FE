import React from 'react';
import { Flame } from 'lucide-react';

interface TrendingBadgeProps {
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export const TrendingBadge: React.FC<TrendingBadgeProps> = ({
  size = 'sm',
  showLabel = true,
  className = '',
}) => {
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full select-none shadow-xs ${
        isSm
          ? 'px-2 py-0.5 text-[10px]'
          : 'px-2.5 py-1 text-xs'
      } bg-gradient-to-r from-orange-500/20 via-red-500/20 to-amber-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/35 backdrop-blur-xs ${className}`}
      title="Đang thịnh hành: Bài viết nhận được sự quan tâm và tương tác vượt trội gần đây"
    >
      <Flame className={`${isSm ? 'w-3 h-3' : 'w-4 h-4'} text-orange-500 fill-orange-500 animate-bounce`} />
      {showLabel && <span>Đang thịnh hành</span>}
    </span>
  );
};
