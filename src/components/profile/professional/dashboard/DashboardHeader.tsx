import React from 'react';
import { X, RotateCw, Sparkles, Calendar } from 'lucide-react';
import { ProfessionalBadge } from '../ProfessionalBadge';

interface DashboardHeaderProps {
  fullName: string;
  avatarUrl: string;
  creatorCategory?: string;
  period: '7d' | '28d' | '60d';
  onPeriodChange: (p: '7d' | '28d' | '60d') => void;
  onRefresh: () => void;
  onClose: () => void;
  loading: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  fullName,
  avatarUrl,
  creatorCategory = 'Người sáng tạo nội dung số',
  period,
  onPeriodChange,
  onRefresh,
  onClose,
  loading,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 border-b border-gray-100 dark:border-neutral-800 bg-white/80 dark:bg-[#242526]/80 backdrop-blur-md sticky top-0 z-20">
      {/* User Info */}
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <img
            src={avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : '/default-avatar.png'}
            alt=""
            className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/30"
          />
          <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-blue-500 text-white">
            <Sparkles className="w-3 h-3" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-[#e4e6eb]">
              Bảng điều khiển chuyên nghiệp
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-500 dark:text-neutral-400 font-medium">
              {fullName}
            </span>
            <ProfessionalBadge category={creatorCategory} showIcon={false} />
          </div>
        </div>
      </div>

      {/* Right controls: Period Switcher & Actions */}
      <div className="flex items-center gap-2.5 self-end md:self-auto">
        {/* Period Selector */}
        <div className="flex items-center p-1 rounded-xl bg-gray-100 dark:bg-neutral-800 text-xs font-semibold">
          {(
            [
              { id: '7d', label: '7 ngày' },
              { id: '28d', label: '28 ngày' },
              { id: '60d', label: '60 ngày' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => onPeriodChange(item.id)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                period === item.id
                  ? 'bg-white dark:bg-[#242526] text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Reload button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-xl border border-gray-200 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-300 transition cursor-pointer disabled:opacity-50"
          title="Tải lại số liệu"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          className="p-2 rounded-xl border border-gray-200 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-300 transition cursor-pointer"
          title="Đóng bảng điều khiển"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
