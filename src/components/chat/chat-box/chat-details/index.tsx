import React, { useEffect } from 'react';
import { Message } from '../useChatBoxData';
import { ChatUser } from '../types';
import { chatPrefId, DEFAULT_EMOJI, DEFAULT_THEME, themeColor, useChatPref } from '../chatPrefs';
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
  const prefId = chatPrefId(friend);
  const [muted, setMuted] = useChatPref('muted', prefId, '0');
  const [quickEmoji, setQuickEmoji] = useChatPref('emoji', prefId, DEFAULT_EMOJI);
  const [themeId, setThemeId] = useChatPref('theme', prefId, DEFAULT_THEME.id);
  const isMuted = muted === '1';
  const toggleMute = () => setMuted(isMuted ? '0' : '1');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
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
    loadDeeperHistory,
    isLoadingMore,
    hasLoadedFullHistory,
    totalMediaCount,
    totalFilesCount,
    totalLinksCount,
  } = useChatDetailsData({ messages, conversationId });

  if (!isOpen) return null;

  const tabs: { key: ChatDetailsTab; label: string; count?: number }[] = [
    { key: 'MEDIA', label: 'Ảnh & Video', count: totalMediaCount },
    { key: 'FILES', label: 'File', count: totalFilesCount },
    { key: 'LINKS', label: 'Liên kết', count: totalLinksCount },
    { key: 'CUSTOMIZE', label: 'Tùy chỉnh' },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-black/60 dark:bg-black/75" onClick={onClose} />

      <div
        role="dialog"
        aria-label="Thông tin cuộc trò chuyện"
        style={{ '--chat-accent': themeColor(themeId) } as React.CSSProperties}
        className="relative w-full max-w-2xl h-[min(80vh,620px)] flex flex-col bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#393a3b] overflow-hidden animate-scaleIn"
      >
        <ChatDetailsHeader
          friend={friend}
          memberCount={memberCount}
          onClose={onClose}
          onNavigateProfile={onNavigateProfile}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />

        {/* Tab dạng gạch chân như Messenger */}
        <div role="tablist" className="flex px-3 border-b border-gray-200 dark:border-[#393a3b] shrink-0 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex-1 min-w-[96px] py-3 px-2 text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                  active
                    ? 'text-[var(--chat-accent)]'
                    : 'text-gray-500 dark:text-[#b0b3b8] hover:text-gray-900 dark:hover:text-[#e4e6eb]'
                }`}
              >
                {tab.label}
                {tab.count ? <span className="ml-1.5 text-xs font-medium opacity-70">{tab.count}</span> : null}
                {active && <span className="absolute left-2 right-2 -bottom-px h-[3px] rounded-full bg-[var(--chat-accent)]" />}
              </button>
            );
          })}
        </div>

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
              themeId={themeId}
              onSelectTheme={setThemeId}
              quickEmoji={quickEmoji}
              onSelectQuickEmoji={setQuickEmoji}
              isMuted={isMuted}
              onToggleMute={toggleMute}
            />
          )}
        </div>
      </div>

      <MediaLightboxModal media={selectedMedia} onClose={() => setSelectedMedia(null)} />
    </div>
  );
};

export { ChatDetailsModal as ChatDetailsPanel };
