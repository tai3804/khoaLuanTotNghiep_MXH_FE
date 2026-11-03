import React, { useState } from 'react';
import { Search, UserCheck, Shield, Radio, Ban, UserX, CheckCircle, AlertTriangle } from 'lucide-react';
import { UserAvatar } from '../../common/UserAvatar';
import { useLanguage } from '../../../context/LanguageContext';

export interface BannedViewerItem {
  id: string;
  name: string;
  avatar?: string;
}

interface HostStudioAudienceListProps {
  viewerCount: number;
  hostName?: string;
  hostAvatar?: string;
  searchQuery: string;
  bannedUsers: BannedViewerItem[];
  onSearchChange: (val: string) => void;
  onBanViewer: (userId: string, userName?: string) => void;
  onUnbanViewer: (userId: string) => void;
}

export const HostStudioAudienceList: React.FC<HostStudioAudienceListProps> = ({
  viewerCount,
  hostName,
  hostAvatar,
  searchQuery,
  bannedUsers,
  onSearchChange,
  onBanViewer,
  onUnbanViewer,
}) => {
  const { t } = useLanguage();
  const [confirmBanTarget, setConfirmBanTarget] = useState<{ id: string; name: string } | null>(null);

  const handleConfirmBan = () => {
    if (confirmBanTarget) {
      onBanViewer(confirmBanTarget.id, confirmBanTarget.name);
      setConfirmBanTarget(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-zinc-900 select-none">
      {/* 1. Audience Search Bar */}
      <div className="p-2.5 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/40 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('live.audience.search', 'Tìm kiếm khán giả...')}
            className="w-full bg-white dark:bg-zinc-800 text-xs text-gray-900 dark:text-white pl-8 pr-3 py-1.5 rounded-lg border border-gray-300/80 dark:border-zinc-700 outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* 2. Total Connected Viewers Summary Banner */}
      <div className="px-3.5 py-2 bg-blue-50/70 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/30 flex items-center justify-between text-xs shrink-0">
        <span className="text-gray-600 dark:text-zinc-400 font-medium">
          {t('live.audience.total', 'Tổng số khán giả đang kết nối:')}
        </span>
        <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full text-[11px]">
          {viewerCount} {t('live.viewerCount', 'người xem')}
        </span>
      </div>

      {/* 3. List of Active Members in the Room */}
      <div className="flex-1 overflow-y-auto min-h-0 p-2 space-y-2">
        {/* Host Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-700/30">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="relative">
              <UserAvatar src={hostAvatar} alt={hostName} size="sm" className="w-8 h-8 rounded-full" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {hostName || 'Chủ phòng'}
                </span>
                <Shield className="w-3 h-3 text-amber-500" />
              </div>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">
                {t('live.audience.host', 'Chủ phòng')}
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-full flex items-center space-x-1 shrink-0">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            <span>LIVE</span>
          </span>
        </div>

        {/* Viewers status summary */}
        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/60 dark:border-zinc-700/40 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-zinc-300 font-semibold">
              Khán giả trực tiếp ({viewerCount})
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Đang kết nối</span>
            </span>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-1">
            Chủ phòng có thể nhấp vào biểu tượng cấm trên bất kỳ tin nhắn hoặc khán giả nào để chặn họ khỏi phòng.
          </p>
        </div>

        {/* 4. Banned Viewers Section (if any) */}
        {bannedUsers.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-red-600 dark:text-red-400 px-1">
              <UserX className="w-3.5 h-3.5" />
              <span>{t('live.audience.bannedList', 'Khán giả đã bị cấm')} ({bannedUsers.length})</span>
            </div>

            <div className="space-y-1">
              {bannedUsers.map((banned) => (
                <div
                  key={banned.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/30 text-xs"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <UserAvatar src={banned.avatar} alt={banned.name} size="sm" className="w-6 h-6 rounded-full" />
                    <span className="font-semibold text-gray-800 dark:text-zinc-200 truncate">{banned.name}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onUnbanViewer(banned.id)}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition cursor-pointer shrink-0"
                  >
                    {t('live.audience.unban', 'Bỏ cấm')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Ban */}
      {confirmBanTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center space-x-2.5 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">Xác nhận cấm người xem</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
              Bạn có chắc chắn muốn cấm <strong className="text-gray-900 dark:text-white">@{confirmBanTarget.name}</strong> khỏi buổi phát trực tiếp này? Người này sẽ bị ngắt kết nối và không thể xem hoặc bình luận nữa.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmBanTarget(null)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmBan}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition cursor-pointer"
              >
                Xác nhận cấm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
