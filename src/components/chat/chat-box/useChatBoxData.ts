import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { chatService, websocketService } from '../../../services/api';
import { userService, fetchAuthorProfile } from '../../../services/userService';
import { mediaService } from '../../../services/mediaService';
import { ChatUser } from './types';

export interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  text: string;
  time: string;
  status?: 'SENDING' | 'SENT' | 'DELIVERED' | 'SEEN';
  type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'STICKER' | string;
  mediaUrl?: string | null;
  edited?: boolean;
  deleted?: boolean;
  fileName?: string;
  fileSize?: number;
}

// Messenger-style timestamp: keep a compact clock for the last 24 hours;
// older messages need their calendar date so a conversation remains clear.
const formatMessageTime = (value?: string | Date): string => {
  if (!value) return 'Vừa xong';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Vừa xong';
  const now = new Date();
  const age = now.getTime() - date.getTime();
  if (age >= 0 && age < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString('vi-VN', sameYear
    ? { day: '2-digit', month: '2-digit' }
    : { day: '2-digit', month: '2-digit', year: 'numeric' });
};

interface UseChatBoxDataProps {
  friend: ChatUser;
}

export const useChatBoxData = ({ friend }: UseChatBoxDataProps) => {
  const { user } = useAuth();
  const toast = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWsLive, setIsWsLive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [groupDetail, setGroupDetail] = useState<any>(null);
  const [partnerProfile, setPartnerProfile] = useState<{ userId?: string; name: string; avatar: string } | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagePageRef = useRef(0);
  const prependingMessagesRef = useRef(false);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const chatDocInputRef = useRef<HTMLInputElement>(null);
  const memberProfilesRef = useRef<Record<string, { name: string; avatar: string }>>({});

  const markConversationAsRead = async (convId: string, messageId?: string) => {
    try {
      await chatService.markAsRead(convId, messageId);
      window.dispatchEvent(new CustomEvent('chat_conversation_read', { detail: { conversationId: convId } }));
      window.dispatchEvent(new Event('chat_unread_changed'));
    } catch (error) {
      console.warn('[ChatBox] Unable to mark conversation as read:', error);
    }
  };

  const handleChatFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const msgType: 'IMAGE' | 'VIDEO' | 'FILE' = isImage ? 'IMAGE' : isVideo ? 'VIDEO' : 'FILE';

    setUploading(true);
    toast.showInfo(`Đang tải ${isImage ? 'hình ảnh' : isVideo ? 'video' : 'tập tin'} lên AWS S3...`);

    try {
      const uploaded = await mediaService.uploadMedia(file, 'chats');
      if (uploaded && uploaded.fileUrl) {
        const fileUrl = uploaded.fileUrl;
        const tempId = 'msg-' + Date.now();
        const optimisticMsg: Message = {
          id: tempId,
          senderId: user?.id || 'me',
          senderName: 'Bạn',
          senderAvatar: user?.avatar,
          text: file.name || fileUrl,
          mediaUrl: fileUrl,
          type: msgType,
          fileName: file.name,
          fileSize: file.size,
          time: formatMessageTime(new Date()),
          status: 'SENDING',
        };

        // 1. Add optimistic message immediately
        setMessages((prev) => [...prev, optimisticMsg]);

        // 2. Send via chatService REST API with correct message type and mediaUrl
        const res = await chatService.sendFileMessage(conversationId, fileUrl, file.name, msgType);
        const actualId = res && (res.messageId || res.id) ? String(res.messageId || res.id) : null;

        // 3. Reconcile temporary message with server message ID
        setMessages((prev) => {
          if (actualId && prev.some((m) => m.id === actualId)) {
            return prev.filter((m) => m.id !== tempId);
          }
          return prev.map((m) => (m.id === tempId ? { ...m, id: actualId || m.id, status: 'SENT' } : m));
        });

        toast.showSuccess(isImage ? 'Đã gửi hình ảnh!' : isVideo ? 'Đã gửi video!' : 'Đã gửi tập tin thành công!');
      }
    } catch (err: any) {
      toast.showError('Gửi tập tin thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      // Reset input value so user can re-select the same file if needed
      e.target.value = '';
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!conversationId) return;
    try {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, text: newContent, edited: true } : m))
      );
      await chatService.editMessage(conversationId, messageId, newContent);
      toast.showSuccess('Đã chỉnh sửa tin nhắn');
    } catch (err: any) {
      toast.showError('Không thể chỉnh sửa tin nhắn: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRecallMessage = async (messageId: string) => {
    if (!conversationId) return;
    try {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, deleted: true } : m))
      );
      await chatService.recallMessage(conversationId, messageId);
      toast.showSuccess('Đã thu hồi tin nhắn');
    } catch (err: any) {
      toast.showError('Không thể thu hồi tin nhắn: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteForMe = async (messageId: string) => {
    if (!conversationId) return;
    try {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      await chatService.deleteMessageForMe(conversationId, messageId);
      toast.showSuccess('Đã xóa tin nhắn ở phía bạn');
    } catch (err: any) {
      toast.showError('Không thể xóa tin nhắn: ' + (err.response?.data?.message || err.message));
    }
  };

  const loadGroupMembers = async (convId: string) => {
    try {
      const detail = await chatService.getConversationDetail(convId);
      if (detail) {
        setGroupDetail(detail);
        if (Array.isArray(detail.members)) {
          const profiles: Record<string, { name: string; avatar: string }> = {};
          await Promise.all(
            detail.members.map(async (m: any) => {
              const uid = String(m.userId);
              try {
                const prof = await userService.getUserProfile(uid);
                profiles[uid] = {
                  name:
                    prof.fullName ||
                    [prof.lastName, prof.middleName, prof.firstName].filter(Boolean).join(' ') ||
                    prof.username ||
                    m.nickname ||
                    'Thành viên',
                  avatar: prof.avatarUrl || prof.avatar || '/default-avatar.png',
                };
              } catch {
                profiles[uid] = { name: m.nickname || 'Thành viên', avatar: '/default-avatar.png' };
              }
            })
          );
          memberProfilesRef.current = { ...memberProfilesRef.current, ...profiles };
          return profiles;
        }
      }
    } catch (err) {
      console.warn('[ChatBox] Error fetching group detail:', err);
    }
    return {};
  };

  // Initialize conversation and load persistent chat history
  useEffect(() => {
    let isMounted = true;

    const initChat = async () => {
      setLoading(true);
      try {
        let convId: string | null = friend.conversationId || null;
        let directTargetId: string | null = friend.userId || (!friend.isGroup && !friend.conversationId ? friend.id : null);

        if (!convId && directTargetId) {
          const conv = await chatService.createDirectChat(directTargetId);
          convId = conv?.conversationId || conv?.id ? String(conv.conversationId || conv.id) : null;
        }

        if (!convId && friend.id) {
          convId = friend.id;
        }

        if (!convId) {
          if (isMounted) setLoading(false);
          return;
        }

        if (isMounted) {
          setConversationId(convId);
        }

        let profilesMap: Record<string, { name: string; avatar: string }> = {};
        let resolvedPartnerProf: { name: string; avatar: string } | null = null;

        if (friend.isGroup) {
          profilesMap = await loadGroupMembers(convId);
        } else {
          // If directTargetId is missing or equals convId, retrieve members from conversation detail
          if (!directTargetId || directTargetId === convId) {
            try {
              const detail = await chatService.getConversationDetail(convId);
              if (detail && Array.isArray(detail.members)) {
                const partnerMember = detail.members.find((m: any) => String(m.userId) !== String(user?.id));
                if (partnerMember) {
                  directTargetId = String(partnerMember.userId);
                }
              }
            } catch (err) {
              console.warn('[ChatBox] Could not get conversation detail for direct chat:', err);
            }
          }

          if (directTargetId) {
            try {
              resolvedPartnerProf = await fetchAuthorProfile(directTargetId);
              if (resolvedPartnerProf && isMounted) {
                setPartnerProfile({ userId: directTargetId, ...resolvedPartnerProf });
                profilesMap[directTargetId] = resolvedPartnerProf;
              }
            } catch (err) {
              console.warn('[ChatBox] Error fetching partner profile:', err);
            }
          }
        }

        messagePageRef.current = 0;
        setHasMoreMessages(true);
        const rawMsgs = await chatService.getMessages(convId, 0, 20);
        if (isMounted && Array.isArray(rawMsgs) && rawMsgs.length > 0) {
          const sorted = [...rawMsgs].reverse();
          setMessages(
            sorted.map((m: any) => {
              const sId = String(m.senderId);
              const isCurrentUser = sId === String(user?.id);
              const prof = profilesMap[sId] || memberProfilesRef.current[sId];
              return {
                id: String(m.messageId || m.id),
                senderId: sId,
                senderName: isCurrentUser ? 'Bạn' : prof?.name || resolvedPartnerProf?.name || partnerProfile?.name || friend.name,
                senderAvatar: prof?.avatar || (isCurrentUser ? user?.avatar : resolvedPartnerProf?.avatar || partnerProfile?.avatar || friend.avatar),
                text: m.content || '',
                time: formatMessageTime(m.createdAt),
                status: isCurrentUser ? 'SENT' : 'DELIVERED',
                type: m.type || (m.mediaUrl ? 'IMAGE' : 'TEXT'),
                mediaUrl: m.mediaUrl || null,
                edited: Boolean(m.edited),
                deleted: Boolean(m.deleted),
              };
            })
          );
        } else if (isMounted) {
          setMessages([]);
        }
        if (isMounted) {
          const latest = Array.isArray(rawMsgs) ? rawMsgs[0] : null;
          await markConversationAsRead(convId, latest?.messageId || latest?.id);
        }
      } catch (err) {
        console.error('[ChatBox] Error initializing chat conversation:', err);
        if (isMounted) {
          setMessages([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initChat();
    return () => {
      isMounted = false;
    };
  }, [friend.id, friend.conversationId, friend.isGroup, friend.userId, user?.id]);

  const loadOlderMessages = async () => {
    if (!conversationId || loadingOlder || !hasMoreMessages) return;
    const container = messagesContainerRef.current;
    const previousHeight = container?.scrollHeight || 0;
    const previousTop = container?.scrollTop || 0;
    setLoadingOlder(true);
    try {
      const nextPage = messagePageRef.current + 1;
      const rawMsgs = await chatService.getMessages(conversationId, nextPage, 20);
      if (!Array.isArray(rawMsgs) || rawMsgs.length === 0) {
        setHasMoreMessages(false);
        return;
      }
      const older = [...rawMsgs].reverse().map((m: any) => {
        const senderId = String(m.senderId);
        const isCurrentUser = senderId === String(user?.id);
        const profile = memberProfilesRef.current[senderId];
        return {
          id: String(m.messageId || m.id),
          senderId,
          senderName: isCurrentUser ? 'Bạn' : profile?.name || friend.name,
          senderAvatar: profile?.avatar || (isCurrentUser ? user?.avatar : friend.avatar),
          text: m.content || '',
          time: formatMessageTime(m.createdAt),
          type: m.type || (m.mediaUrl ? 'IMAGE' : 'TEXT'),
          mediaUrl: m.mediaUrl || null,
          edited: Boolean(m.edited),
          deleted: Boolean(m.deleted),
        };
      });
      messagePageRef.current = nextPage;
      if (rawMsgs.length < 20) setHasMoreMessages(false);
      prependingMessagesRef.current = true;
      setMessages((current) => {
        const existing = new Set(current.map((message) => message.id));
        return [...older.filter((message) => !existing.has(message.id)), ...current];
      });
      requestAnimationFrame(() => {
        if (container) container.scrollTop = previousTop + container.scrollHeight - previousHeight;
      });
    } catch (error) {
      console.warn('[ChatBox] Unable to load older messages:', error);
    } finally {
      setLoadingOlder(false);
    }
  };

  // Real-time WebSocket subscription for live chat
  useEffect(() => {
    if (!conversationId) return;

    let unsubscribe: (() => void) | null = null;
    let unsubscribeReceipts: (() => void) | null = null;
    let isSubscribed = true;

    const setupWebSocket = async () => {
      try {
        const isConnected = await websocketService.connect();
        if (isSubscribed && isConnected) {
          setIsWsLive(true);
        }

        unsubscribe = await websocketService.subscribeToConversation(
          conversationId,
          (incoming) => {
            if (!isSubscribed) return;
            setIsWsLive(true);

            setMessages((prev) => {
              const incomingId = String(incoming.messageId || incoming.id || '');
              const incomingSender = String(incoming.senderId);
              const incomingContent = incoming.content || '';
              const isCurrentUser = incomingSender === String(user?.id);
              const prof = memberProfilesRef.current[incomingSender];

              // If message already exists by ID, update its content, edited and deleted status
              if (incomingId && prev.some((m) => m.id === incomingId)) {
                return prev
                  .filter((m) => !(m.id.startsWith('msg-') && m.text === incomingContent))
                  .map((m) => {
                    if (m.id === incomingId) {
                      return {
                        ...m,
                        text: incomingContent,
                        edited: incoming.edited !== undefined ? incoming.edited : m.edited,
                        deleted: incoming.deleted !== undefined ? incoming.deleted : m.deleted,
                        type: incoming.type || m.type,
                        mediaUrl: incoming.mediaUrl !== undefined ? incoming.mediaUrl : m.mediaUrl,
                      };
                    }
                    return m;
                  });
              }

              const matchIdx = prev.findIndex(
                (m) =>
                  (incomingId && m.id === incomingId) ||
                  (m.id.startsWith('msg-') && m.text === incomingContent && (m.senderId === incomingSender || m.senderId === user?.id || m.senderId === 'me'))
              );

              const formatted: Message = {
                id: incomingId || 'ws-' + Date.now(),
                senderId: incomingSender,
                senderName: isCurrentUser ? 'Bạn' : prof?.name || friend.name,
                senderAvatar: prof?.avatar || (isCurrentUser ? user?.avatar : friend.avatar),
                text: incomingContent,
                time: formatMessageTime(incoming.createdAt),
                status: isCurrentUser ? 'SENT' : 'DELIVERED',
                type: incoming.type || (incoming.mediaUrl ? 'IMAGE' : 'TEXT'),
                mediaUrl: incoming.mediaUrl || null,
                edited: Boolean(incoming.edited),
                deleted: Boolean(incoming.deleted),
              };

              if (!isCurrentUser && incomingId) {
                chatService.markAsDelivered(conversationId, incomingId).catch(() => {});
                markConversationAsRead(conversationId, incomingId);
              }

              if (matchIdx >= 0) {
                const updated = [...prev];
                updated[matchIdx] = formatted;
                return updated.filter((m, idx) => idx === matchIdx || !(m.id.startsWith('msg-') && m.text === incomingContent));
              }

              return [...prev, formatted];
            });
          }
        );

        unsubscribeReceipts = await websocketService.subscribeToReceipts(conversationId, (receipt) => {
          if (String(receipt.userId) === String(user?.id)) return;
          setMessages((previous) => previous.map((message) => message.senderId === String(user?.id)
            ? { ...message, status: receipt.type === 'SEEN' ? 'SEEN' : (message.status === 'SEEN' ? 'SEEN' : 'DELIVERED') }
            : message));
        });
      } catch (err) {
        console.warn('[ChatBox] WebSocket subscription notice:', err);
      }
    };

    setupWebSocket();

    const handleFocus = async () => {
      try {
        const raw = await chatService.getMessages(conversationId, 0, 20);
        const latest = Array.isArray(raw) ? raw[0] : null;
        await markConversationAsRead(conversationId, latest?.messageId || latest?.id);
        if (Array.isArray(raw) && raw.length > 0) {
          const sorted = [...raw].reverse();
          setMessages(
            sorted.map((m: any) => {
              const sId = String(m.senderId);
              const isCurrentUser = sId === String(user?.id);
              const prof = memberProfilesRef.current[sId];
              return {
                id: String(m.messageId || m.id),
                senderId: sId,
                senderName: isCurrentUser ? 'Bạn' : prof?.name || friend.name,
                senderAvatar: prof?.avatar || (isCurrentUser ? user?.avatar : friend.avatar),
                text: m.content || '',
                time: formatMessageTime(m.createdAt),
                type: m.type || (m.mediaUrl ? 'IMAGE' : 'TEXT'),
                mediaUrl: m.mediaUrl || null,
                edited: Boolean(m.edited),
                deleted: Boolean(m.deleted),
              };
            })
          );
        }
      } catch {}
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isSubscribed = false;
      if (unsubscribe) unsubscribe();
      if (unsubscribeReceipts) unsubscribeReceipts();
      window.removeEventListener('focus', handleFocus);
    };
  }, [conversationId, user?.id]);

  useEffect(() => {
    if (prependingMessagesRef.current) {
      prependingMessagesRef.current = false;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    const tempId = 'msg-' + Date.now();
    const optimisticMsg: Message = {
      id: tempId,
      senderId: user?.id || 'me',
      senderName: 'Bạn',
      senderAvatar: user?.avatar,
      text: textToSend,
      time: formatMessageTime(new Date()),
      status: 'SENDING',
      type: 'TEXT',
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      if (conversationId) {
        const sentViaWs = websocketService.sendMessage(conversationId, textToSend);

        if (sentViaWs) {
          setIsWsLive(true);
        } else {
          const res = await chatService.sendMessage(conversationId, textToSend);
          if (res && (res.messageId || res.id)) {
            const actualId = String(res.messageId || res.id);
            setMessages((prev) =>
              prev.map((m) => (m.id === tempId ? { ...m, id: actualId, status: 'SENT' } : m))
            );
          }
        }
      }
    } catch (err) {
      console.error('[ChatBox] Error sending message:', err);
    }
  };

  return {
    user,
    messages,
    inputText,
    setInputText,
    isMinimized,
    setIsMinimized,
    loading,
    uploading,
    conversationId,
    groupDetail,
    partnerProfile,
    reloadGroupDetail: () => conversationId && loadGroupMembers(conversationId),
    messagesEndRef,
    messagesContainerRef,
    loadingOlder,
    hasMoreMessages,
    loadOlderMessages,
    chatFileInputRef,
    chatDocInputRef,
    handleChatFileSelect,
    handleEditMessage,
    handleRecallMessage,
    handleDeleteForMe,
    handleSend,
  };
};
