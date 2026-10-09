import React from 'react';
import { Award, Gem } from 'lucide-react';

interface TopFanBadgeProps {
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export const TopFanBadge: React.FC<TopFanBadgeProps> = ({
  size = 'sm',
  showLabel = true,
  className = '',
}) => {
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full select-none transition-transform hover:scale-105 ${
        isSm
          ? 'px-1.5 py-0.5 text-[10px]'
          : 'px-2 py-0.5 text-xs'
      } bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-pink-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs ${className}`}
      title="Fan cứng: Người tương tác tích cực với trang và các bài viết"
    >
      <Gem className={`${isSm ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} text-amber-500 fill-amber-400/30 animate-pulse`} />
      {showLabel && <span>Fan cứng</span>}
    </span>
  );
};
