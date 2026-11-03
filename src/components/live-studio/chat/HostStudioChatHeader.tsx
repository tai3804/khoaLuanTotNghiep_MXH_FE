import React from 'react';
import { MessageSquare, Users, Settings2, Filter, Activity } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { ChatTab, ChatFilter } from './useHostStudioChat';

interface HostStudioChatHeaderProps {
  activeTab: ChatTab;
  commentCount: number;
  viewerCount: number;
  filter: ChatFilter;
  onTabChange: (tab: ChatTab) => void;
  onFilterToggle: () => void;
}

export const HostStudioChatHeader: React.FC<HostStudioChatHeaderProps> = ({
  activeTab,
  commentCount,
  viewerCount,
  filter,
  onTabChange,
  onFilterToggle,
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col bg-gray-50/90 dark:bg-zinc-950/90 border-b border-gray-200 dark:border-zinc-800 shrink-0 select-none">
      {/* 1. Main Navigation Tabs */}
      <div className="flex items-center justify-between px-2 pt-1.5 border-b border-gray-200/60 dark:border-zinc-800/60">
        <div className="flex items-center space-x-1">
          {/* Tab 1: Live Chat */}
          <button
            type="button"
            onClick={() => onTabChange('chat')}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${
              activeTab === 'chat'
                ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-white dark:bg-zinc-900 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t('live.chat.title', 'Trò chuyện')}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300">
              {commentCount}
            </span>
          </button>

          {/* Tab 2: Audience */}
          <button
            type="button"
            onClick={() => onTabChange('audience')}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${
              activeTab === 'audience'
                ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-white dark:bg-zinc-900 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t('live.chat.audience', 'Khán giả')}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              {viewerCount}
            </span>
          </button>

          {/* Tab 3: Settings */}
          <button
            type="button"
            onClick={() => onTabChange('settings')}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-white dark:bg-zinc-900 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900/50'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{t('live.chat.settings', 'Thiết lập')}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live stream healthy" />
          </button>
        </div>

        {/* Filter Action Button (only on chat tab) */}
        {activeTab === 'chat' && (
          <button
            type="button"
            onClick={onFilterToggle}
            className={`p-1.5 rounded-lg text-xs flex items-center space-x-1 transition cursor-pointer mb-1 ${
              filter === 'host_only'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-600/40'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-800'
            }`}
            title={filter === 'host_only' ? 'Đang lọc: Chỉ xem bình luận của Host' : 'Lọc bình luận'}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium hidden sm:inline">
              {filter === 'host_only' ? t('live.chat.filterHost', 'Chỉ Host') : t('live.chat.filterAll', 'Tất cả')}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
