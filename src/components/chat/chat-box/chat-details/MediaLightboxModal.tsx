import React, { useEffect } from 'react';
import { X, Download, ExternalLink, Play } from 'lucide-react';
import { SharedMediaItem } from './types';

interface MediaLightboxModalProps {
  media: SharedMediaItem | null;
  onClose: () => void;
}

export const MediaLightboxModal: React.FC<MediaLightboxModalProps> = ({ media, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!media) return null;

  const isVideo = media.type === 'VIDEO';

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-xs flex flex-col items-center justify-between p-3 sm:p-5 select-none animate-fadeIn"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        className="w-full max-w-4xl flex items-center justify-between text-white py-2 shrink-0 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col min-w-0 pr-3">
          <span className="text-xs sm:text-sm font-semibold truncate">
            {media.senderName ? `Gửi bởi ${media.senderName}` : 'File phương tiện'}
          </span>
          <span className="text-[11px] text-gray-400">{media.time}</span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <a
            href={media.url}
            download={media.fileName || (isVideo ? 'video.mp4' : 'image.jpg')}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Tải về"
          >
            <Download className="w-4 h-4" />
          </a>
          <a
            href={media.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Mở trong tab mới"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Đóng (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        className="flex-1 w-full max-w-4xl flex items-center justify-center min-h-0 overflow-hidden my-2"
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <video
            src={media.url}
            controls
            autoPlay
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          />
        ) : (
          <img
            src={media.url}
            alt={media.fileName || 'Shared photo'}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl transition duration-200"
          />
        )}
      </div>

      {/* Bottom Hint */}
      <div className="text-[11px] text-gray-400 py-1 shrink-0">
        Nhấn phím <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-300">Esc</kbd> hoặc nhấp ra ngoài để đóng
      </div>
    </div>
  );
};
