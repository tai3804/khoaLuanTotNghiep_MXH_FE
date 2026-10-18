import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { userService, type MyReputation } from '../../../services/userService';
import { ReputationHistoryList } from './ReputationHistoryList';

// Màu theo bậc uy tín (class Tailwind phải là chuỗi cố định để không bị loại khi build)
const LEVEL_STYLES: Record<string, { bar: string; chip: string; text: string }> = {
  EXCELLENT: { bar: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300', text: 'text-emerald-600 dark:text-emerald-400' },
  GOOD: { bar: 'bg-blue-500', chip: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300', text: 'text-blue-600 dark:text-blue-400' },
  CAUTION: { bar: 'bg-amber-500', chip: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300', text: 'text-amber-600 dark:text-amber-400' },
  WEAK: { bar: 'bg-orange-500', chip: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300', text: 'text-orange-600 dark:text-orange-400' },
  VERY_WEAK: { bar: 'bg-red-500', chip: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300', text: 'text-red-600 dark:text-red-400' },
  LOCKED: { bar: 'bg-gray-500', chip: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300', text: 'text-gray-600 dark:text-gray-400' },
};

// Giờ máy chủ gửi dạng LocalDateTime không kèm múi giờ (cùng quy ước với giờ đăng bài)
const formatWhen = (iso?: string | null) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * Điểm uy tín của chính người dùng: bắt đầu 100, giảm khi nội dung bị cảnh cáo, tạm ẩn hoặc gỡ, tự hồi phục mỗi ngày
 * không vi phạm. Mỗi bậc có quyền hạn riêng nên thẻ này cũng hiển thị mức phạt đang áp dụng và bảng các bậc.
 */
export const ProfileReputationCard: React.FC = () => {
  const [reputation, setReputation] = useState<MyReputation | null>(null);
  const [showTiers, setShowTiers] = useState(false);

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
  const restrictions = reputation.policy?.restrictions ?? [];
  const tiers = reputation.tiers ?? [];
  const recoveryPerDay = reputation.recoveryPerDay ?? 1;
  const nextRecovery = formatWhen(reputation.nextRecoveryAt);

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

      {reputation.lockedUntil && (
        <p className="mt-2 rounded-lg bg-red-50 px-2.5 py-2 text-[11px] font-semibold leading-relaxed text-red-700 dark:bg-red-950/40 dark:text-red-300">
          Tài khoản bị khóa đến {formatWhen(reputation.lockedUntil)}.
        </p>
      )}

      {/* Mức phạt / hạn chế của bậc hiện tại */}
      <div className="mt-2">
        <p className={`text-[11px] font-bold ${style.text}`}>
          {restrictions.length === 0 ? 'Bạn không bị hạn chế quyền nào' : 'Hạn chế ở bậc hiện tại'}
        </p>
        {restrictions.length > 0 && (
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] leading-relaxed text-gray-600 dark:text-[#b0b3b8]">
            {restrictions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
      </div>

      {reputation.score < reputation.maxScore && !reputation.lockedUntil && (
        <p className="mt-2 text-[11px] leading-relaxed text-gray-500 dark:text-[#b0b3b8]">
          Mỗi ngày không vi phạm, điểm tự hồi phục +{recoveryPerDay}
          {nextRecovery ? `. Lần cộng kế tiếp: ${nextRecovery}.` : '.'}
        </p>
      )}

      <ReputationHistoryList />

      {tiers.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowTiers((open) => !open)}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#1877f2] hover:underline cursor-pointer"
          >
            {showTiers ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {showTiers ? 'Ẩn quyền hạn theo từng bậc' : 'Xem quyền hạn theo từng bậc'}
          </button>
          {showTiers && (
            <ul className="mt-2 space-y-2">
              {tiers.map((tier) => {
                const tierStyle = LEVEL_STYLES[tier.level] ?? LEVEL_STYLES.GOOD;
                const current = tier.level === reputation.level;
                return (
                  <li
                    key={tier.level}
                    className={`rounded-lg border px-2.5 py-2 text-[11px] ${
                      current ? 'border-[#1877f2]/60 bg-blue-50/40 dark:bg-blue-950/20' : 'border-gray-200 dark:border-[#393a3b]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`rounded-full px-2 py-0.5 font-bold ${tierStyle.chip}`}>{tier.levelLabel}</span>
                      <span className="font-semibold text-gray-500 dark:text-[#b0b3b8]">
                        {tier.minScore === tier.maxScore ? tier.minScore : `${tier.minScore} – ${tier.maxScore}`} điểm
                        {current ? ' (hiện tại)' : ''}
                      </span>
                    </div>
                    <ul className="mt-1 list-disc space-y-0.5 pl-4 leading-relaxed text-gray-600 dark:text-[#b0b3b8]">
                      {tier.restrictions.length === 0 ? <li>Không bị hạn chế</li> : tier.restrictions.map((line) => <li key={line}>{line}</li>)}
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
