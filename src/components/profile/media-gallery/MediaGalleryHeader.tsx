import React from 'react';
import { MediaGalleryHeaderTitle } from './MediaGalleryHeaderTitle';
import { MediaGalleryHeaderActions } from './MediaGalleryHeaderActions';

interface MediaGalleryHeaderProps {
  loading: boolean;
  onRefresh: () => void;
  onClose: () => void;
}

export const MediaGalleryHeader: React.FC<MediaGalleryHeaderProps> = ({
  loading,
  onRefresh,
  onClose,
}) => {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-[#393a3b] flex items-center justify-between bg-gray-50/50 dark:bg-[#18191a]">
      <MediaGalleryHeaderTitle />
      <MediaGalleryHeaderActions
        loading={loading}
        onRefresh={onRefresh}
        onClose={onClose}
      />
    </div>
  );
};
