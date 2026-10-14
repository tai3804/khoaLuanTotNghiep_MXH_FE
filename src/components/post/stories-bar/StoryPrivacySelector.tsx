import React, { useState, useRef, useEffect } from 'react';
import { Globe, Users, Lock, ChevronDown, Check } from 'lucide-react';
import { StoryPrivacy } from './types';

interface StoryPrivacySelectorProps {
  value: StoryPrivacy;
  onChange: (privacy: StoryPrivacy) => void;
  direction?: 'up' | 'down';
}

const PRIVACY_OPTIONS: { id: StoryPrivacy; label: string; desc: string; icon: React.FC<{ className?: string }> }[] = [
  {
    id: 'PUBLIC',
    label: 'Công khai',
    desc: 'Bất kỳ ai trên ứng dụng đều có thể xem tin này',
    icon: Globe,
  },
  {
    id: 'FRIENDS',
    label: 'Bạn bè',
    desc: 'Chỉ những người đã là bạn bè mới có thể xem tin',
    icon: Users,
  },
  {
    id: 'PRIVATE',
    label: 'Chỉ mình tôi',
    desc: 'Chỉ riêng bạn mới có thể nhìn thấy tin này',
    icon: Lock,
  },
];

export const StoryPrivacySelector: React.FC<StoryPrivacySelectorProps> = ({
  value,
  onChange,
  direction = 'down',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = PRIVACY_OPTIONS.find((o) => o.id === value) || PRIVACY_OPTIONS[0];
  const Icon = selected.icon;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 transition cursor-pointer"
      >
        <Icon className="w-3.5 h-3.5 text-blue-500" />
        <span>{selected.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
          } right-0 w-64 bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#393a3b] p-2 z-50`}
        >
          <div className="px-2.5 py-1.5 border-b border-gray-100 dark:border-[#393a3b] mb-1">
            <p className="text-xs font-bold text-gray-900 dark:text-white">Ai có thể xem tin này?</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Tin sẽ biến mất sau 24 giờ</p>
          </div>

          <div className="space-y-1">
            {PRIVACY_OPTIONS.map((opt) => {
              const OptIcon = opt.icon;
              const isCurrent = opt.id === value;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition ${
                    isCurrent
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-[#1877f2]'
                      : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isCurrent
                        ? 'bg-[#1877f2] text-white'
                        : 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <OptIcon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold">{opt.label}</p>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-[#1877f2]" />}
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
