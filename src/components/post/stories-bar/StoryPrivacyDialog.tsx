import React, { useEffect, useState } from 'react';
import { Globe, Lock, Users, X } from 'lucide-react';
import { StoryPrivacy } from './types';

export const PRIVACY_OPTIONS: { id: StoryPrivacy; label: string; desc: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'PUBLIC', label: 'Công khai', desc: 'Bất kỳ ai trên ứng dụng', icon: Globe },
  { id: 'FRIENDS', label: 'Bạn bè', desc: 'Chỉ bạn bè của bạn', icon: Users },
  { id: 'PRIVATE', label: 'Chỉ mình tôi', desc: 'Chỉ bạn xem được tin này', icon: Lock },
];

interface StoryPrivacyDialogProps {
  isOpen: boolean;
  value: StoryPrivacy;
  onSave: (value: StoryPrivacy) => void;
  onClose: () => void;
}

/** Hộp "Quyền riêng tư của tin" mở từ nút bánh răng, giống Facebook: chọn rồi bấm Lưu. */
export const StoryPrivacyDialog: React.FC<StoryPrivacyDialogProps> = ({ isOpen, value, onSave, onClose }) => {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (isOpen) setDraft(value);
  }, [isOpen, value]);

  if (!isOpen) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 z-[70] flex items-center justify-center bg-white/60 dark:bg-black/60 p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Quyền riêng tư của tin"
        className="w-full max-w-[500px] bg-white dark:bg-[#242526] rounded-lg shadow-2xl border border-gray-200 dark:border-[#393a3b]"
      >
        <div className="relative px-4 py-4 border-b border-gray-200 dark:border-[#393a3b] text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-[#e4e6eb]">Quyền riêng tư của tin</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] flex items-center justify-center text-gray-600 dark:text-[#b0b3b8] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <p className="font-semibold text-[15px] text-gray-900 dark:text-[#e4e6eb]">Ai có thể xem tin của bạn?</p>
          <p className="text-sm text-gray-500 dark:text-[#b0b3b8] mb-3">Tin của bạn sẽ hiển thị trong 24 giờ.</p>
          <div className="space-y-1">
            {PRIVACY_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = draft === opt.id;
              return (
                <label
                  key={opt.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3a3b3c] cursor-pointer"
                >
                  <span className="w-12 h-12 rounded-full bg-gray-200 dark:bg-[#3a3b3c] flex items-center justify-center text-gray-900 dark:text-[#e4e6eb] shrink-0">
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] font-semibold text-gray-900 dark:text-[#e4e6eb]">{opt.label}</span>
                    <span className="block text-[13px] text-gray-500 dark:text-[#b0b3b8]">{opt.desc}</span>
                  </span>
                  <input
                    type="radio"
                    name="story-privacy"
                    checked={active}
                    onChange={() => setDraft(opt.id)}
                    className="w-5 h-5 accent-[#1877f2] cursor-pointer"
                  />
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-4 pb-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-[15px] font-semibold text-[#1877f2] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            className="px-8 py-2 rounded-md text-[15px] font-semibold text-white bg-[#1877f2] hover:bg-[#166fe5] cursor-pointer"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};
