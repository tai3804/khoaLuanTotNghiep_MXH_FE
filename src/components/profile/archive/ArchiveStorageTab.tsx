import React from 'react';
import { StorageQuotaBar, MediaGridContent, MediaLightboxModal } from '../media-gallery';
import { UserStorageQuota, MediaItem } from '../../../services/mediaService';

interface ArchiveStorageTabProps {
  quota: UserStorageQuota | null;
  mediaList: MediaItem[];
  loading: boolean;
  copiedKey: string | null;
  deletingKey: string | null;
  previewMedia: MediaItem | null;
  setPreviewMedia: (media: MediaItem | null) => void;
  onCopyUrl: (url: string, key: string) => void;
  onDelete: (key: string) => void;
}

export const ArchiveStorageTab: React.FC<ArchiveStorageTabProps> = ({
  quota,
  mediaList,
  loading,
  copiedKey,
  deletingKey,
  previewMedia,
  setPreviewMedia,
  onCopyUrl,
  onDelete,
}) => {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Storage quota progress banner */}
      {quota && <StorageQuotaBar quota={quota} />}

      {/* Media Grid Content */}
      <div className="flex-1 overflow-y-auto max-h-[calc(85vh-220px)]">
        <MediaGridContent
          loading={loading}
          mediaList={mediaList}
          copiedKey={copiedKey}
          deletingKey={deletingKey}
          onPreview={setPreviewMedia}
          onCopyUrl={onCopyUrl}
          onDelete={onDelete}
        />
      </div>

      {/* Media detail preview lightbox */}
      <MediaLightboxModal
        media={previewMedia}
        onClose={() => setPreviewMedia(null)}
      />
    </div>
  );
};
