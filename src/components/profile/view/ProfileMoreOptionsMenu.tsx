import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit3,
  Sparkles,
  Archive,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export interface ProfileMoreOptionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isProfessionalMode?: boolean;
  onShowEditModal: () => void;
  onOpenProfessionalModeModal?: () => void;
  onShowArchive?: () => void;
  onShowManagement?: () => void;
}

export const ProfileMoreOptionsMenu: React.FC<ProfileMoreOptionsMenuProps> = ({
  isOpen,
  onClose,
  isProfessionalMode,
  onShowEditModal,
  onOpenProfessionalModeModal,
  onShowArchive,
  onShowManagement,
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible backdrop to dismiss menu when clicking outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Menu Popover */}
      <div
        ref={menuRef}
        role="menu"
        aria-orientation="vertical"
        className="absolute right-0 top-full mt-2 w-80 sm:w-88 max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-[#242526] shadow-2xl border border-gray-200 dark:border-[#393a3b] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-black/5 dark:ring-white/10"
      >
        {/* 1. Edit Profile */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onShowEditModal();
          }}
          className="group flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center shrink-0 text-gray-700 dark:text-[#e4e6eb] group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 group-hover:text-[#1877f2] dark:group-hover:text-[#4599ff] transition-colors">
            <Edit3 className="w-4 h-4 shrink-0" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-[#e4e6eb] truncate">
              {isEn ? 'Edit Profile' : 'Chỉnh sửa trang cá nhân'}
            </p>
            <p className="text-xs text-gray-500 dark:text-[#b0b3b8] truncate mt-0.5">
              {isEn ? 'Update avatar, cover photo & bio' : 'Cập nhật ảnh đại diện, ảnh bìa và tiểu sử'}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors shrink-0" />
        </button>

        {/* 2. Professional Mode */}
        {onOpenProfessionalModeModal && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenProfessionalModeModal();
            }}
            className="group flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center shrink-0 text-gray-700 dark:text-[#e4e6eb] group-hover:bg-purple-50 dark:group-hover:bg-purple-950/40 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              <Sparkles className="w-4 h-4 shrink-0" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-[#e4e6eb] truncate">
                {isProfessionalMode
                  ? isEn ? 'Professional Mode Settings' : 'Cài đặt Chế độ chuyên nghiệp'
                  : isEn ? 'Turn on Professional Mode' : 'Bật Chế độ chuyên nghiệp'}
              </p>
              <p className="text-xs text-gray-500 dark:text-[#b0b3b8] truncate mt-0.5">
                {isProfessionalMode
                  ? isEn ? 'Manage creator tools and metrics' : 'Quản lý công cụ sáng tạo và số liệu'
                  : isEn ? 'Unlock creator insights and tools' : 'Mở khóa công cụ phân tích và nội dung'}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors shrink-0" />
          </button>
        )}

        {/* 3. Archive */}
        {(onShowArchive || onShowManagement) && (
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onShowArchive) onShowArchive();
              else if (onShowManagement) onShowManagement();
            }}
            className="group flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center shrink-0 text-gray-700 dark:text-[#e4e6eb] group-hover:bg-amber-50 dark:group-hover:bg-amber-950/40 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              <Archive className="w-4 h-4 shrink-0" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-[#e4e6eb] truncate">
                {isEn ? 'Archive' : 'Kho lưu trữ'}
              </p>
              <p className="text-xs text-gray-500 dark:text-[#b0b3b8] truncate mt-0.5">
                {isEn ? 'View archived posts and stories' : 'Xem lại bài viết và tin đã lưu trữ'}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors shrink-0" />
          </button>
        )}

        <div className="my-1 border-t border-gray-100 dark:border-[#393a3b]" />

        {/* 4. Privacy Settings */}
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/settings/privacy');
          }}
          className="group flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center shrink-0 text-gray-700 dark:text-[#e4e6eb] group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            <Shield className="w-4 h-4 shrink-0" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-[#e4e6eb] truncate">
              {isEn ? 'Privacy Settings' : 'Cài đặt quyền riêng tư'}
            </p>
            <p className="text-xs text-gray-500 dark:text-[#b0b3b8] truncate mt-0.5">
              {isEn ? 'Manage who can see your profile' : 'Kiểm soát người có thể xem trang cá nhân'}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors shrink-0" />
        </button>
      </div>
    </>
  );
};
