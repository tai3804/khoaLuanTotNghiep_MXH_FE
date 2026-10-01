import React, { useState, useRef, useEffect } from 'react';
import { Globe, Users, Lock, ChevronDown, Check } from 'lucide-react';

interface CreatePostPrivacySelectorProps {
  privacy: 'public' | 'friends' | 'private';
  setPrivacy: (privacy: 'public' | 'friends' | 'private') => void;
}

export const CreatePostPrivacySelector: React.FC<CreatePostPrivacySelectorProps> = ({
  privacy,
  setPrivacy,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const options: {
    id: 'public' | 'friends' | 'private';
    title: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'public',
      title: 'Công khai',
      description: 'Bất kỳ ai ở trên hoặc ngoài MXH',
      icon: <Globe className="w-4 h-4 text-[#1877f2]" />,
    },
    {
      id: 'friends',
      title: 'Bạn bè',
      description: 'Chỉ những người bạn của bạn trên MXH',
      icon: <Users className="w-4 h-4 text-[#45bd62]" />,
    },
    {
      id: 'private',
      title: 'Chỉ mình tôi',
      description: 'Chỉ bạn mới có thể nhìn thấy bài viết này',
      icon: <Lock className="w-4 h-4 text-[#f3425f]" />,
    },
  ];

  const currentOption = options.find((opt) => opt.id === privacy) || options[0];

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] px-2.5 py-1 rounded-md text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] border border-gray-200 dark:border-[#4e4f50] transition cursor-pointer"
        title="Chọn ai có thể xem bài viết này"
      >
        {currentOption.icon}
        <span>{currentOption.title}</span>
        <ChevronDown className="w-3 h-3 text-gray-400 dark:text-[#b0b3b8]" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-8 w-64 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1 text-[11px] font-bold text-gray-400 dark:text-[#b0b3b8] uppercase tracking-wider">
            Ai có thể xem bài viết?
          </div>
          <div className="space-y-1">
            {options.map((opt) => {
              const isSelected = opt.id === privacy;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setPrivacy(opt.id);
                    localStorage.setItem('default_post_privacy', opt.id.toUpperCase());
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-[#1877f2]'
                      : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-800 dark:text-[#e4e6eb]'
                  }`}
                >
                  <div className="flex items-start space-x-2.5">
                    <div className="mt-0.5 shrink-0">{opt.icon}</div>
                    <div>
                      <div className="text-xs font-bold leading-tight">{opt.title}</div>
                      <div className="text-[10px] text-gray-500 dark:text-[#b0b3b8] leading-snug mt-0.5">
                        {opt.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#1877f2] shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
