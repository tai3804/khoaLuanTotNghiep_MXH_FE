import React from 'react';
import { Search, Shield, Radio, UserX, UserMinus } from 'lucide-react';
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
  viewers: BannedViewerItem[];
  bannedUsers: BannedViewerItem[];
  onSearchChange: (val: string) => void;
  /** Mở hộp xác nhận mời người xem ra khỏi phòng */
  onKickViewer: (userId: string, userName: string) => void;
  onUnbanViewer: (userId: string) => void;
}

const matches = (name: string, q: string) => !q.trim() || name.toLowerCase().includes(q.trim().toLowerCase());

export const HostStudioAudienceList: React.FC<HostStudioAudienceListProps> = ({
  viewerCount,
  hostName,
  hostAvatar,
  searchQuery,
  viewers,
  bannedUsers,
  onSearchChange,
  onKickViewer,
  onUnbanViewer,
}) => {
  const { t } = useLanguage();
  const shownViewers = viewers.filter((v) => matches(v.name, searchQuery));
  const shownBanned = bannedUsers.filter((b) => matches(b.name, searchQuery));

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-zinc-900 select-none">
      {/* Tìm khán giả */}
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

      <div className="flex-1 overflow-y-auto min-h-0 p-2 space-y-3">
        {/* Chủ phòng */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-700/30">
          <div className="flex items-center space-x-2.5 min-w-0">
            <UserAvatar src={hostAvatar} alt={hostName} size="sm" className="w-8 h-8 rounded-full" />
            <div className="truncate">
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-gray-900 dark:text-white truncate">{hostName || 'Chủ phòng'}</span>
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

        {/* Người đang xem */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="font-bold text-gray-800 dark:text-zinc-200">Đang xem ({Math.max(viewerCount, viewers.length)})</span>
            <span className="text-[10px] text-gray-400 dark:text-zinc-500">Cập nhật mỗi 5 giây</span>
          </div>
          {shownViewers.length === 0 ? (
            <p className="px-1 py-3 text-[11px] text-gray-400 dark:text-zinc-500">
              {viewers.length === 0 ? 'Chưa có ai đang xem.' : 'Không có khán giả khớp tìm kiếm.'}
            </p>
          ) : (
            shownViewers.map((v) => (
              <div
                key={v.id}
                className="group flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="relative shrink-0">
                    <UserAvatar src={v.avatar} alt={v.name} size="sm" className="w-7 h-7 rounded-full" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                  </div>
                  <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200 truncate">{v.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onKickViewer(v.id, v.name)}
                  className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 transition cursor-pointer shrink-0"
                  title={`Mời ${v.name} ra khỏi buổi phát`}
                >
                  <UserMinus className="w-3 h-3" />
                  Mời ra
                </button>
              </div>
            ))
          )}
        </div>

        {/* Đã mời ra */}
        {shownBanned.length > 0 && (
          <div className="pt-3 border-t border-gray-200 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-red-600 dark:text-red-400 px-1">
              <UserX className="w-3.5 h-3.5" />
              <span>Đã mời ra ({bannedUsers.length})</span>
            </div>
            {shownBanned.map((banned) => (
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
                  title="Cho phép người này vào xem lại"
                >
                  {t('live.audience.unban', 'Bỏ chặn')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
