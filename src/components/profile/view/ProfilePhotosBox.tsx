import React, { useState } from 'react';
import { MediaLightbox } from '../../post/MediaLightbox';

interface ProfilePhotosBoxProps {
  photos: string[];
  onSeeAllPhotos: () => void;
}

export const ProfilePhotosBox: React.FC<ProfilePhotosBoxProps> = ({
  photos,
  onSeeAllPhotos,
}) => {
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleImageError = (url: string) => {
    setFailedUrls((prev) => {
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  const validPhotos = photos.filter((url) => !failedUrls.has(url));

  const lightboxItems = validPhotos.map((url) => ({
    url,
    video: false,
  }));

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 shadow-xs border border-gray-200 dark:border-[#393a3b] transition">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-extrabold text-base text-gray-900 dark:text-[#e4e6eb]">
          Ảnh
        </h3>
        {validPhotos.length > 0 && (
          <button
            type="button"
            onClick={onSeeAllPhotos}
            className="text-xs font-semibold text-[#1877f2] dark:text-[#4599ff] hover:underline cursor-pointer"
          >
            Xem tất cả ảnh
          </button>
        )}
      </div>

      {validPhotos.length > 0 ? (
        <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
          {validPhotos.slice(0, 9).map((photo, i) => (
            <div
              key={`${photo}-${i}`}
              onClick={() => setLightboxIndex(i)}
              className="aspect-square bg-gray-100 dark:bg-[#3a3b3c] overflow-hidden group cursor-pointer"
            >
              <img
                src={photo}
                alt="Ảnh cá nhân"
                loading="lazy"
                onError={() => handleImageError(photo)}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-xs text-gray-400 dark:text-[#8a8d91]">
          Chưa có ảnh nào được đăng tải.
        </div>
      )}

      {lightboxIndex !== null && (
        <MediaLightbox
          items={lightboxItems}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
};
