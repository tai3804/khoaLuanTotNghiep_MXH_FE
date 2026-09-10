import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Phone, Video, Minus, Smile, Image as ImageIcon, Wifi, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserAvatar } from '../common/UserAvatar';
import { chatService, websocketService } from '../../services/api';
import { mediaService } from '../../services/mediaService';

export interface ChatUser {
  id: string;
  userId?: string;
  name: string;
  avatar: string;
  online: boolean;
}

interface ChatBoxProps {
  friend: ChatUser;
  onClose: () => void;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  time: string;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ friend, onClose }) => {
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

        // 1. Get or create 1-on-1 direct conversation
        const conv = await chatService.createDirectChat(targetUserId);
        const convId = conv?.conversationId || conv?.id ? String(conv.conversationId || conv.id) : null;

        if (isMounted && convId) {
          setConversationId(convId);

          // 2. Load persistent chat history from database
          const rawMsgs = await chatService.getMessages(convId);
          if (Array.isArray(rawMsgs) && rawMsgs.length > 0) {
            // Messages from DB are newest first, reverse for chronological top-to-bottom
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

              // Check if message is already in list (e.g. optimistic match)
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

    // Re-sync messages when user switches back to tab
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
        // 1. Send via WebSocket for instant delivery to subscribers
        const sentViaWs = websocketService.sendMessage(conversationId, textToSend);

        if (sentViaWs) {
          setIsWsLive(true);
        } else {
          // 2. Reliable fallback via REST API (which also broadcasts to WS subscribers and saves to DB)
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

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-16 z-50 flex items-center space-x-2 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] shadow-xl rounded-t-xl px-3 py-2 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-[#3a3b3c]">
        <div className="relative">
          <UserAvatar src={friend.avatar} alt={friend.name} size="sm" />
          {friend.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#242526] rounded-full" />
          )}
        </div>
        <span
          onClick={() => setIsMinimized(false)}
          className="text-xs font-semibold text-gray-800 dark:text-[#e4e6eb] max-w-[100px] truncate"
        >
          {friend.name}
        </span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-[#e4e6eb] p-1 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-4 md:right-16 z-50 w-80 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] shadow-2xl rounded-t-xl flex flex-col overflow-hidden transition-all duration-200">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-[#393a3b] shadow-sm">
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setIsMinimized(true)}>
          <div className="relative">
            <UserAvatar src={friend.avatar} alt={friend.name} size="sm" />
            {friend.online && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#242526] rounded-full" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-[#e4e6eb] leading-tight">
              {friend.name}
            </h4>
            <span className="text-[10px] text-gray-500 dark:text-[#b0b3b8]">
              {friend.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-0.5 text-[#1877f2] dark:text-[#4599ff]">
          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full transition cursor-pointer" title="Cuộc gọi thoại">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full transition cursor-pointer" title="Cuộc gọi video">
            <Video className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-[#e4e6eb] transition cursor-pointer"
            title="Thu nhỏ"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-[#e4e6eb] transition cursor-pointer"
            title="Đóng chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="h-72 p-3 overflow-y-auto space-y-2 bg-gray-50/50 dark:bg-[#18191a]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xs text-gray-400 dark:text-[#b0b3b8]">
            <div className="w-4 h-4 border-2 border-[#1877f2] border-t-transparent rounded-full animate-spin mr-2" />
            <span>Đang tải tin nhắn...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <UserAvatar src={friend.avatar} alt={friend.name} size="md" />
            <p className="text-xs font-semibold mt-2.5 text-gray-800 dark:text-[#e4e6eb]">{friend.name}</p>
            <p className="text-[11px] text-gray-400 dark:text-[#b0b3b8] mt-1">Chưa có tin nhắn nào trong cuộc trò chuyện này.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.id || msg.senderId === 'me';
            const isMediaUrl = msg.text.startsWith('http://') || msg.text.startsWith('https://');
            const isVideo = isMediaUrl && (msg.text.endsWith('.mp4') || msg.text.endsWith('.webm'));

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-[#1877f2] text-white rounded-br-none'
                      : 'bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] border border-gray-200 dark:border-[#4e4f50] rounded-bl-none'
                  }`}
                >
                  {isMediaUrl ? (
                    isVideo ? (
                      <video src={msg.text} controls className="max-w-xs max-h-48 rounded-lg my-1" />
                    ) : (
                      <img src={msg.text} alt="Attachment" className="max-w-xs max-h-48 rounded-lg object-cover my-1" />
                    )
                  ) : (
                    msg.text
                  )}
                </div>
                <span className="text-[9px] text-gray-400 dark:text-[#b0b3b8] mt-0.5 px-1">{msg.time}</span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-2 bg-white dark:bg-[#242526] border-t border-gray-200 dark:border-[#393a3b] flex items-center space-x-1.5">
        <input
          type="file"
          ref={chatFileInputRef}
          onChange={handleChatFileSelect}
          accept="image/*,video/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => chatFileInputRef.current?.click()}
          disabled={uploading}
          className="p-1.5 text-gray-400 hover:text-[#1877f2] dark:hover:text-[#4599ff] transition cursor-pointer disabled:opacity-50"
          title="Gửi ảnh/video đính kèm qua AWS S3"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin text-[#1877f2]" /> : <ImageIcon className="w-4 h-4" />}
        </button>
        <button type="button" className="p-1.5 text-gray-400 hover:text-[#f7b125] transition cursor-pointer">
          <Smile className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] text-xs px-3 py-1.5 rounded-full border border-transparent focus:outline-none focus:border-[#1877f2] placeholder-gray-400 dark:placeholder-[#b0b3b8] transition"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-1.5 bg-[#1877f2] hover:bg-[#166fe5] active:bg-[#1464d2] text-white rounded-full disabled:opacity-40 transition shadow-sm cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
