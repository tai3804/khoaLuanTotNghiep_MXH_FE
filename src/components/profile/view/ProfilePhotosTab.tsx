import React from 'react';

interface ProfilePhotosTabProps {
  allPostPhotos: string[];
  fullName: string;
}

export const ProfilePhotosTab: React.FC<ProfilePhotosTabProps> = ({
  allPostPhotos,
  fullName,
}) => {
  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-[#393a3b] max-w-5xl mx-auto">
      <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb] pb-3 border-b border-gray-100 dark:border-[#393a3b] mb-6">
        Ảnh của {fullName}
      </h2>
      {allPostPhotos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {allPostPhotos.map((photo, i) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-[#3a3b3c] group">
              <img
                src={photo}
                alt="User photo"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-200 cursor-pointer"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-[#8a8d91]">
          Chưa có ảnh nào được đăng tải.
        </div>
      )}
    </div>
  );
};
