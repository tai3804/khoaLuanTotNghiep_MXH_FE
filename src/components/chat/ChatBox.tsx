import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Phone, Video, Minus, Smile, Image as ImageIcon, Wifi, Loader2, Maximize2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserAvatar } from '../common/UserAvatar';
import { chatService, websocketService } from '../../services/api';
import { mediaService } from '../../services/mediaService';

export interface ChatUser {
  id: string;
  userId?: string;
  conversationId?: string;
  name: string;
  avatar: string;
  online: boolean;
  lastActiveAt?: string | null;
  lastMessage?: string;
  lastMessageAt?: string | null;
  lastMessageSenderId?: string | null;
  unreadCount?: number;
}

const formatLastActive = (dateString?: string | null): string => {
  if (!dateString) return 'Ngoại tuyến';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Ngoại tuyến';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return 'Vừa mới hoạt động';
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Vừa mới hoạt động';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Hoạt động ${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `Hoạt động ${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return 'Hoạt động hôm qua';
  if (diffDay < 7) return `Hoạt động ${diffDay} ngày trước`;
  return `Hoạt động ${date.getDate()}/${date.getMonth() + 1}`;
};

interface ChatBoxProps {
  friend: ChatUser;
  onClose: () => void;
  onNavigateProfile?: (userId: string) => void;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  time: string;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ friend, onClose, onNavigateProfile }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWsLive, setIsWsLive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Real-time online/offline presence tracking [UC-CH06]
  const [isOnline, setIsOnline] = useState<boolean>(friend.online ?? false);
  const [lastActiveAt, setLastActiveAt] = useState<string | null>(friend.lastActiveAt ?? null);

  const targetUserId = friend.userId || friend.id;

  // Sync state when friend changes and fetch fresh presence from Redis
  useEffect(() => {
    setIsOnline(friend.online ?? false);
    setLastActiveAt(friend.lastActiveAt ?? null);

    if (targetUserId) {
      chatService.getUserPresence(targetUserId).then((presence) => {
        if (presence) {
          setIsOnline(Boolean(presence.online));
          if (presence.lastActiveAt) {
            setLastActiveAt(presence.lastActiveAt);
          }
        }
      }).catch(() => {});
    }
  }, [targetUserId, friend.online, friend.lastActiveAt]);

  // Listen for WebSocket live presence updates
  useEffect(() => {
    const handlePresenceUpdate = (e: any) => {
      const detail = e.detail;
      if (
        detail &&
        detail.userId &&
        targetUserId &&
        String(detail.userId).toLowerCase() === String(targetUserId).toLowerCase()
      ) {
        setIsOnline(Boolean(detail.online));
        if (detail.lastActiveAt) {
          setLastActiveAt(detail.lastActiveAt);
        }
      }
    };

    window.addEventListener('user_presence_updated', handlePresenceUpdate);
    return () => window.removeEventListener('user_presence_updated', handlePresenceUpdate);
  }, [targetUserId]);

  // Close image preview modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewImage) {
        setPreviewImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage]);

  const handleOpenProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetId = friend.userId || friend.id;
    if (onNavigateProfile) {
      onNavigateProfile(targetId);
    } else if (targetId) {
      navigate(`/profile/${targetId}`);
    } else {
      navigate('/profile');
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

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

  // Reset and initialize conversation when targetUserId changes
  useEffect(() => {
    let isMounted = true;
    let unsubWs: (() => void) | null = null;

    // Reset state immediately so old friend's data doesn't leak
    setConversationId(null);
    setMessages([]);
    setInputText('');
    setLoading(true);

    const initChat = async () => {
      try {
        if (!targetUserId) {
          if (isMounted) setLoading(false);
          return;
        }

        // 1. Get or create 1-on-1 direct conversation
        const conv = await chatService.createDirectChat(targetUserId);
        const convId = conv?.conversationId || conv?.id ? String(conv.conversationId || conv.id) : null;

        if (!isMounted) return;

        if (convId) {
          setConversationId(convId);

          // 2. Load persistent chat history from database
          try {
            const rawMsgs = await chatService.getMessages(convId);
            if (isMounted && Array.isArray(rawMsgs)) {
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
            }
          } catch (msgErr) {
            console.warn('[ChatBox] Could not load message history:', msgErr);
          }

          // 3. Setup real-time WebSocket subscription for this conversation
          try {
            const connected = await websocketService.connect();
            if (isMounted && connected) {
              setIsWsLive(true);
            }

            unsubWs = await websocketService.subscribeToConversation(
              convId,
              (incoming) => {
                if (!isMounted) return;
                setIsWsLive(true);

                setMessages((prev) => {
                  const incomingId = String(incoming.messageId || (incoming as any).id || '');
                  const incomingSender = String(incoming.senderId);
                  const incomingContent = incoming.content || '';

                  // Check if message is already in list (optimistic match)
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
                window.dispatchEvent(new CustomEvent('chat_conversation_updated'));
              }
            );
          } catch (wsErr) {
            console.warn('[ChatBox] WebSocket subscription error:', wsErr);
          }
        }
      } catch (err: any) {
        console.error('[ChatBox] Error initializing chat conversation with user:', targetUserId, err);
        if (isMounted) {
          toast.showError('Không thể mở cuộc trò chuyện: ' + (err.response?.data?.message || err.message || 'Lỗi kết nối'));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initChat();

    // Re-sync messages when user switches back to this tab
    const handleFocus = async () => {
      if (!isMounted || !targetUserId) return;
      try {
        const conv = await chatService.createDirectChat(targetUserId);
        const convId = conv?.conversationId || conv?.id ? String(conv.conversationId || conv.id) : null;
        if (convId && isMounted) {
          const raw = await chatService.getMessages(convId);
          if (Array.isArray(raw) && isMounted) {
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
        }
      } catch {}
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      if (unsubWs) unsubWs();
      window.removeEventListener('focus', handleFocus);
    };
  }, [targetUserId, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    let activeConvId = conversationId;

    // Auto-resolve conversationId if still connecting
    if (!activeConvId && targetUserId) {
      try {
        const conv = await chatService.createDirectChat(targetUserId);
        activeConvId = conv?.conversationId || conv?.id ? String(conv.conversationId || conv.id) : null;
        if (activeConvId) {
          setConversationId(activeConvId);
        }
      } catch (err: any) {
        console.error('[ChatBox] Error resolving conversation before sending:', err);
        toast.showError('Không thể gửi tin nhắn: Không tạo được cuộc trò chuyện');
        return;
      }
    }

    if (!activeConvId) {
      toast.showError('Đang kết nối cuộc trò chuyện, vui lòng thử lại...');
      return;
    }

    const tempId = 'msg-' + Date.now();
    const optimisticMsg: Message = {
      id: tempId,
      senderId: user?.id || 'me',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      // Send via REST API (which reliably persists to PostgreSQL and automatically broadcasts via WebSocket to all clients)
      const res = await chatService.sendMessage(activeConvId, textToSend);
      window.dispatchEvent(new CustomEvent('chat_conversation_updated'));
      if (res && (res.messageId || res.id)) {
        const actualId = String(res.messageId || res.id);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? {
                  ...m,
                  id: actualId,
                  time: res.createdAt
                    ? new Date(res.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : m.time,
                }
              : m
          )
        );
      }
    } catch (err: any) {
      console.error('[ChatBox] Error sending message:', err);
      // If REST failed, attempt fallback WebSocket broadcast if connected
      const sentWs = websocketService.sendMessage(activeConvId, textToSend);
      if (!sentWs) {
        toast.showError('Gửi tin nhắn thất bại: ' + (err.response?.data?.message || err.message || 'Lỗi mạng'));
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-16 z-50 flex items-center space-x-2 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] shadow-xl rounded-t-xl px-3 py-2 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-[#3a3b3c]">
        <div className="relative">
          <UserAvatar src={friend.avatar} alt={friend.name} size="sm" />
          {isOnline && (
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
        <div
          className="flex items-center space-x-2.5 cursor-pointer hover:opacity-85 transition group"
          onClick={handleOpenProfile}
          title={`Xem trang cá nhân của ${friend.name}`}
        >
          <div className="relative">
            <UserAvatar src={friend.avatar} alt={friend.name} size="sm" />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#242526] rounded-full" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-[#e4e6eb] leading-tight group-hover:underline group-hover:text-[#1877f2] transition">
              {friend.name}
            </h4>
            <span className="text-[10px] text-gray-500 dark:text-[#b0b3b8] flex items-center space-x-1">
              {isOnline ? (
                <>
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1"></span>
                  <span>Đang hoạt động</span>
                </>
              ) : (
                <span>{formatLastActive(lastActiveAt)}</span>
              )}
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
            const lowerText = (msg.text || '').trim().toLowerCase();
            const isMedia =
              lowerText.startsWith('http://') ||
              lowerText.startsWith('https://') ||
              lowerText.startsWith('blob:') ||
              lowerText.startsWith('data:image/');
            const isVideo =
              isMedia &&
              (lowerText.endsWith('.mp4') ||
                lowerText.endsWith('.webm') ||
                lowerText.endsWith('.mov') ||
                lowerText.endsWith('.avi'));
            const isImage = isMedia && !isVideo;

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {isImage ? (
                  <div
                    onClick={() => setPreviewImage(msg.text)}
                    className="relative group/img overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 shadow-sm max-w-[220px] sm:max-w-[240px] cursor-zoom-in bg-black/5 dark:bg-white/5 transition duration-200 hover:shadow-md"
                    title="Nhấn để phóng to ảnh"
                  >
                    <img
                      src={msg.text}
                      alt="Hình ảnh đính kèm"
                      className="w-auto h-auto max-w-full max-h-64 object-contain rounded-2xl transition duration-200 group-hover/img:scale-[1.01] select-none"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                      <span className="p-2 bg-black/60 text-white rounded-full shadow-lg backdrop-blur-xs transform transition group-hover/img:scale-110">
                        <Maximize2 className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                ) : isVideo ? (
                  <div className="max-w-[240px] rounded-2xl overflow-hidden shadow-sm border border-black/10 dark:border-white/10">
                    <video src={msg.text} controls className="w-full max-h-64 object-cover" />
                  </div>
                ) : (
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                      isMe
                        ? 'bg-[#1877f2] text-white rounded-br-none'
                        : 'bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] border border-gray-200 dark:border-[#4e4f50] rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                )}
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

      {/* Fullscreen Image Lightbox Modal (Facebook Style) */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 animate-in fade-in duration-200 select-none"
          onClick={() => setPreviewImage(null)}
        >
          {/* Top Bar */}
          <div
            className="w-full flex items-center justify-between px-3 py-2 text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-2.5">
              <UserAvatar src={friend.avatar} alt={friend.name} size="sm" />
              <div className="text-left">
                <p className="text-sm font-bold text-white leading-tight">{friend.name}</p>
                <p className="text-xs text-gray-400">Hình ảnh trong cuộc trò chuyện</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={previewImage}
                target="_blank"
                rel="noreferrer"
                download
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer"
                title="Mở tab mới / Tải ảnh"
              >
                <Download className="w-5 h-5" />
              </a>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer"
                title="Đóng (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Centered Image */}
          <div
            className="flex-1 flex items-center justify-center w-full max-h-[82vh] p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage}
              alt="Phóng to ảnh"
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-transform duration-200"
            />
          </div>

          {/* Bottom Hint */}
          <div className="text-xs text-white/50 pb-2 pointer-events-none">
            Nhấn ra ngoài hoặc bấm ESC để đóng
          </div>
        </div>
      )}
    </div>
  );
};
