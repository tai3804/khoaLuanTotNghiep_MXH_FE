import React from 'react';
import { RefreshCw, X } from 'lucide-react';

interface MediaGalleryHeaderActionsProps {
  loading: boolean;
  onRefresh: () => void;
  onClose: () => void;
}

export const MediaGalleryHeaderActions: React.FC<MediaGalleryHeaderActionsProps> = ({
  loading,
  onRefresh,
  onClose,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        onClick={onRefresh}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#3a3b3c] text-gray-500 dark:text-[#b0b3b8] transition cursor-pointer"
        title="Làm mới"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      </button>
      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#3a3b3c] text-gray-500 dark:text-[#b0b3b8] transition cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
