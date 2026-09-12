import React from 'react';
import { X } from 'lucide-react';
import { MediaItem } from '../../../services/mediaService';

interface MediaLightboxModalProps {
  media: MediaItem | null;
  onClose: () => void;
}

export const MediaLightboxModal: React.FC<MediaLightboxModalProps> = ({ media, onClose }) => {
  if (!media) return null;

  const isVideo = media.mediaType === 'VIDEO' || media.fileUrl.endsWith('.mp4') || media.fileUrl.endsWith('.webm');

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-60 bg-black/90 p-4 flex items-center justify-center cursor-pointer animate-fade-in"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition cursor-pointer"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-3xl w-full max-h-[85vh] flex flex-col items-center cursor-default"
      >
        {isVideo ? (
          <video
            src={media.fileUrl}
            controls
            autoPlay
            className="max-h-[75vh] w-auto rounded-xl shadow-2xl"
          />
        ) : (
          <img
            src={media.fileUrl}
            alt="Preview"
            className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl"
          />
        )}

        <div className="mt-3 text-center text-white space-y-1">
          <p className="text-xs font-semibold">{media.originalFilename || 'Chi tiết file media'}</p>
          <p className="text-[11px] text-gray-400 font-mono truncate max-w-xl">{media.fileUrl}</p>
        </div>
      </div>
    </div>
  );
};
