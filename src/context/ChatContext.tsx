import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { chatService } from '../services/chatService';
import { userService, fetchAuthorProfile, authorProfileCache } from '../services/userService';
import { websocketService } from '../services/websocket';
import { ChatUser } from '../components/chat/chat-box/types';

export interface ChatContextType {
  conversations: ChatUser[];
  loadingConversations: boolean;
  totalUnreadCount: number;
  refreshConversations: (silent?: boolean) => Promise<void>;
  updateConversationLastMessage: (
    conversationId: string,
    content: string,
    createdAt?: string,
    senderId?: string
  ) => void;
  recordOutgoingMessage: (conversationId: string, content: string) => void;
  markConversationAsRead: (conversationId: string, messageId?: string) => Promise<void>;
  addOrUpdateConversation: (conv: Partial<ChatUser> & { conversationId: string }) => void;
  registerActiveChat: (conversationId: string) => void;
  unregisterActiveChat: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<ChatUser[]>([]);
  const conversationsRef = useRef<ChatUser[]>([]);
  conversationsRef.current = conversations;
  const [loadingConversations, setLoadingConversations] = useState<boolean>(false);
  const activeChatIdsRef = useRef<Set<string>>(new Set());
  const initialFetchDoneRef = useRef<boolean>(false);
  const subscribedConvIdsRef = useRef<Set<string>>(new Set());

  const registerActiveChat = useCallback((convId: string) => {
    if (convId) activeChatIdsRef.current.add(String(convId));
  }, []);

  const unregisterActiveChat = useCallback((convId: string) => {
    if (convId) activeChatIdsRef.current.delete(String(convId));
  }, []);

