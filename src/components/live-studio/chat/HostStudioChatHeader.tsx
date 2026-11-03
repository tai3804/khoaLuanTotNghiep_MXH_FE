import React from 'react';
import { MessageSquare, Users, Settings2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { ChatTab } from './useHostStudioChat';

interface HostStudioChatHeaderProps {
  activeTab: ChatTab;
  commentCount: number;
  viewerCount: number;
  onTabChange: (tab: ChatTab) => void;
}

export const HostStudioChatHeader: React.FC<HostStudioChatHeaderProps> = ({
  activeTab,
  commentCount,
  viewerCount,
  onTabChange,
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-gray-50/90 dark:bg-zinc-950/90 border-b border-gray-200 dark:border-zinc-800 shrink-0 select-none px-2 pt-1.5">
      {/* 3 Main Navigation Tabs distributed evenly without cramping */}
      <div className="grid grid-cols-3 gap-1">
        {/* Tab 1: Live Chat */}
        <button
          type="button"
          onClick={() => onTabChange('chat')}
          className={`flex items-center justify-center space-x-1.5 py-2 px-1 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer truncate ${
            activeTab === 'chat'
              ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-white dark:bg-zinc-900 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900/50'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{t('live.chat.title', 'Trò chuyện')}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 shrink-0">
            {commentCount}
          </span>
        </button>

        {/* Tab 2: Audience */}
        <button
          type="button"
          onClick={() => onTabChange('audience')}
          className={`flex items-center justify-center space-x-1.5 py-2 px-1 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer truncate ${
            activeTab === 'audience'
              ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-white dark:bg-zinc-900 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900/50'
          }`}
        >
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{t('live.chat.audience', 'Khán giả')}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 shrink-0">
            {viewerCount}
          </span>
        </button>

        {/* Tab 3: Settings */}
        <button
          type="button"
          onClick={() => onTabChange('settings')}
          className={`flex items-center justify-center space-x-1.5 py-2 px-1 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer truncate ${
            activeTab === 'settings'
              ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-white dark:bg-zinc-900 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900/50'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{t('live.chat.settings', 'Thiết lập')}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Stream healthy" />
        </button>
      </div>
    </div>
  );
};
