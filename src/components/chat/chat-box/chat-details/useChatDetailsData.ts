import { useState, useMemo, useCallback } from 'react';
import { Message } from '../useChatBoxData';
import { SharedMediaItem, SharedFileItem, SharedLinkItem, ChatDetailsTab } from './types';
import { chatService } from '../../../../services/chatService';
import { attachmentName, classifyAttachment, fileExt } from '../chatAttachment';

interface UseChatDetailsDataProps {
  messages: Message[];
  conversationId?: string | null;
}

export const useChatDetailsData = ({ messages, conversationId }: UseChatDetailsDataProps) => {
  const [activeTab, setActiveTab] = useState<ChatDetailsTab>('MEDIA');
  const [selectedMedia, setSelectedMedia] = useState<SharedMediaItem | null>(null);
  const [extraMessages, setExtraMessages] = useState<Message[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasLoadedFullHistory, setHasLoadedFullHistory] = useState(false);

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

  // 1. Shared Media (Photos & Videos) và 2. Shared Files: cùng cách phân loại với khung chat
  const sharedMedia = useMemo<SharedMediaItem[]>(() => {
    const list: SharedMediaItem[] = [];
    for (const m of allMessages) {
      if (m.deleted) continue;
      const kind = classifyAttachment(m);
      if (kind !== 'image' && kind !== 'video') continue;
      const url = m.mediaUrl || m.text;
      if (!url) continue;
      list.push({
        id: m.id,
        url,
        type: kind === 'video' ? 'VIDEO' : 'IMAGE',
        time: m.time,
        senderName: m.senderName,
        fileName: m.fileName,
      });
    }
    return list;
  }, [allMessages]);

  const sharedFiles = useMemo<SharedFileItem[]>(() => {
    const list: SharedFileItem[] = [];
    for (const m of allMessages) {
      if (m.deleted || classifyAttachment(m) !== 'file') continue;
      const url = m.mediaUrl || m.text;
      if (!url) continue;
      const fileName = attachmentName(m) || 'Tệp đính kèm';
      list.push({
        id: m.id,
        url,
        fileName,
        fileSize: m.fileSize,
        time: m.time,
        senderName: m.senderName,
        extension: (fileExt(fileName) || fileExt(url) || 'file').toUpperCase(),
      });
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
    loadDeeperHistory,
    isLoadingMore,
    hasLoadedFullHistory,
    totalMediaCount: sharedMedia.length,
    totalFilesCount: sharedFiles.length,
    totalLinksCount: sharedLinks.length,
  };
};
