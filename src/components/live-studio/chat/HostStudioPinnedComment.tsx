import React from 'react';
import { Pin, X } from 'lucide-react';
import { UserAvatar } from '../../common/UserAvatar';
import { LiveComment } from '../../../context/LiveStreamContext';
import { useLanguage } from '../../../context/LanguageContext';

interface HostStudioPinnedCommentProps {
  comment: LiveComment;
  onUnpin: () => void;
}

export const HostStudioPinnedComment: React.FC<HostStudioPinnedCommentProps> = ({
  comment,
  onUnpin,
}) => {
  const { t } = useLanguage();

  return (
    <div className="mx-2.5 my-2 p-2.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 shadow-sm animate-fadeIn shrink-0">
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <div className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400">
          <Pin className="w-3.5 h-3.5 fill-blue-500/20" />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            {t('live.chat.pinnedBanner', 'Bình luận đã ghim')}
          </span>
        </div>
        <button
          type="button"
          onClick={onUnpin}
          className="p-1 rounded-md text-gray-400 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition cursor-pointer"
          title={t('live.chat.unpin', 'Bỏ ghim')}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-start space-x-2">
        <UserAvatar
          src={comment.authorAvatar}
          alt={comment.authorName}
          size="sm"
          className="w-6 h-6 shrink-0 mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-gray-900 dark:text-white truncate block">
            {comment.authorName}
          </span>
          <p className="text-xs text-gray-700 dark:text-gray-300 break-words line-clamp-2 leading-relaxed">
            {comment.content}
          </p>
        </div>
      </div>
    </div>
  );
};
