import React from 'react';
import { ArchiveModalProps } from './types';
import { useArchiveData } from './useArchiveData';
import { ArchiveHeader } from './ArchiveHeader';
import { ArchivedPostsList } from './ArchivedPostsList';
import { ArchiveStorageTab } from './ArchiveStorageTab';

export const ArchiveModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  onClose,
  userId,
  onPostRestored,
}) => {
  const {
    activeTab,
    setActiveTab,
    archivedPosts,
    loadingPosts,
    restoringId,
    deletingId,
    handleRestore,
    handleDeletePost,
    loadAllData,
    // Storage & Media
    quota,
    mediaList,
    loadingStorage,
    previewMedia,
    setPreviewMedia,
    copiedKey,
    deletingKey,
    handleCopyUrl,
    handleDeleteMedia,
  } = useArchiveData({ userId, isOpen, onPostRestored });

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 animate-fade-in cursor-pointer"
    >
      {/* Stable fixed-height modal container (prevents jitter/jumping between tabs) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#242526] rounded-2xl w-full max-w-4xl h-[660px] max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 dark:border-[#393a3b] overflow-hidden cursor-default"
      >
        {/* Header */}
        <ArchiveHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          archivedCount={archivedPosts.length}
          mediaCount={mediaList.length}
          loading={activeTab === 'media' ? loadingStorage : loadingPosts}
          onRefresh={loadAllData}
          onClose={onClose}
        />

        {/* Stable Tab Body Area */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Tab 1: Archived Posts (Bài viết đã lưu trữ) */}
          {activeTab === 'archived' && (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden animate-fade-in">
              <ArchivedPostsList
                posts={archivedPosts}
                loading={loadingPosts}
                restoringId={restoringId}
                deletingId={deletingId}
                onRestore={handleRestore}
                onDelete={handleDeletePost}
              />
            </div>
          )}

          {/* Tab 2: Media Gallery & Storage Quota (Thư viện media & Dung lượng) */}
          {activeTab === 'media' && (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden animate-fade-in">
              <ArchiveStorageTab
                quota={quota}
                mediaList={mediaList}
                loading={loadingStorage}
                copiedKey={copiedKey}
                deletingKey={deletingKey}
                previewMedia={previewMedia}
                setPreviewMedia={setPreviewMedia}
                onCopyUrl={handleCopyUrl}
                onDelete={handleDeleteMedia}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
