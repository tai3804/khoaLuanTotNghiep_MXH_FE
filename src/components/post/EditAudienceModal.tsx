import React, { useState } from 'react';
import { X, Globe, Users, Lock, Check, ArrowLeft } from 'lucide-react';

export type PostPrivacy = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';

interface EditAudienceModalProps {
  isOpen: boolean;
  currentPrivacy: PostPrivacy;
  onClose: () => void;
  onSave: (privacy: PostPrivacy) => Promise<void> | void;
  showBackButton?: boolean;
}

export const EditAudienceModal: React.FC<EditAudienceModalProps> = ({
  isOpen,
  currentPrivacy,
  onClose,
  onSave,
  showBackButton = false,
}) => {
  const [selectedPrivacy, setSelectedPrivacy] = useState<PostPrivacy>(currentPrivacy);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(selectedPrivacy);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const options: {
    id: PostPrivacy;
    title: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'PUBLIC',
      title: 'Công khai',
      description: 'Bất kỳ ai ở trên hoặc ngoài KLTN Social',
      icon: <Globe className="w-5 h-5 text-[#1877f2]" />,
    },
    {
      id: 'FRIENDS',
      title: 'Bạn bè',
      description: 'Chỉ những người bạn của bạn trên KLTN Social mới nhìn thấy',
      icon: <Users className="w-5 h-5 text-emerald-500" />,
    },
    {
      id: 'PRIVATE',
      title: 'Chỉ mình tôi',
      description: 'Chỉ có bạn mới nhìn thấy bài viết này',
      icon: <Lock className="w-5 h-5 text-amber-500" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
        onClick={!saving ? onClose : undefined}
      />

      {/* Modal Card */}
      <div className="relative bg-white dark:bg-[#242526] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-[#393a3b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showBackButton ? (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-500 transition cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : null}
            <h3 className="text-base font-bold text-gray-900 dark:text-[#e4e6eb]">
              Chọn đối tượng
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-500 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <div className="px-5 pt-4 pb-2">
          <h4 className="font-bold text-sm text-gray-900 dark:text-[#e4e6eb]">
            Ai có thể xem bài viết của bạn?
          </h4>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
            Bài viết của bạn có thể hiển thị trên Bảng tin, trang cá nhân và kết quả tìm kiếm.
          </p>
        </div>

        {/* Options list */}
        <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh]">
          {options.map((opt) => {
            const isSelected = selectedPrivacy === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelectedPrivacy(opt.id)}
                className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition border ${
                  isSelected
                    ? 'border-[#1877f2] bg-blue-50/70 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-[#393a3b] hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/60'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center shrink-0">
                    {opt.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
                      {opt.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5 leading-snug">
                      {opt.description}
                    </div>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                    isSelected
                      ? 'border-[#1877f2] bg-[#1877f2]'
                      : 'border-gray-400 dark:border-gray-500'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-gray-200 dark:border-[#393a3b] bg-gray-50 dark:bg-[#242526] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-200 dark:hover:bg-[#3a3b3c] rounded-xl transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-xl transition shadow-sm shadow-blue-500/30 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};
