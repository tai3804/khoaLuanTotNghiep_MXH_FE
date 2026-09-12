import React from 'react';
import { RefreshCw, Image as ImageIcon } from 'lucide-react';
import { MediaCard } from './MediaCard';

interface MediaGridContentProps {
  loading: boolean;
  mediaList: any[];
  copiedKey: string | null;
  deletingKey: string | null;
  onPreview: (media: any) => void;
  onCopyUrl: (fileUrl: string, fileKey: string) => void;
  onDelete: (item: any) => void;
}

export const MediaGridContent: React.FC<MediaGridContentProps> = ({
  loading,
  mediaList,
  copiedKey,
  deletingKey,
  onPreview,
  onCopyUrl,
  onDelete,
}) => {
  return (
    <div className="p-5 overflow-y-auto flex-1 min-h-[300px]">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin text-[#1877f2] mb-3" />
          <p className="text-xs font-semibold">Đang tải danh sách media...</p>
        </div>
      ) : mediaList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
          <ImageIcon className="w-12 h-12 stroke-[1.5] text-gray-300 dark:text-[#4e4f50] mb-3" />
          <p className="text-sm font-semibold text-gray-700 dark:text-[#e4e6eb]">
            Chưa có file media nào
          </p>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] max-w-sm mt-1">
            Các ảnh và video bạn tải lên bài viết, story hoặc avatar sẽ xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {mediaList.map((item) => (
            <MediaCard
              key={item.id || item.fileKey}
              item={item}
              copiedKey={copiedKey}
              deletingKey={deletingKey}
              onPreview={onPreview}
              onCopyUrl={onCopyUrl}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