  // Total unread count across all conversations
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, c) => acc + Number(c.unreadCount || 0), 0);
  }, [conversations]);

  // Fetch conversations once (or on silent refresh)
  const refreshConversations = useCallback(
    async (silent = false) => {
      if (!isAuthenticated) return;
      if (!silent && conversationsRef.current.length === 0) {
        setLoadingConversations(true);
      }

      try {
        const convs = await chatService.getConversations();
        if (Array.isArray(convs)) {
          const directUserIdsToBatch: string[] = [];
          convs.forEach((c: any) => {
            const otherId = c.otherParticipantId || c.other_participant_id || c.partnerId;
            if (c.type === 'DIRECT' && otherId) {
              directUserIdsToBatch.push(String(otherId));
            }
          });

          // Fetch profiles batch in 1 single call for efficiency
          let batchProfiles: Record<string, any> = {};
          if (directUserIdsToBatch.length > 0) {
            try {
              batchProfiles = await userService.getProfilesBatch(directUserIdsToBatch);
            } catch {}
          }

          // Fetch presence batch in 1 single call
          let presenceMap: Record<string, any> = {};
          if (directUserIdsToBatch.length > 0) {
            try {
              presenceMap = await chatService.getBatchPresence(directUserIdsToBatch);
            } catch {}
          }

          const mapped: ChatUser[] = convs.map((c: any) => {
            let name = c.name;
            let avatar = c.avatarUrl;
            const otherId = c.otherParticipantId || c.other_participant_id || c.partnerId;

            if (c.type === 'DIRECT' && otherId) {
              const sOtherId = String(otherId);
              const prof = batchProfiles[sOtherId] || authorProfileCache[sOtherId];
              if (prof) {
                name = prof.name || prof.fullName || name;
                avatar = prof.avatar || avatar;
              }
            }

            const isGroup = c.type === 'GROUP';
            const presence = otherId ? presenceMap[String(otherId)] : null;
            const online = isGroup ? false : Boolean(presence ? presence.online : c.isOnline);
            const lastActiveAt = presence?.lastActiveAt || c.otherLastActiveAt || null;

            return {
              id: isGroup ? c.conversationId : (otherId || c.conversationId),
              userId: otherId,
              conversationId: c.conversationId,
              isGroup,
              name: name || (isGroup ? 'Nhóm trò chuyện' : 'Người dùng'),
              avatar: avatar || '/default-avatar.png',
              online,
              lastActiveAt,
              lastMessageContent: c.lastMessageContent,
              lastMessageAt: c.lastMessageAt || null,
              unreadCount: Number(c.unreadCount || 0),
            } as ChatUser;
          });

          // Sort: newest messages first
          mapped.sort((a, b) => {
            const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
            const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
            if (timeA !== timeB) return timeB - timeA;
            if (a.lastMessageContent && !b.lastMessageContent) return -1;
            if (!a.lastMessageContent && b.lastMessageContent) return 1;
            return 0;
          });

          // Deduplicate
          const seen = new Set<string>();
          const deduped: ChatUser[] = [];
          for (const item of mapped) {
            const key = item.isGroup ? `group_${item.conversationId}` : `direct_${item.userId || item.id}`;
            if (!seen.has(key)) {
              seen.add(key);
              deduped.push(item);
            }
          }

          setConversations(deduped);
        }
      } catch (err) {
        console.warn('[ChatContext] Failed to load conversations:', err);
      } finally {
        if (!silent) {
          setLoadingConversations(false);
        }
      }
    },
    [isAuthenticated]
  );

  // Initial load on authentication
  useEffect(() => {
    if (isAuthenticated) {
      if (!initialFetchDoneRef.current) {
        initialFetchDoneRef.current = true;
        refreshConversations(false);
      }
    } else {
      initialFetchDoneRef.current = false;
      setConversations((prev) => (prev.length > 0 ? [] : prev));
      activeChatIdsRef.current.clear();
      subscribedConvIdsRef.current.clear();
    }
  }, [isAuthenticated, refreshConversations]);

  // Update a conversation's last message and move it to index 0 immediately (Messenger style)
  const updateConversationLastMessage = useCallback(
    (convId: string, content: string, createdAt?: string, senderId?: string) => {
      setConversations((prev) => {
        const idStr = String(convId);
        const idx = prev.findIndex(
          (c) => String(c.conversationId) === idStr || String(c.id) === idStr || String(c.userId) === idStr
        );
        const isFromMe = user?.id && senderId && String(senderId) === String(user.id);
        const isCurrentlyOpen = activeChatIdsRef.current.has(idStr);

        if (idx >= 0) {
          const current = prev[idx];
          const target: ChatUser = {
            ...current,
            lastMessageContent: content,
            lastMessageAt: createdAt || new Date().toISOString(),
            unreadCount:
              !isFromMe && !isCurrentlyOpen
                ? Number(current.unreadCount || 0) + 1
                : Number(current.unreadCount || 0),
          };
          const rest = prev.filter((_, i) => i !== idx);
          return [target, ...rest];
        } else {
          // If conversation wasn't found in existing list, fetch in background
          refreshConversations(true);
          return prev;
        }
      });
    },
    [user?.id, refreshConversations]
  );

  // Record an outgoing message sent by current user: updates UI immediately without waiting for API
  const recordOutgoingMessage = useCallback(
    (convId: string, content: string) => {
      updateConversationLastMessage(convId, content, new Date().toISOString(), user?.id);
    },
    [updateConversationLastMessage, user?.id]
  );

  // Mark conversation as read locally & on server
  const markConversationAsRead = useCallback(async (convId: string, messageId?: string) => {
    if (!convId) return;
    const idStr = String(convId);
    setConversations((prev) =>
      prev.map((c) => {
        if (String(c.conversationId) === idStr || String(c.id) === idStr || String(c.userId) === idStr) {
          return { ...c, unreadCount: 0 };
        }
        return c;
      })
    );

    try {
      await chatService.markAsRead(convId, messageId);
      window.dispatchEvent(new CustomEvent('chat_conversation_read', { detail: { conversationId: convId } }));
      window.dispatchEvent(new Event('chat_unread_changed'));
    } catch (err) {
      console.warn('[ChatContext] Failed to mark read on server:', err);
    }
  }, []);

  // Add or update an individual conversation (e.g. after group creation or direct chat initiation)
  const addOrUpdateConversation = useCallback((newConv: Partial<ChatUser> & { conversationId: string }) => {
    setConversations((prev) => {
      const convId = String(newConv.conversationId);
      const existingIdx = prev.findIndex(
        (c) => String(c.conversationId) === convId || String(c.id) === convId
      );

      if (existingIdx >= 0) {
        const merged = { ...prev[existingIdx], ...newConv };
        const rest = prev.filter((_, i) => i !== existingIdx);
        return [merged, ...rest];
      }

      const formatted: ChatUser = {
        ...newConv,
        id: newConv.id || newConv.conversationId,
        userId: newConv.userId,
        conversationId: newConv.conversationId,
        isGroup: Boolean(newConv.isGroup),
        name: newConv.name || (newConv.isGroup ? 'Nhóm mới' : 'Người dùng'),
        avatar: newConv.avatar || '/default-avatar.png',
        online: Boolean(newConv.online),
        lastActiveAt: newConv.lastActiveAt ?? null,
        lastMessageContent: newConv.lastMessageContent || '',
        lastMessageAt: newConv.lastMessageAt || new Date().toISOString(),
        unreadCount: Number(newConv.unreadCount || 0),
      };

      return [formatted, ...prev];
    });
  }, []);

  // Real-time synchronization of presence
  useEffect(() => {
    const handlePresence = (e: any) => {
      const detail = e.detail;
      if (!detail || !detail.userId) return;
      const targetUid = String(detail.userId).toLowerCase();
      setConversations((prev) =>
        prev.map((c) => {
          if (!c.isGroup && c.userId && String(c.userId).toLowerCase() === targetUid) {
            return {
              ...c,
              online: Boolean(detail.online),
              lastActiveAt: detail.lastActiveAt || c.lastActiveAt,
            };
          }
          return c;
        })
      );
    };

    window.addEventListener('user_presence_updated', handlePresence);
    return () => window.removeEventListener('user_presence_updated', handlePresence);
  }, []);

  // Real-time incoming WebSocket chat message synchronization
  useEffect(() => {
    const handleIncomingMessage = (e: any) => {
      const payload = e.detail;
      if (!payload || !payload.conversationId) return;

      const convId = String(payload.conversationId);
      let text = payload.content || '';
      if (!text) {
        const msgType = payload.type || '';
        if (msgType === 'IMAGE') text = '📷 [Hình ảnh]';
        else if (msgType === 'VIDEO') text = '🎥 [Video]';
        else if (msgType === 'AUDIO') text = '🎤 [Tin nhắn thoại]';
        else if (msgType === 'FILE') text = '📎 [Tập tin đính kèm]';
      }

      updateConversationLastMessage(convId, text, payload.createdAt, payload.senderId);
    };

    window.addEventListener('kltn_chat_message_received', handleIncomingMessage as EventListener);
    return () => window.removeEventListener('kltn_chat_message_received', handleIncomingMessage as EventListener);
  }, [updateConversationLastMessage]);

  // Keep WebSocket subscribed to all conversation topics in background
  useEffect(() => {
    if (!isAuthenticated || conversations.length === 0) return;

    websocketService.connect().then((connected) => {
      if (connected) {
        conversations.forEach((c) => {
          const cId = c.conversationId ? String(c.conversationId) : null;
          if (cId && !subscribedConvIdsRef.current.has(cId)) {
            subscribedConvIdsRef.current.add(cId);
            websocketService.subscribeToConversation(cId, () => {
              // Internal callback triggers kltn_chat_message_received automatically
            });
          }
        });
      }
    });
  }, [isAuthenticated, conversations]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        loadingConversations,
        totalUnreadCount,
        refreshConversations,
        updateConversationLastMessage,
        recordOutgoingMessage,
        markConversationAsRead,
        addOrUpdateConversation,
        registerActiveChat,
        unregisterActiveChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
