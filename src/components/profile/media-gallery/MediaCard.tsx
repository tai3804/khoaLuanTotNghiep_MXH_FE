import React from 'react';
import { Image as ImageIcon, Video } from 'lucide-react';
import { MediaItem } from '../../../services/mediaService';
import { MediaCardActionsOverlay } from './MediaCardActionsOverlay';

interface MediaCardProps {
  item: MediaItem;
  copiedKey: string | null;
  deletingKey: string | null;
  onPreview: (item: MediaItem) => void;
  onCopyUrl: (url: string, key: string) => void;
  onDelete: (key: string) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  copiedKey,
  deletingKey,
  onPreview,
  onCopyUrl,
  onDelete,
}) => {
  const isVideo = item.mediaType === 'VIDEO' || item.fileUrl.endsWith('.mp4') || item.fileUrl.endsWith('.webm');
  const formattedSize = item.fileSize ? `${(item.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'N/A';
  const isDeleting = deletingKey === item.fileKey;

  return (
    <div className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-[#393a3b] bg-gray-100 dark:bg-[#18191a] aspect-square flex flex-col justify-between shadow-sm hover:shadow-md transition">
      {/* Media Preview */}
      {isVideo ? (
        <video src={item.fileUrl} className="w-full h-full object-cover" muted />
      ) : (
        <img
          src={item.fileUrl}
          alt={item.originalFilename || 'Media'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/default-avatar.png';
          }}
        />
      )}

      {/* Type Badge */}
      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white flex items-center space-x-1">
        {isVideo ? <Video className="w-3 h-3 text-red-400" /> : <ImageIcon className="w-3 h-3 text-blue-400" />}
        <span>{item.folder || 'media'}</span>
      </div>

      {/* Size Overlay */}
      <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-gray-200 font-mono">
        {formattedSize}
      </div>

      {/* Hover Actions Bar Overlay */}
      <MediaCardActionsOverlay
        item={item}
        copiedKey={copiedKey}
        isDeleting={isDeleting}
        onPreview={onPreview}
        onCopyUrl={onCopyUrl}
        onDelete={onDelete}
      />
    </div>
  );
};
