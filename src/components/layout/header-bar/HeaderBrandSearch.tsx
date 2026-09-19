import React, { RefObject } from 'react';
import { Search } from 'lucide-react';
import { Logo } from '../../common/Logo';

interface HeaderBrandSearchProps {
  searchRef: RefObject<HTMLDivElement | null>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showSearchResults: boolean;
  setShowSearchResults: (show: boolean) => void;
  searching: boolean;
  searchResults: { users: any[]; posts: any[] };
  language: string;
  t: (key: string) => string;
  onNavClick: (tab: string) => void;
  onNavigateProfile?: (userId?: string) => void;
  onTabChange?: (tab: string) => void;
}

export const HeaderBrandSearch: React.FC<HeaderBrandSearchProps> = ({
  searchRef,
  searchQuery,
  setSearchQuery,
  showSearchResults,
  setShowSearchResults,
  searching,
  searchResults,
  language,
  t,
  onNavClick,
  onNavigateProfile,
  onTabChange,
}) => {
  return (
    <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
      <Logo onClick={() => onNavClick('home')} size="sm" />

      <div ref={searchRef} className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 dark:text-[#b0b3b8]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
          placeholder={t('nav.search') || 'Tìm kiếm...'}
          className="w-24 xs:w-32 sm:w-40 md:w-44 lg:w-60 pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-500 dark:placeholder-[#b0b3b8] rounded-full focus:outline-none focus:ring-1 focus:ring-[#2d88ff] transition"
        />

        {/* Search Dropdown Popover */}
        {showSearchResults && (
          <div className="absolute top-12 left-0 w-72 sm:w-80 md:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-2xl shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-100 dark:border-[#393a3b] flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-[#b0b3b8] uppercase tracking-wider">{t('search.results')}</span>
              <button
                onClick={() => setShowSearchResults(false)}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                {t('search.close')}
              </button>
            </div>

            {searching ? (
              <div className="py-6 text-center text-xs text-gray-400 dark:text-[#b0b3b8] flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-[#1877f2] border-t-transparent rounded-full animate-spin" />
                <span>{t('search.searching')}</span>
              </div>
            ) : searchResults.users.length === 0 && searchResults.posts.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400 dark:text-[#b0b3b8]">{t('search.noResults')}</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-[#393a3b]">
                {/* Users results */}
                {searchResults.users.length > 0 && (
                  <div className="p-2 space-y-1">
                    <div className="px-2 text-[11px] font-bold text-[#1877f2] dark:text-[#2d88ff]">{t('search.people')}</div>
                    {searchResults.users.map((u: any) => {
                      const uid = String(u.userId || u.id);
                      const name = [u.lastName, u.middleName, u.firstName].filter(Boolean).join(' ').trim() || u.fullName || u.username || (language === 'en' ? 'User' : 'Người dùng');
                      const avatar = u.avatarUrl || u.avatar || '/default-avatar.png';

                      return (
                        <div
                          key={uid}
                          onClick={() => {
                            setShowSearchResults(false);
                            if (onNavigateProfile) onNavigateProfile(uid);
                          }}
                          className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl cursor-pointer transition"
                        >
                          <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-gray-900 dark:text-[#e4e6eb] truncate">{name}</p>
                            <p className="text-[11px] text-gray-500 dark:text-[#b0b3b8] truncate">@{u.username || 'user'}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Posts results */}
                {searchResults.posts.length > 0 && (
                  <div className="p-2 space-y-1">
                    <div className="px-2 text-[11px] font-bold text-[#1877f2] dark:text-[#2d88ff]">{t('search.posts')}</div>
                    {searchResults.posts.map((p: any) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setShowSearchResults(false);
                          if (onTabChange) onTabChange('home');
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl cursor-pointer transition"
                      >
                        <p className="text-xs font-medium text-gray-800 dark:text-[#e4e6eb] line-clamp-2">{p.content}</p>
                        <p className="text-[10px] text-gray-400 dark:text-[#b0b3b8] mt-1">{p.authorName || (language === 'en' ? 'Member' : 'Thành viên')} • {p.createdAt || (language === 'en' ? 'Just now' : 'Vừa xong')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
