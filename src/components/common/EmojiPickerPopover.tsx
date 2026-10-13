import React, { useEffect, useRef, useState } from 'react';
import { Smile, ThumbsUp, Heart, Sparkles } from 'lucide-react';

interface EmojiPickerPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  className?: string;
}

interface EmojiCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  emojis: string[];
}

const CATEGORIES: EmojiCategory[] = [
  {
    id: 'smileys',
    label: 'Biểu cảm',
    icon: <Smile className="w-3.5 h-3.5" />,
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
      '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😋',
      '😜', '🤪', '😎', '🥳', '🤩', '🤗', '🤔', '🤫',
      '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪',
      '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵',
      '🥶', '🥴', '😵', '🤯', '🤠', '🥺', '😢', '😭',
      '😤', '😠', '😡', '🤬', '😱', '😨', '😰', '😥',
    ],
  },
  {
    id: 'gestures',
    label: 'Cử chỉ',
    icon: <ThumbsUp className="w-3.5 h-3.5" />,
    emojis: [
      '👍', '👎', '👏', '🙌', '👐', '🤝', '🙏', '✌️',
      '🤞', '🤟', '🤘', '👌', '🤌', '🤏', '🤙', '👊',
      '✊', '🤛', '🤜', '👋', '🤚', '🖐️', '✋', '🖖',
      '💪', '👈', '👉', '👆', '👇', '☝️', '✍️', '💅',
    ],
  },
  {
    id: 'hearts',
    label: 'Trái tim',
    icon: <Heart className="w-3.5 h-3.5" />,
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
      '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
      '💘', '💝', '💟', '💌', '💋', '👄', '🫂', '🧑‍🤝‍🧑',
    ],
  },
  {
    id: 'objects',
    label: 'Khác',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    emojis: [
      '🔥', '✨', '🌟', '⭐', '🎉', '🎊', '💯', '🎈',
      '🎁', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🍻',
      '☕', '🍕', '🍔', '🍟', '🍦', '🍩', '🌸', '🌹',
      '🌻', '🍀', '💡', '🎵', '🎶', '🚀', '🌈', '☀️',
    ],
  },
];

export const EmojiPickerPopover: React.FC<EmojiPickerPopoverProps> = ({
  isOpen,
  onClose,
  onSelectEmoji,
  className = '',
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>('smileys');

  // Handle outside click & escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentCategory = CATEGORIES.find((c) => c.id === activeTab) || CATEGORIES[0];

  return (
    <div
      ref={popoverRef}
      className={`absolute z-50 w-72 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 select-none ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Category Tabs Header */}
      <div className="flex items-center justify-around px-2 pt-2 pb-1.5 border-b border-gray-100 dark:border-[#393a3b] bg-gray-50/70 dark:bg-[#18191a]">
        {CATEGORIES.map((category) => {
          const isActive = category.id === activeTab;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveTab(category.id)}
              title={category.label}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                isActive
                  ? 'text-[#1877f2] dark:text-blue-400 bg-white dark:bg-[#3a3b3c] shadow-xs'
                  : 'text-gray-500 dark:text-[#b0b3b8] hover:bg-gray-200/50 dark:hover:bg-[#3a3b3c]/50'
              }`}
            >
              {category.icon}
              <span className="text-[11px] hidden sm:inline">{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* Emoji Grid */}
      <div className="p-2.5 max-h-52 overflow-y-auto grid grid-cols-7 gap-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {currentCategory.emojis.map((emoji, idx) => (
          <button
            key={`${emoji}-${idx}`}
            type="button"
            onClick={() => {
              onSelectEmoji(emoji);
            }}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-lg transition transform hover:scale-125 active:scale-95 cursor-pointer leading-none"
            aria-label={`Chọn ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-1.5 bg-gray-50 dark:bg-[#18191a] border-t border-gray-100 dark:border-[#393a3b] text-[10px] text-gray-400 dark:text-[#b0b3b8] flex justify-between items-center">
        <span>Chọn biểu tượng cảm xúc</span>
        <button
          type="button"
          onClick={onClose}
          className="hover:underline hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};
