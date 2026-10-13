import React from 'react';
import { Archive, RefreshCw, X, Lock, HardDrive } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { ArchiveTab } from './types';

interface ArchiveHeaderProps {
  activeTab: ArchiveTab;
  setActiveTab: (tab: ArchiveTab) => void;
  archivedCount: number;
  mediaCount: number;
  loading: boolean;
  onRefresh: () => void;
  onClose: () => void;
}

export const ArchiveHeader: React.FC<ArchiveHeaderProps> = ({
  activeTab,
  setActiveTab,
  archivedCount,
  mediaCount,
  loading,
  onRefresh,
  onClose,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <div className="border-b border-gray-200 dark:border-[#393a3b] bg-white dark:bg-[#242526] px-5 pt-4 pb-0 shrink-0 select-none">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1877f2]/10 dark:bg-[#1877f2]/20 flex items-center justify-center text-[#1877f2] dark:text-[#4599ff]">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-[#e4e6eb]">
              {isEn ? 'Archive & Media Center' : 'Kho lưu trữ & Thư viện Media'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
              {isEn
                ? 'Manage private archived posts and uploaded media content'
                : 'Quản lý bài viết lưu trữ riêng tư và toàn bộ phương tiện đã tải lên'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-600 dark:text-[#b0b3b8] transition cursor-pointer disabled:opacity-50"
            title={isEn ? 'Refresh' : 'Làm mới'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-600 dark:text-[#b0b3b8] hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
            title={isEn ? 'Close' : 'Đóng'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2 Clean Tabs */}
      <div className="flex items-center space-x-2 pt-1 overflow-x-auto no-scrollbar">
        {/* Tab 1: Archived Posts */}
        <button
          onClick={() => setActiveTab('archived')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-t-xl transition-all cursor-pointer border-b-2 shrink-0 ${
            activeTab === 'archived'
              ? 'text-[#1877f2] dark:text-[#4599ff] border-[#1877f2] dark:border-[#4599ff] bg-[#1877f2]/5 dark:bg-[#1877f2]/10'
              : 'text-gray-600 dark:text-[#b0b3b8] border-transparent hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>{isEn ? 'Archived Posts' : 'Bài viết đã lưu trữ'}</span>
          {archivedCount > 0 && (
            <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
              {archivedCount}
            </span>
          )}
        </button>

        {/* Tab 2: Media Gallery & Storage */}
        <button
          onClick={() => setActiveTab('media')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-t-xl transition-all cursor-pointer border-b-2 shrink-0 ${
            activeTab === 'media'
              ? 'text-[#1877f2] dark:text-[#4599ff] border-[#1877f2] dark:border-[#4599ff] bg-[#1877f2]/5 dark:bg-[#1877f2]/10'
              : 'text-gray-600 dark:text-[#b0b3b8] border-transparent hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>{isEn ? 'Media & Storage' : 'Thư viện Media & Dung lượng'}</span>
          {mediaCount > 0 && (
            <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-[#1877f2]/15 text-[#1877f2] dark:text-[#4599ff]">
              {mediaCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
