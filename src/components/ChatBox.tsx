import React, { useState } from 'react';
import { X, Send, Phone, Video, Minus, Smile, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from './UserAvatar';

export interface ChatUser {
  id: string;
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      senderId: friend.id,
      text: `Chào bạn! Rất vui được kết nối với bạn 👋`,
      time: '10:00',
    },
    {
      id: 'm2',
      senderId: user?.id || 'me',
      text: 'Chào ' + friend.name + '! Hôm nay công việc thế nào?',
      time: '10:02',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      senderId: user?.id || 'me',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate auto response after 1.5s
    setTimeout(() => {
      const replyMsg: Message = {
        id: 'reply-' + Date.now(),
        senderId: friend.id,
        text: 'Cảm ơn bạn đã nhắn tin! Mình đang xem bảng tin nè 🚀',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1500);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-16 z-50 flex items-center space-x-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl rounded-t-xl px-3 py-2 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-slate-700">
        <div className="relative">
          <UserAvatar src={friend.avatar} alt={friend.name} size="sm" />
          {friend.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" />
          )}
        </div>
        <span
          onClick={() => setIsMinimized(false)}
          className="text-xs font-semibold text-gray-800 dark:text-slate-100 max-w-[100px] truncate"
        >
          {friend.name}
        </span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-4 md:right-16 z-50 w-80 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-2xl rounded-t-2xl flex flex-col overflow-hidden transition-all duration-200">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setIsMinimized(true)}>
          <div className="relative">
            <UserAvatar src={friend.avatar} alt={friend.name} size="sm" />
            {friend.online && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100 leading-tight">
              {friend.name}
            </h4>
            <span className="text-[10px] text-gray-500 dark:text-slate-400">
              {friend.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition" title="Cuộc gọi thoại">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition" title="Cuộc gọi video">
            <Video className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 rounded-full transition"
            title="Thu nhỏ"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-red-500 rounded-full transition"
            title="Đóng chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-3 h-64 overflow-y-auto space-y-2 bg-gray-50 dark:bg-slate-900/50">
        {messages.map((msg) => {
          const isMe = msg.senderId === (user?.id || 'me');
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 rounded-bl-none border border-gray-100 dark:border-slate-600'
                }`}
              >
                <p>{msg.text}</p>
                <span className={`block text-[9px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400 dark:text-slate-400'}`}>
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} className="p-2 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 flex items-center space-x-1.5">
        <button type="button" className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full transition">
          <ImageIcon className="w-4 h-4" />
        </button>
        <button type="button" className="p-1.5 text-gray-400 hover:text-amber-500 rounded-full transition">
          <Smile className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-slate-100 px-3 py-1.5 text-xs rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-40 transition"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
