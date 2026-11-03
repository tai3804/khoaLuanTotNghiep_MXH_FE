import React from 'react';
import { Search, UserCheck, Shield, Radio } from 'lucide-react';
import { UserAvatar } from '../../common/UserAvatar';
import { useLanguage } from '../../../context/LanguageContext';

interface HostStudioAudienceListProps {
  viewerCount: number;
  hostName?: string;
  hostAvatar?: string;
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

export const HostStudioAudienceList: React.FC<HostStudioAudienceListProps> = ({
  viewerCount,
  hostName,
  hostAvatar,
  searchQuery,
  onSearchChange,
}) => {
  const { t } = useLanguage();

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
      <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-gray-100 dark:divide-zinc-800/50 p-2 space-y-1">
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

        {/* Viewers status placeholder */}
        {viewerCount > 0 ? (
          <div className="p-3 text-center text-xs text-gray-500 dark:text-zinc-400">
            <p className="font-medium text-gray-700 dark:text-zinc-300">
              {viewerCount} {t('live.viewerCount', 'người xem')} đang kết nối vào phòng phát
            </p>
            <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">
              Khán giả xem phát sóng qua giao thức luồng một chiều WebRTC
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-gray-400 dark:text-zinc-500">
            <UserCheck className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs font-medium">
              {t('live.audience.empty', 'Chưa có khán giả nào vào phòng')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
