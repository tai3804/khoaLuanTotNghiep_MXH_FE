import { useState, useMemo, useEffect, useCallback } from 'react';
import { Message } from '../useChatBoxData';
import { ChatUser } from '../types';
import { SharedMediaItem, SharedFileItem, SharedLinkItem, ChatDetailsTab } from './types';
import { chatService } from '../../../../services/chatService';

interface UseChatDetailsDataProps {
  messages: Message[];
  conversationId?: string | null;
  friend: ChatUser;
}

export const useChatDetailsData = ({ messages, conversationId, friend }: UseChatDetailsDataProps) => {
  const [activeTab, setActiveTab] = useState<ChatDetailsTab>('MEDIA');
  const [selectedMedia, setSelectedMedia] = useState<SharedMediaItem | null>(null);
  const [extraMessages, setExtraMessages] = useState<Message[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasLoadedFullHistory, setHasLoadedFullHistory] = useState(false);

  // Quick Emoji customization saved per conversation
  const emojiStorageKey = conversationId ? `chat_emoji_${conversationId}` : `chat_emoji_${friend.id}`;
  const [quickEmoji, setQuickEmojiState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(emojiStorageKey) || '👍';
    }
    return '👍';
  });

  const setQuickEmoji = useCallback((emoji: string) => {
    setQuickEmojiState(emoji);
    if (typeof window !== 'undefined') {
      localStorage.setItem(emojiStorageKey, emoji);
      window.dispatchEvent(new CustomEvent('chat_quick_emoji_changed', {
        detail: { conversationId, emoji }
      }));
    }
  }, [emojiStorageKey, conversationId]);

  // Combined messages list (current loaded messages + any deep scanned messages)
  const allMessages = useMemo(() => {
    const map = new Map<string, Message>();
    for (const m of messages) {
      if (m?.id) map.set(m.id, m);
    }
    for (const m of extraMessages) {
      if (m?.id && !map.has(m.id)) map.set(m.id, m);
    }
    return Array.from(map.values());
  }, [messages, extraMessages]);

  // 1. Shared Media (Photos & Videos)
  const sharedMedia = useMemo<SharedMediaItem[]>(() => {
    const list: SharedMediaItem[] = [];
    const mediaRegex = /\.(jpg|jpeg|png|webp|gif|mp4|webm|mov|quicktime)($|\?)/i;

    for (const m of allMessages) {
      if (m.deleted) continue;
      const url = m.mediaUrl || (m.text && m.text.startsWith('http') && mediaRegex.test(m.text) ? m.text : null);
      if (!url) continue;

      const isVideo = m.type === 'VIDEO' || /\.(mp4|webm|mov)($|\?)/i.test(url);
      const isImage = m.type === 'IMAGE' || /\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(url);

      if (isVideo || isImage || (!m.type?.includes('FILE') && !m.type?.includes('AUDIO'))) {
        list.push({
          id: m.id,
          url,
          type: isVideo ? 'VIDEO' : 'IMAGE',
          time: m.time,
          senderName: m.senderName,
          fileName: m.fileName,
        });
      }
    }
    return list;
  }, [allMessages]);

  // 2. Shared Files (Documents, Archives, Spreadsheets)
  const sharedFiles = useMemo<SharedFileItem[]>(() => {
    const list: SharedFileItem[] = [];
    const docRegex = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar|7z|tar|gz|csv)($|\?)/i;

    for (const m of allMessages) {
      if (m.deleted) continue;
      const url = m.mediaUrl || (m.text && m.text.startsWith('http') && docRegex.test(m.text) ? m.text : null);
      const isExplicitFile = m.type === 'FILE' || (url && docRegex.test(url)) || Boolean(m.fileName && docRegex.test(m.fileName));

      if (isExplicitFile && url) {
        const inferredName = m.fileName || url.split('/').pop()?.split('?')[0] || 'Attachment';
        const ext = inferredName.includes('.') ? inferredName.split('.').pop()?.toUpperCase() || 'FILE' : 'FILE';

        list.push({
          id: m.id,
          url,
          fileName: inferredName,
          fileSize: m.fileSize,
          time: m.time,
          senderName: m.senderName,
          extension: ext,
        });
      }
    }
    return list;
  }, [allMessages]);

  // 3. Shared Links
  const sharedLinks = useMemo<SharedLinkItem[]>(() => {
    const list: SharedLinkItem[] = [];
    const urlRegex = /(https?:\/\/[^\s]+)/gi;

    for (const m of allMessages) {
      if (m.deleted || !m.text) continue;
      const matches = m.text.match(urlRegex);
      if (matches) {
        for (const fullUrl of matches) {
          // Avoid duplicate image/video URLs that are already in Media
          const isDirectMedia = /\.(jpg|jpeg|png|webp|gif|mp4|mov)$/i.test(fullUrl);
          if (isDirectMedia) continue;

          let domain = 'link';
          try {
            const parsed = new URL(fullUrl);
            domain = parsed.hostname.replace(/^www\./, '');
          } catch {
            domain = 'web';
          }

          list.push({
            id: `${m.id}-${fullUrl}`,
            url: fullUrl,
            domain,
            snippet: m.text.length > 80 ? `${m.text.slice(0, 80)}...` : m.text,
            time: m.time,
            senderName: m.senderName,
          });
        }
      }
    }
    return list;
  }, [allMessages]);

  // Optionally load deeper conversation history to discover more media
  const loadDeeperHistory = useCallback(async () => {
    if (!conversationId || isLoadingMore || hasLoadedFullHistory) return;
    setIsLoadingMore(true);
    try {
      // Query page 1 and 2 to retrieve up to 100 older messages
      const olderPage = await chatService.getMessages(conversationId, 1, 50);
      if (Array.isArray(olderPage) && olderPage.length > 0) {
        setExtraMessages((prev) => [...prev, ...olderPage]);
      } else {
        setHasLoadedFullHistory(true);
      }
    } catch (err) {
      console.warn('[useChatDetailsData] Failed to load older history:', err);
      setHasLoadedFullHistory(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [conversationId, isLoadingMore, hasLoadedFullHistory]);

  return {
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
    totalMediaCount: sharedMedia.length,
    totalFilesCount: sharedFiles.length,
    totalLinksCount: sharedLinks.length,
  };
};
