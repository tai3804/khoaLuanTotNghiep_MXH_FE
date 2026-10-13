import React, { useState } from 'react';
import { RotateCcw, Trash2, Lock, Calendar } from 'lucide-react';
import { ArchivedPostItemProps } from './types';
import { useLanguage } from '../../../context/LanguageContext';

export const ArchivedPostCard: React.FC<ArchivedPostItemProps> = ({
  post,
  onRestore,
  onDelete,
  isRestoring = false,
  isDeleting = false,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [isExpanded, setIsExpanded] = useState(false);

  const mediaUrls = post.mediaUrls || (post.mediaList ? post.mediaList.map((m: any) => m.fileUrl || m.url) : []);
  const hasMedia = mediaUrls && mediaUrls.length > 0;
  const content = post.content || '';
  const isLongContent = content.length > 200;

  return (
    <article className="rounded-2xl border border-gray-200 dark:border-[#393a3b] bg-gray-50/70 dark:bg-[#1e1f20] p-4 transition-all hover:border-gray-300 dark:hover:border-[#4e4f50] shadow-2xs">
      {/* Post Header: Author + Timestamp + Archived Status Badge */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <img
            src={post.authorAvatar || '/default-avatar.png'}
            alt={post.authorName}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-[#242526]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-avatar.png';
            }}
          />
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
              {post.authorName || 'Người dùng'}
            </h4>
            <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-[#b0b3b8]">
              <Calendar className="w-3 h-3" />
              <span>{post.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Badge: Archived */}
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Lock className="w-3 h-3" />
          <span>{isEn ? 'Archived' : 'Đã lưu trữ'}</span>
        </span>
      </div>

      {/* Post Text Content */}
      {content && (
        <div className="text-xs sm:text-sm text-gray-800 dark:text-[#e4e6eb] leading-relaxed mb-3 whitespace-pre-line">
          {isExpanded || !isLongContent ? content : `${content.slice(0, 200)}... `}
          {isLongContent && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[#1877f2] dark:text-[#4599ff] font-semibold hover:underline ml-1 cursor-pointer"
            >
              {isExpanded ? (isEn ? 'Show less' : 'Thu gọn') : (isEn ? 'See more' : 'Xem thêm')}
            </button>
          )}
        </div>
      )}

      {/* Post Media Grid Preview (if any) */}
      {hasMedia && (
        <div className={`mb-3 grid gap-1.5 rounded-xl overflow-hidden ${
          mediaUrls.length === 1 ? 'grid-cols-1' : mediaUrls.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
        }`}>
          {mediaUrls.slice(0, 3).map((url, idx) => (
            <div key={idx} className="relative aspect-video bg-gray-200 dark:bg-[#3a3b3c] overflow-hidden rounded-lg">
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover hover:scale-105 transition duration-300"
                loading="lazy"
              />
              {idx === 2 && mediaUrls.length > 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm">
                  +{mediaUrls.length - 3}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200/80 dark:border-[#393a3b]/80">
        <span className="text-[11px] text-gray-500 dark:text-[#8a8d91]">
          {isEn ? 'Hidden from your profile' : 'Đã ẩn khỏi trang cá nhân'}
        </span>

        <div className="flex items-center gap-2">
          {/* Delete Permanently Button */}
          <button
            onClick={() => onDelete(post.id)}
            disabled={isDeleting || isRestoring}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer disabled:opacity-50"
            title={isEn ? 'Delete permanently' : 'Xóa vĩnh viễn'}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isEn ? 'Delete' : 'Xóa'}</span>
          </button>

          {/* Restore Button */}
          <button
            onClick={() => onRestore(post.id)}
            disabled={isRestoring || isDeleting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#1877f2] hover:bg-[#166fe5] text-white shadow-xs transition cursor-pointer disabled:opacity-50"
            title={isEn ? 'Restore to profile timeline' : 'Khôi phục về dòng thời gian'}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
            <span>{isRestoring ? (isEn ? 'Restoring...' : 'Đang khôi phục...') : (isEn ? 'Restore to profile' : 'Khôi phục')}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
