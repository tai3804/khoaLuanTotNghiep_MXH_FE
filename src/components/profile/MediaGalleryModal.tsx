import React from 'react';
import {
  MediaGalleryHeader,
  StorageQuotaBar,
  MediaGridContent,
  MediaLightboxModal,
  useMediaGallery,
} from './media-gallery';

interface MediaGalleryModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const MediaGalleryModal: React.FC<MediaGalleryModalProps> = ({
  userId,
  isOpen,
  onClose,
}) => {
  const {
    quota,
    mediaList,
    loading,
    deletingKey,
    copiedKey,
    previewMedia,
    setPreviewMedia,
    loadMediaData,
    handleDelete,
    handleCopyUrl,
  } = useMediaGallery({ userId, isOpen });

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#242526] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 dark:border-[#393a3b] overflow-hidden cursor-default"
      >
        {/* Header */}
        <MediaGalleryHeader
          loading={loading}
          onRefresh={loadMediaData}
          onClose={onClose}
        />

        {/* Quota Progress Bar Banner */}
        {quota && <StorageQuotaBar quota={quota} />}

        {/* Gallery Grid Content */}
        <MediaGridContent
          loading={loading}
          mediaList={mediaList}
          copiedKey={copiedKey}
          deletingKey={deletingKey}
          onPreview={setPreviewMedia}
          onCopyUrl={handleCopyUrl}
          onDelete={handleDelete}
        />
      </div>

      {/* Media Detail Lightbox Modal */}
      <MediaLightboxModal
        media={previewMedia}
        onClose={() => setPreviewMedia(null)}
      />
    </div>
  );
};
