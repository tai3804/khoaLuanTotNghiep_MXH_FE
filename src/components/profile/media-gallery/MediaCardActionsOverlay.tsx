import React from 'react';
import { ExternalLink, Copy, Check, Trash2, RefreshCw } from 'lucide-react';
import { MediaItem } from '../../../services/mediaService';

interface MediaCardActionsOverlayProps {
  item: MediaItem;
  copiedKey: string | null;
  isDeleting: boolean;
  onPreview: (item: MediaItem) => void;
  onCopyUrl: (url: string, key: string) => void;
  onDelete: (key: string) => void;
}

export const MediaCardActionsOverlay: React.FC<MediaCardActionsOverlayProps> = ({
  item,
  copiedKey,
  isDeleting,
  onPreview,
  onCopyUrl,
  onDelete,
}) => {
  return (
    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
      <button
        type="button"
        onClick={() => onPreview(item)}
        className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition cursor-pointer"
        title="Xem chi tiết"
      >
        <ExternalLink className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => onCopyUrl(item.fileUrl, item.fileKey)}
        className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition cursor-pointer"
        title="Sao chép liên kết"
      >
        {copiedKey === item.fileKey ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>

      <button
        type="button"
        onClick={() => onDelete(item.fileKey)}
        disabled={isDeleting}
        className="p-2 rounded-full bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-md transition cursor-pointer disabled:opacity-50"
        title="Xóa file"
      >
        {isDeleting ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};
