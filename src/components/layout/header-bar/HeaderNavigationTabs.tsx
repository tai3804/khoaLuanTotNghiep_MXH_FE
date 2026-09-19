import React from 'react';
import { Home, Tv, Store, Users, Gamepad2 } from 'lucide-react';

interface HeaderNavigationTabsProps {
  activeTab: string;
  pendingReqCount: number;
  language: string;
  t: (key: string) => string;
  onNavClick: (tab: string) => void;
}

export const HeaderNavigationTabs: React.FC<HeaderNavigationTabsProps> = ({
  activeTab,
  pendingReqCount,
  language,
  t,
  onNavClick,
}) => {
  return (
    <nav className="hidden md:flex items-center justify-center space-x-0.5 lg:space-x-1 xl:space-x-2 h-full flex-1 max-w-xl lg:max-w-2xl mx-2">
      <button
        onClick={() => onNavClick('home')}
        className={`flex items-center justify-center w-12 md:w-14 lg:w-24 xl:w-28 h-full transition ${
          activeTab === 'home'
            ? 'text-[#2d88ff] border-b-[3px] border-[#2d88ff]'
            : 'text-gray-500 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/60 border-b-[3px] border-transparent rounded-lg h-12 my-1'
        }`}
        title={t('nav.home')}
      >
        <Home className="w-5 h-5 lg:w-6 lg:h-6" />
      </button>

      <button
        onClick={() => onNavClick('watch')}
        className={`flex items-center justify-center w-12 md:w-14 lg:w-24 xl:w-28 h-full transition ${
          activeTab === 'watch'
            ? 'text-[#2d88ff] border-b-[3px] border-[#2d88ff]'
            : 'text-gray-500 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/60 border-b-[3px] border-transparent rounded-lg h-12 my-1'
        }`}
        title={t('nav.watch')}
      >
        <Tv className="w-5 h-5 lg:w-6 lg:h-6" />
      </button>

      <button
        onClick={() => onNavClick('marketplace')}
        className={`flex items-center justify-center w-12 md:w-14 lg:w-24 xl:w-28 h-full transition ${
          activeTab === 'marketplace'
            ? 'text-[#2d88ff] border-b-[3px] border-[#2d88ff]'
            : 'text-gray-500 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/60 border-b-[3px] border-transparent rounded-lg h-12 my-1'
        }`}
        title={t('nav.marketplace')}
      >
        <Store className="w-5 h-5 lg:w-6 lg:h-6" />
      </button>

      <button
        onClick={() => onNavClick('friends')}
        className={`relative flex items-center justify-center w-12 md:w-14 lg:w-24 xl:w-28 h-full transition ${
          activeTab === 'friends' || activeTab === 'groups'
            ? 'text-[#2d88ff] border-b-[3px] border-[#2d88ff]'
            : 'text-gray-500 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/60 border-b-[3px] border-transparent rounded-lg h-12 my-1'
        }`}
        title={language === 'en' ? 'Friends & Groups' : 'Bạn bè & Nhóm'}
      >
        <Users className="w-5 h-5 lg:w-6 lg:h-6" />
        {pendingReqCount > 0 && (
          <span className="absolute top-2 right-1 sm:right-2 lg:right-6 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shadow-sm animate-pulse">
            {pendingReqCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onNavClick('gaming')}
        className={`flex items-center justify-center w-12 md:w-14 lg:w-24 xl:w-28 h-full transition ${
          activeTab === 'gaming'
            ? 'text-[#2d88ff] border-b-[3px] border-[#2d88ff]'
            : 'text-gray-500 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/60 border-b-[3px] border-transparent rounded-lg h-12 my-1'
        }`}
        title={t('nav.gaming')}
      >
        <Gamepad2 className="w-5 h-5 lg:w-6 lg:h-6" />
      </button>
    </nav>
  );
};
