import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { userService, type MyReputation } from '../../../services/userService';

// Màu theo bậc uy tín (class Tailwind phải là chuỗi cố định để không bị loại khi build)
const LEVEL_STYLES: Record<string, { bar: string; chip: string }> = {
  EXCELLENT: { bar: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
  GOOD: { bar: 'bg-blue-500', chip: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
  CAUTION: { bar: 'bg-amber-500', chip: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
  WARNING: { bar: 'bg-orange-500', chip: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300' },
  CRITICAL: { bar: 'bg-red-500', chip: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300' },
};

/** Điểm uy tín của chính người dùng: bắt đầu 100, giảm khi nội dung bị cảnh cáo, tạm ẩn hoặc gỡ. */
export const ProfileReputationCard: React.FC = () => {
  const [reputation, setReputation] = useState<MyReputation | null>(null);

  useEffect(() => {
    let cancelled = false;
    userService.getMyReputation().then((result) => {
      if (!cancelled) setReputation(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!reputation) return null;

  const style = LEVEL_STYLES[reputation.level] ?? LEVEL_STYLES.GOOD;
  const percent = Math.max(0, Math.min(100, Math.round((reputation.score / reputation.maxScore) * 100)));

  return (
    <div className="mt-3 border-t border-gray-100 pt-3 dark:border-[#393a3b]">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-[#b0b3b8]">
          <Shield className="h-3.5 w-3.5" />
          Điểm uy tín
        </p>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${style.chip}`}>{reputation.levelLabel}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-gray-900 dark:text-[#e4e6eb]">{reputation.score}</span>
        <span className="text-xs font-semibold text-gray-400">/ {reputation.maxScore}</span>
      </div>
      <div
        className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-[#3a3b3c]"
        role="progressbar"
        aria-valuenow={reputation.score}
        aria-valuemin={0}
        aria-valuemax={reputation.maxScore}
      >
        <div className={`h-full rounded-full transition-all ${style.bar}`} style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500 dark:text-[#b0b3b8]">
        {reputation.nextLevelScore != null
          ? `Cần ${reputation.nextLevelScore} điểm để lên bậc cao hơn. `
          : 'Bạn đang ở bậc cao nhất. '}
        Điểm giảm khi bài viết bị cảnh cáo, tạm ẩn hoặc gỡ bỏ.
      </p>
    </div>
  );
};
