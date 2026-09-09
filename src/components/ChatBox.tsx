import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Phone, Video, Minus, Smile, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from './UserAvatar';
import { chatService } from '../services/api';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const targetUserId = friend.userId || friend.id;

  // Initialize conversation and load messages
  useEffect(() => {
    let isMounted = true;

    const initChat = async () => {
      setLoading(true);
      try {
        if (!targetUserId) {
          if (isMounted) setLoading(false);
          return;
        }

        // Attempt to create or fetch direct conversation
        const conv = await chatService.createDirectChat(targetUserId);
        const convId = conv?.id ? String(conv.id) : null;

        if (isMounted && convId) {
          setConversationId(convId);
          const rawMsgs = await chatService.getMessages(convId);
          if (Array.isArray(rawMsgs) && rawMsgs.length > 0) {
            // Sort ascending by creation time so newest are at the bottom
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
            // Default warm welcome message
            setMessages([
              {
                id: 'init-1',
                senderId: targetUserId,
                text: `Chào bạn! Rất vui được kết nối trên KLTN Social 👋`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }
        }
      } catch (err) {
        // Fallback local conversation
        if (isMounted) {
          setMessages([
            {
              id: 'init-fallback',
              senderId: targetUserId,
              text: `Chào bạn! Rất vui được kết nối với bạn 👋`,
              time: 'Vừa xong',
            },
          ]);
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

  // Real-time polling for incoming messages while chat is active (every 1.5s)
  useEffect(() => {
    if (!conversationId) return;

    const syncMessages = async () => {
      try {
        const rawMsgs = await chatService.getMessages(conversationId);
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
        }
      } catch {
        // ignore
      }
    };

    const interval = setInterval(syncMessages, 1500);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    const optimisticMsg: Message = {
      id: 'msg-' + Date.now(),
      senderId: user?.id || 'me',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      if (conversationId) {
        await chatService.sendMessage(conversationId, textToSend);
        // Fast sync immediately after send
        const rawMsgs = await chatService.getMessages(conversationId);
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
        }
      }
    } catch {
      // ignore
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
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.id || msg.senderId === 'me';
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-[#1877f2] text-white rounded-br-none'
                      : 'bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] border border-gray-200 dark:border-[#4e4f50] rounded-bl-none'
                  }`}
                >
                  {msg.text}
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
        <button type="button" className="p-1.5 text-gray-400 hover:text-[#1877f2] dark:hover:text-[#4599ff] transition cursor-pointer">
          <ImageIcon className="w-4 h-4" />
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
