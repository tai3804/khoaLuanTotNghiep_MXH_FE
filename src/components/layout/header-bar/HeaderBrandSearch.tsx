import React, { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Hash, History, Search, X } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Logo } from '../../common/Logo';
import { readSearchHistory, removeSearchHistoryItem } from '../../../utils/searchHistory';

interface HeaderBrandSearchProps {
  searchRef: RefObject<HTMLDivElement | null>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showSearchResults: boolean;
  setShowSearchResults: (show: boolean) => void;
  language: string;
  t: (key: string) => string;
  onNavClick: (tab: string) => void;
}

const MAX_SUGGESTIONS = 6;
const LISTBOX_ID = 'header-search-suggestions';

/**
 * Ô tìm kiếm ở header. Không gọi API trong lúc gõ: tìm kiếm chạy một lần khi người dùng gõ xong và bấm Enter (hoặc chọn một gợi ý),
 * vì mỗi lần tìm là nhiều request và tốn lượt gọi mô hình AI. Khi gõ chỉ hiện lịch sử tìm kiếm khớp với chữ đang gõ.
 */
export const HeaderBrandSearch: React.FC<HeaderBrandSearchProps> = ({
  searchRef,
  searchQuery,
  setSearchQuery,
  showSearchResults,
  setShowSearchResults,
  language,
  t,
  onNavClick,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [history, setHistory] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  // Điện thoại: ô tìm kiếm thu thành nút kính lúp, bấm vào thì mở thanh tìm kiếm rộng bằng cả header
  const [mobileOpen, setMobileOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const en = language === 'en';

  const closeMobile = () => {
    setMobileOpen(false);
    setShowSearchResults(false);
  };

  useEffect(() => {
    if (mobileOpen) inputRef.current?.focus();
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setShowSearchResults(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileOpen]);

  // Đang ở trang kết quả thì giữ từ khoá hiện tại trong ô tìm kiếm (tải lại trang, quay lại, bấm một mục lịch sử).
  const urlQuery = location.pathname === '/search' ? searchParams.get('q') || '' : null;
  useEffect(() => {
    if (urlQuery !== null) setSearchQuery(urlQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery]);

  const openSuggestions = () => {
    setHistory(readSearchHistory());
    setActiveIndex(-1);
    setShowSearchResults(true);
  };

  const typed = searchQuery.trim();
  const suggestions = useMemo(() => {
    const needle = typed.toLocaleLowerCase();
    return history
      .filter((item) => item.toLocaleLowerCase() !== needle && (!needle || item.toLocaleLowerCase().includes(needle)))
      .slice(0, MAX_SUGGESTIONS);
  }, [history, typed]);

  // Dòng đầu (khi đã gõ) là "tìm cụm đang gõ", các dòng sau là gợi ý từ lịch sử.
  const rows: string[] = typed ? [typed, ...suggestions] : suggestions;

  const runSearch = (keyword: string) => {
    const value = keyword.trim();
    if (!value) return;
    setSearchQuery(value);
    setShowSearchResults(false);
    setMobileOpen(false);
    setActiveIndex(-1);
    (document.activeElement as HTMLElement | null)?.blur?.();
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Đang gõ dở bằng bộ gõ (IME) thì Enter là để chốt chữ, chưa phải gửi tìm kiếm.
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      runSearch(activeIndex >= 0 && rows[activeIndex] ? rows[activeIndex] : searchQuery);
    } else if (e.key === 'Escape') {
      setShowSearchResults(false);
      setActiveIndex(-1);
    } else if (e.key === 'ArrowDown' && rows.length > 0) {
      e.preventDefault();
      if (!showSearchResults) openSuggestions();
      setActiveIndex((i) => (i + 1) % rows.length);
    } else if (e.key === 'ArrowUp' && rows.length > 0) {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? rows.length - 1 : i - 1));
    }
  };

  const forgetItem = (item: string) => {
    setHistory(removeSearchHistoryItem(item));
    setActiveIndex(-1);
  };

  const hasDropdown = showSearchResults && rows.length > 0;

  return (
    <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
      <Logo onClick={() => onNavClick('home')} size="sm" className="max-sm:[&>*:nth-child(2)]:hidden" />

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label={t('nav.search') || 'Tìm kiếm'}
        className="sm:hidden flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-700 dark:text-[#e4e6eb] transition cursor-pointer"
      >
        <Search className="h-5 w-5" />
      </button>

      <div
        ref={searchRef}
        className={`relative ${
          mobileOpen
            ? 'max-sm:fixed max-sm:inset-x-0 max-sm:top-0 max-sm:z-[60] max-sm:flex max-sm:h-14 max-sm:items-center max-sm:gap-1 max-sm:bg-white max-sm:px-2 max-sm:dark:bg-[#242526]'
            : 'max-sm:hidden'
        }`}
      >
        {mobileOpen && (
          <button
            type="button"
            data-back-target
            onClick={closeMobile}
            aria-label={en ? 'Close search' : 'Đóng tìm kiếm'}
            className="sm:hidden flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="relative max-sm:min-w-0 max-sm:flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-[#b0b3b8] pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label={t('nav.search') || 'Tìm kiếm'}
          aria-expanded={hasDropdown}
          aria-controls={LISTBOX_ID}
          aria-autocomplete="list"
          aria-activedescendant={hasDropdown && activeIndex >= 0 ? `${LISTBOX_ID}-${activeIndex}` : undefined}
          enterKeyHint="search"
          autoComplete="off"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!showSearchResults) openSuggestions();
            setActiveIndex(-1);
          }}
          onFocus={openSuggestions}
          onKeyDown={handleKeyDown}
          placeholder={t('nav.search') || 'Tìm kiếm...'}
          className="w-20 xs:w-28 sm:w-36 md:w-36 lg:w-56 xl:w-60 max-sm:w-full max-sm:focus:w-full max-sm:text-base max-sm:py-2.5 pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-500 dark:placeholder-[#b0b3b8] rounded-full focus:outline-none focus:ring-1 focus:ring-[#2d88ff] focus:w-36 sm:focus:w-44 md:focus:w-48 lg:focus:w-64 transition-all duration-200"
        />

        {hasDropdown && (
          <div
            id={LISTBOX_ID}
            role="listbox"
            className="absolute top-12 left-0 w-72 sm:w-80 md:w-96 max-w-[calc(100vw-2rem)] max-sm:fixed max-sm:inset-x-2 max-sm:top-[3.75rem] max-sm:w-auto max-sm:max-w-none bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-2xl shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto"
          >
            {!typed && (
              <div className="px-4 pt-3 pb-1 text-xs font-bold text-gray-500 dark:text-[#b0b3b8] uppercase tracking-wider">
                {en ? 'Recent searches' : 'Tìm kiếm gần đây'}
              </div>
            )}

            <div className="p-2 space-y-0.5">
              {rows.map((item, index) => {
                const isRunNow = Boolean(typed) && index === 0;
                const active = index === activeIndex;
                return (
                  <div
                    key={`${index}-${item}`}
                    id={`${LISTBOX_ID}-${index}`}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => runSearch(item)}
                    className={`group flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer transition-colors ${
                      active ? 'bg-gray-100 dark:bg-[#3a3b3c]' : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        isRunNow ? 'bg-[#1877f2] text-white' : 'bg-gray-200 dark:bg-[#3a3b3c] text-gray-600 dark:text-[#b0b3b8]'
                      }`}
                    >
                      {isRunNow ? <Search className="w-4 h-4" /> : item.startsWith('#') ? <Hash className="w-4 h-4" /> : <History className="w-4 h-4" />}
                    </div>
                    <span
                      className={`min-w-0 flex-1 truncate text-sm ${
                        isRunNow ? 'font-semibold text-[#1877f2] dark:text-[#2d88ff]' : 'text-gray-800 dark:text-[#e4e6eb]'
                      }`}
                    >
                      {isRunNow ? (en ? `Search for "${item}"` : `Tìm kiếm "${item}"`) : item}
                    </span>
                    {isRunNow ? (
                      <kbd className="hidden sm:inline text-[10px] font-semibold text-gray-400 dark:text-[#b0b3b8] border border-gray-200 dark:border-[#4e4f50] rounded px-1.5 py-0.5">
                        Enter
                      </kbd>
                    ) : (
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.stopPropagation();
                          forgetItem(item);
                        }}
                        aria-label={en ? `Remove "${item}" from history` : `Xóa "${item}" khỏi lịch sử`}
                        className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-[#4e4f50] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
