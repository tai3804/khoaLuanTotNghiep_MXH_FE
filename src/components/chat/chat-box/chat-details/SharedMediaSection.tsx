import React from 'react';
import { Image as ImageIcon, Play, Loader2, RefreshCw } from 'lucide-react';
import { SharedMediaItem } from './types';

interface SharedMediaSectionProps {
  mediaList: SharedMediaItem[];
  onSelectMedia: (item: SharedMediaItem) => void;
  onLoadMoreHistory?: () => void;
  isLoadingMore?: boolean;
  hasLoadedFull?: boolean;
}

export const SharedMediaSection: React.FC<SharedMediaSectionProps> = ({
  mediaList,
  onSelectMedia,
  onLoadMoreHistory,
  isLoadingMore,
  hasLoadedFull,
}) => {
  if (mediaList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center text-gray-400 mb-3">
          <ImageIcon className="w-8 h-8 stroke-1.5" />
        </div>
        <p className="text-sm font-semibold text-gray-800 dark:text-[#e4e6eb] mb-1">
          Chưa có file phương tiện nào
        </p>
        <p className="text-xs text-gray-500 dark:text-[#b0b3b8] max-w-xs">
          Hình ảnh và video bạn và đối phương gửi cho nhau sẽ được lưu trữ và hiển thị ở đây.
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
          Ảnh & Video ({mediaList.length})
        </span>
        {onLoadMoreHistory && !hasLoadedFull && (
          <button
            onClick={onLoadMoreHistory}
            disabled={isLoadingMore}
            className="text-xs text-[#1877f2] dark:text-[#4599ff] hover:underline inline-flex items-center space-x-1.5 font-medium cursor-pointer disabled:opacity-50"
          >
            {isLoadingMore && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Tải thêm ảnh cũ</span>
          </button>
        )}
      </div>

      {/* Spacious 4 to 5 Column Mosaic Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 sm:gap-3">
        {mediaList.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectMedia(item)}
            className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-[#3a3b3c] cursor-pointer ring-1 ring-black/5 dark:ring-white/10 hover:ring-2 hover:ring-[#1877f2] dark:hover:ring-[#4599ff] hover:shadow-lg transition-all duration-200"
          >
            {item.type === 'VIDEO' ? (
              <div className="w-full h-full relative flex items-center justify-center bg-black/40">
                <video
                  src={item.url}
                  className="w-full h-full object-cover pointer-events-none"
                />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/90 dark:bg-black/80 flex items-center justify-center text-gray-900 dark:text-white shadow-md group-hover:scale-115 transition">
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={item.url}
                alt={item.fileName || 'Shared asset'}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-108 transition duration-300"
              />
            )}

            {/* Hover timestamp overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition flex items-center justify-between text-[11px] text-white">
              <span className="truncate max-w-[100px]">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
