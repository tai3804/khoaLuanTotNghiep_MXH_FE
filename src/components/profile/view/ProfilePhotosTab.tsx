import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { MediaLightbox } from '../../post/MediaLightbox';

interface ProfilePhotosTabProps {
  allPostPhotos: string[];
  fullName: string;
}

export const ProfilePhotosTab: React.FC<ProfilePhotosTabProps> = ({
  allPostPhotos,
  fullName,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleImageError = (url: string) => {
    setFailedUrls((prev) => {
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  const validPhotos = allPostPhotos.filter((url) => !failedUrls.has(url));

  const lightboxItems = validPhotos.map((url) => ({
    url,
    video: false,
  }));

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-6 shadow-xs border border-gray-200 dark:border-[#393a3b] max-w-5xl mx-auto">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#393a3b] mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-[#e4e6eb]">
          {isEn ? `Photos of ${fullName}` : `Ảnh của ${fullName}`}
        </h2>
        {validPhotos.length > 0 && (
          <span className="text-xs text-gray-500 dark:text-[#b0b3b8] font-medium">
            {isEn ? `${validPhotos.length} photos` : `${validPhotos.length} ảnh`}
          </span>
        )}
      </div>

      {validPhotos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {validPhotos.map((photo, i) => (
            <div
              key={`${photo}-${i}`}
              onClick={() => setLightboxIndex(i)}
              className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-[#3a3b3c] group cursor-pointer"
            >
              <img
                src={photo}
                alt={isEn ? 'User photo' : 'Ảnh người dùng'}
                loading="lazy"
                onError={() => handleImageError(photo)}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-[#8a8d91]">
          {isEn ? 'No photos posted yet.' : 'Chưa có ảnh nào được đăng tải.'}
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
