import React from 'react';
import { Smile, Palette, Bell, BellOff, Check } from 'lucide-react';
import { ChatTheme } from './types';

interface ChatCustomizationSectionProps {
  quickEmoji: string;
  onSelectQuickEmoji: (emoji: string) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

const POPULAR_EMOJIS = ['👍', '❤️', '🔥', '🎉', '👏', '💯', '🚀', '😍', '⚡', '🙌', '✨', '👌', '🥰', '😎', '⭐', '🤝', '💪', '🎯'];

const CHAT_THEMES: ChatTheme[] = [
  { id: 'default', name: 'Facebook Blue', colorHex: '#1877f2', gradientClass: 'from-[#1877f2] to-[#0064e0]' },
  { id: 'sunset', name: 'Hoàng hôn', colorHex: '#f43f5e', gradientClass: 'from-amber-500 via-rose-500 to-pink-500' },
  { id: 'purple', name: 'Tím mộng mơ', colorHex: '#8b5cf6', gradientClass: 'from-indigo-500 via-purple-500 to-pink-500' },
  { id: 'emerald', name: 'Ngọc lục bảo', colorHex: '#10b981', gradientClass: 'from-emerald-500 to-teal-600' },
  { id: 'ocean', name: 'Biển sâu', colorHex: '#06b6d4', gradientClass: 'from-cyan-500 to-blue-600' },
];

export const ChatCustomizationSection: React.FC<ChatCustomizationSectionProps> = ({
  quickEmoji,
  onSelectQuickEmoji,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
      {/* 1. Quick Reaction Emoji Picker */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 dark:bg-[#2d2e30] border border-gray-100 dark:border-white/5 space-y-3">
        <div className="flex items-center space-x-2">
          <Smile className="w-5 h-5 text-amber-500" />
          <h4 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
            Biểu tượng cảm xúc nhanh
          </h4>
        </div>
        <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
          Chọn biểu tượng cảm xúc mặc định hiển thị ở góc dưới thanh chat để gửi nhanh 1-chạm.
        </p>

        <div className="grid grid-cols-6 sm:grid-cols-9 gap-2.5 pt-1">
          {POPULAR_EMOJIS.map((emoji) => {
            const isSelected = quickEmoji === emoji;
            return (
              <button
                key={emoji}
                onClick={() => onSelectQuickEmoji(emoji)}
                className={`relative h-11 flex items-center justify-center rounded-xl text-xl hover:bg-white dark:hover:bg-[#3a3b3c] hover:scale-115 active:scale-95 transition cursor-pointer ${
                  isSelected ? 'bg-white dark:bg-[#3a3b3c] shadow-md ring-2 ring-[#1877f2]' : 'bg-white/60 dark:bg-black/20'
                }`}
                title={`Chọn ${emoji}`}
              >
                <span>{emoji}</span>
                {isSelected && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#1877f2] text-white flex items-center justify-center text-[10px] shadow-xs">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Theme Colors */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 dark:bg-[#2d2e30] border border-gray-100 dark:border-white/5 space-y-3">
        <div className="flex items-center space-x-2">
          <Palette className="w-5 h-5 text-indigo-500" />
          <h4 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
            Chủ đề đoạn chat
          </h4>
        </div>
        <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
          Tùy chỉnh màu sắc bong bóng tin nhắn và các điểm nhấn nổi bật trong cuộc trò chuyện.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          {CHAT_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                document.documentElement.style.setProperty('--chat-accent-color', theme.colorHex);
              }}
              className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-white dark:bg-[#1e1f20] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] border border-gray-100 dark:border-white/5 transition cursor-pointer group"
              title={theme.name}
            >
              <div
                className={`w-7 h-7 rounded-full bg-gradient-to-tr ${theme.gradientClass} shadow-xs group-hover:scale-110 transition flex items-center justify-center text-white shrink-0`}
              >
                {theme.id === 'default' && <Check className="w-3.5 h-3.5" />}
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] truncate">
                {theme.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Privacy & Notifications */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 dark:bg-[#2d2e30] border border-gray-100 dark:border-white/5">
        {onToggleMute && (
          <button
            onClick={onToggleMute}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-[#3a3b3c] transition text-left cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-full bg-white dark:bg-[#1e1f20] text-gray-700 dark:text-gray-300 shadow-2xs group-hover:bg-[#1877f2]/10 group-hover:text-[#1877f2]">
                {isMuted ? <BellOff className="w-5 h-5 text-amber-500" /> : <Bell className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-[#e4e6eb]">
                  {isMuted ? 'Bật thông báo đoạn chat' : 'Tắt thông báo đoạn chat'}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
                  {isMuted ? 'Đang tắt chuông báo tin nhắn mới' : 'Nhận âm thanh thông báo khi có tin nhắn mới'}
                </p>
              </div>
            </div>

            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              isMuted ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-[#1e1f20] text-gray-600 dark:text-gray-300'
            }`}>
              {isMuted ? 'Đã tắt' : 'Đang bật'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
