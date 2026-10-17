import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, FileText, Link2, Settings2 } from 'lucide-react';
import { Message } from '../useChatBoxData';
import { ChatUser } from '../types';
import { useChatDetailsData } from './useChatDetailsData';
import { ChatDetailsHeader } from './ChatDetailsHeader';
import { SharedMediaSection } from './SharedMediaSection';
import { SharedFilesSection } from './SharedFilesSection';
import { SharedLinksSection } from './SharedLinksSection';
import { ChatCustomizationSection } from './ChatCustomizationSection';
import { MediaLightboxModal } from './MediaLightboxModal';
import { ChatDetailsTab } from './types';

export interface ChatDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: ChatUser;
  messages: Message[];
  conversationId?: string | null;
  memberCount?: number;
  onNavigateProfile?: (userId?: string) => void;
}

export const ChatDetailsModal: React.FC<ChatDetailsModalProps> = ({
  isOpen,
  onClose,
  friend,
  messages,
  conversationId,
  memberCount,
  onNavigateProfile,
}) => {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const {
    activeTab,
    setActiveTab,
    sharedMedia,
    sharedFiles,
    sharedLinks,
    selectedMedia,
    setSelectedMedia,
    quickEmoji,
    setQuickEmoji,
    loadDeeperHistory,
    isLoadingMore,
    hasLoadedFullHistory,
    totalMediaCount,
    totalFilesCount,
    totalLinksCount,
  } = useChatDetailsData({ messages, conversationId, friend });

  if (!isOpen) return null;

  const tabs: { key: ChatDetailsTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      key: 'MEDIA',
      label: 'Ảnh & Video',
      icon: <ImageIcon className="w-4 h-4" />,
      badge: totalMediaCount,
    },
    {
      key: 'FILES',
      label: 'File tài liệu',
      icon: <FileText className="w-4 h-4" />,
      badge: totalFilesCount,
    },
    {
      key: 'LINKS',
      label: 'Liên kết',
      icon: <Link2 className="w-4 h-4" />,
      badge: totalLinksCount,
    },
    {
      key: 'CUSTOMIZE',
      label: 'Tùy chỉnh',
      icon: <Settings2 className="w-4 h-4" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      {/* Dark backdrop blur */}
      <div
        className="absolute inset-0 bg-black/65 dark:bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Main Spacious Modal Window */}
      <div className="relative bg-white dark:bg-[#242526] w-full max-w-2xl lg:max-w-3xl rounded-2xl shadow-2xl border border-gray-200 dark:border-[#393a3b] flex flex-col h-[85vh] max-h-[720px] overflow-hidden z-10 animate-scaleIn">
        {/* 1. Profile Overview Header */}
        <ChatDetailsHeader
          friend={friend}
          memberCount={memberCount}
          onClose={onClose}
          onNavigateProfile={onNavigateProfile}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted((prev) => !prev)}
        />

        {/* 2. Spacious Messenger-style Tabs */}
        <div className="flex items-center px-4 py-2 bg-gray-50 dark:bg-[#1e1f20] border-b border-gray-200 dark:border-[#393a3b] gap-2 shrink-0 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-[#3a3b3c] text-[#1877f2] dark:text-[#4599ff] shadow-sm'
                    : 'text-gray-600 dark:text-[#b0b3b8] hover:text-gray-900 dark:hover:text-[#e4e6eb] hover:bg-gray-200/60 dark:hover:bg-[#2d2e30]'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="truncate">{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-[#1877f2]/10 text-[#1877f2] dark:bg-[#4599ff]/20 dark:text-[#4599ff]'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 3. Tab Contents with smooth scrolling */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {activeTab === 'MEDIA' && (
            <SharedMediaSection
              mediaList={sharedMedia}
              onSelectMedia={(item) => setSelectedMedia(item)}
              onLoadMoreHistory={loadDeeperHistory}
              isLoadingMore={isLoadingMore}
              hasLoadedFull={hasLoadedFullHistory}
            />
          )}

          {activeTab === 'FILES' && (
            <SharedFilesSection
              fileList={sharedFiles}
              onLoadMoreHistory={loadDeeperHistory}
              isLoadingMore={isLoadingMore}
              hasLoadedFull={hasLoadedFullHistory}
            />
          )}

          {activeTab === 'LINKS' && (
            <SharedLinksSection
              linkList={sharedLinks}
              onLoadMoreHistory={loadDeeperHistory}
              isLoadingMore={isLoadingMore}
              hasLoadedFull={hasLoadedFullHistory}
            />
          )}

          {activeTab === 'CUSTOMIZE' && (
            <ChatCustomizationSection
              quickEmoji={quickEmoji}
              onSelectQuickEmoji={setQuickEmoji}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted((prev) => !prev)}
            />
          )}
        </div>
      </div>

      {/* 4. Full size Lightbox Modal when viewing photo/video */}
      <MediaLightboxModal
        media={selectedMedia}
        onClose={() => setSelectedMedia(null)}
      />
    </div>
  );
};

export { ChatDetailsModal as ChatDetailsPanel };
