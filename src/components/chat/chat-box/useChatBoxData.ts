import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { chatService, websocketService } from '../../../services/api';
import { mediaService } from '../../../services/mediaService';
import { ChatUser } from './types';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  time: string;
}

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const targetUserId = friend.userId || friend.id;

  const handleChatFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;
    setUploading(true);
    toast.showInfo('Đang tải file đính kèm lên AWS S3...');
    try {
      const uploaded = await mediaService.uploadMedia(file, 'chats');
      if (uploaded && uploaded.fileUrl) {
        await chatService.sendMessage(conversationId, uploaded.fileUrl);
        const newMsg: Message = {
          id: 'msg-' + Date.now(),
          senderId: user?.id || 'me',
          text: uploaded.fileUrl,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, newMsg]);
        toast.showSuccess('Đã gửi file qua S3!');
      }
    } catch (err: any) {
      toast.showError('Gửi file thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  // Initialize conversation and load persistent chat history
  useEffect(() => {
    let isMounted = true;

    const initChat = async () => {
      setLoading(true);
      try {
        if (!targetUserId) {
          if (isMounted) setLoading(false);
          return;
        }

        const conv = await chatService.createDirectChat(targetUserId);
        const convId = conv?.conversationId || conv?.id ? String(conv.conversationId || conv.id) : null;

        if (isMounted && convId) {
          setConversationId(convId);

          const rawMsgs = await chatService.getMessages(convId);
          if (Array.isArray(rawMsgs) && rawMsgs.length > 0) {
            const sorted = [...rawMsgs].reverse();
            setMessages(
              sorted.map((m: any) => ({
                id: String(m.messageId || m.id),
                senderId: String(m.senderId),
                text: m.content || '',
                time: m.createdAt
                  ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Vừa xong',
              }))
            );
          } else {
            setMessages([]);
          }
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
  }, [targetUserId]);

  // Real-time WebSocket subscription for live chat
  useEffect(() => {
    if (!conversationId) return;

    let unsubscribe: (() => void) | null = null;
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
              const incomingId = String(incoming.messageId || (incoming as any).id || '');
              const incomingSender = String(incoming.senderId);
              const incomingContent = incoming.content || '';

              const matchIdx = prev.findIndex(
                (m) =>
                  (incomingId && m.id === incomingId) ||
                  (m.id.startsWith('msg-') && m.text === incomingContent && (m.senderId === incomingSender || m.senderId === user?.id || m.senderId === 'me'))
              );

              const formatted: Message = {
                id: incomingId || 'ws-' + Date.now(),
                senderId: incomingSender,
                text: incomingContent,
                time: incoming.createdAt
                  ? new Date(incoming.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Vừa xong',
              };

              if (matchIdx >= 0) {
                const updated = [...prev];
                updated[matchIdx] = formatted;
                return updated;
              }

              return [...prev, formatted];
            });
          }
        );
      } catch (err) {
        console.warn('[ChatBox] WebSocket subscription notice:', err);
      }
    };

    setupWebSocket();

    const handleFocus = async () => {
      try {
        const raw = await chatService.getMessages(conversationId);
        if (Array.isArray(raw) && raw.length > 0) {
          const sorted = [...raw].reverse();
          setMessages(
            sorted.map((m: any) => ({
              id: String(m.messageId || m.id),
              senderId: String(m.senderId),
              text: m.content || '',
              time: m.createdAt
                ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Vừa xong',
            }))
          );
        }
      } catch {}
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isSubscribed = false;
      if (unsubscribe) unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, [conversationId, user?.id]);

  useEffect(() => {
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
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
              prev.map((m) => (m.id === tempId ? { ...m, id: actualId } : m))
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
    messagesEndRef,
    chatFileInputRef,
    handleChatFileSelect,
    handleSend,
  };
};
