import React from 'react';
import { Link2, ExternalLink, Globe, Loader2, RefreshCw } from 'lucide-react';
import { SharedLinkItem } from './types';

interface SharedLinksSectionProps {
  linkList: SharedLinkItem[];
  onLoadMoreHistory?: () => void;
  isLoadingMore?: boolean;
  hasLoadedFull?: boolean;
}

export const SharedLinksSection: React.FC<SharedLinksSectionProps> = ({
  linkList,
  onLoadMoreHistory,
  isLoadingMore,
  hasLoadedFull,
}) => {
  if (linkList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center text-gray-400 mb-3">
          <Link2 className="w-8 h-8 stroke-1.5" />
        </div>
        <p className="text-sm font-semibold text-gray-800 dark:text-[#e4e6eb] mb-1">
          Chưa có liên kết chia sẻ nào
        </p>
        <p className="text-xs text-gray-500 dark:text-[#b0b3b8] max-w-xs">
          Các đường link web (YouTube, bài viết tin tức, website...) được gửi trong chat sẽ hiển thị ở đây.
        </p>

        {onLoadMoreHistory && !hasLoadedFull && (
          <button
            onClick={onLoadMoreHistory}
            disabled={isLoadingMore}
            className="mt-4 px-4 py-2 rounded-full bg-[#1877f2]/10 hover:bg-[#1877f2]/20 text-[#1877f2] dark:text-[#4599ff] text-xs font-semibold inline-flex items-center space-x-2 transition cursor-pointer disabled:opacity-50"
          >
            {isLoadingMore ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>Tìm trong lịch sử cũ hơn</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between pb-1">
        <span className="text-xs font-bold text-gray-700 dark:text-[#e4e6eb] uppercase tracking-wider">
          Liên kết ({linkList.length})
        </span>
        {onLoadMoreHistory && !hasLoadedFull && (
          <button
            onClick={onLoadMoreHistory}
            disabled={isLoadingMore}
            className="text-xs text-[#1877f2] dark:text-[#4599ff] hover:underline inline-flex items-center space-x-1.5 font-medium cursor-pointer disabled:opacity-50"
          >
            {isLoadingMore && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Tải thêm liên kết cũ</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {linkList.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#2d2e30] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] border border-gray-100 dark:border-white/5 shadow-2xs hover:shadow-xs transition"
          >
            <div className="flex items-center space-x-3 min-w-0 pr-3">
              <div className="shrink-0 p-2.5 rounded-lg bg-white dark:bg-[#1e1f20] text-[#1877f2] dark:text-[#4599ff] shadow-xs">
                <Globe className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-[#1877f2] dark:text-[#4599ff] group-hover:underline truncate">
                  {item.domain}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8] truncate mt-0.5">
                  {item.url}
                </p>
                <div className="flex items-center space-x-2 text-[10px] text-gray-400 dark:text-[#8a8d91] mt-1">
                  <span>{item.time}</span>
                  {item.senderName && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[100px]">{item.senderName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <span className="shrink-0 text-gray-400 group-hover:text-[#1877f2] dark:group-hover:text-[#4599ff] p-2 bg-white dark:bg-[#1e1f20] rounded-full shadow-2xs">
              <ExternalLink className="w-4 h-4" />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};
