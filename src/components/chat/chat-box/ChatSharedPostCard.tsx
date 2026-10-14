import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, ExternalLink, Play } from 'lucide-react';
import { postService } from '../../../services/api';
import { Post } from '../../../types';
import { UserAvatar } from '../../common/UserAvatar';
import { TimeAgo } from '../../common/TimeAgo';
import { isVideo } from '../../post/post-card/PostCardContent';
import { useLanguage } from '../../../context/LanguageContext';

interface ChatSharedPostCardProps {
  postId: string;
  isMe?: boolean;
}

export const ChatSharedPostCard: React.FC<ChatSharedPostCardProps> = ({ postId, isMe: _isMe }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    postService
      .getPostById(postId)
      .then((data) => {
        if (isMounted) {
          if (data) {
            setPost(data);
          } else {
            setError(true);
          }
        }
      })
      .catch(() => {
        if (isMounted) setError(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [postId]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/posts/${postId}`);
  };

  if (loading) {
    return (
      <div className="w-[260px] sm:w-[280px] p-3 rounded-2xl border border-gray-200 dark:border-[#393a3b] bg-white dark:bg-[#242526] space-y-2.5 select-none animate-pulse shadow-xs">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-white/10 shrink-0" />
          <div className="space-y-1 flex-1">
            <div className="h-2.5 w-24 rounded bg-gray-200 dark:bg-white/10" />
            <div className="h-2 w-14 rounded bg-gray-200 dark:bg-white/10" />
          </div>
        </div>
        <div className="h-2.5 w-full rounded bg-gray-200 dark:bg-white/10" />
        <div className="h-2.5 w-4/5 rounded bg-gray-200 dark:bg-white/10" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div
        onClick={handleClick}
        className="w-[260px] sm:w-[280px] p-3 rounded-2xl border border-gray-200 dark:border-[#393a3b] bg-white dark:bg-[#242526] text-xs cursor-pointer transition-all hover:border-[#1877f2]/50 hover:shadow-md select-none group text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 font-bold text-gray-900 dark:text-[#e4e6eb]">
            <Share2 className="w-3.5 h-3.5 text-[#1877f2]" />
            <span>{t('chat.postLink', isEn ? 'Post link' : 'Liên kết bài viết')}</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#1877f2] transition-colors" />
        </div>
        <p className="text-[11px] text-gray-500 dark:text-[#b0b3b8] mt-1.5 truncate">
          {t('chat.openPost', isEn ? 'Open post on social network' : 'Mở xem bài viết trên mạng xã hội')}
        </p>
      </div>
    );
  }

  const firstMedia = post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls[0] : null;
  const isMediaVideo = firstMedia ? isVideo(firstMedia, post.mediaList?.[0]?.mediaType) : false;
  const hasMultipleMedia = Boolean(post.mediaUrls && post.mediaUrls.length > 1);

  return (
    <div
      onClick={handleClick}
      className="w-[260px] sm:w-[280px] overflow-hidden rounded-2xl border border-gray-200 dark:border-[#393a3b] bg-white dark:bg-[#242526] text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1877f2]/60 hover:shadow-md cursor-pointer shadow-xs select-none group"
    >
      {/* Top Header Label Badge */}
      <div className="px-3 py-1.5 border-b border-gray-100 dark:border-[#343739] bg-gray-50/90 dark:bg-[#1e1f20] text-[10px] font-bold flex items-center justify-between text-gray-500 dark:text-[#b0b3b8]">
        <div className="flex items-center space-x-1.5">
          <Share2 className="w-3 h-3 text-[#1877f2]" />
          <span>{t('chat.sharedPost', isEn ? 'Shared post' : 'Bài viết được chia sẻ')}</span>
        </div>
        <span className="flex items-center space-x-0.5 text-[#1877f2] dark:text-[#4599ff] group-hover:underline">
          <span>{t('chat.view', isEn ? 'View' : 'Xem')}</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </span>
      </div>

      {/* Author & snippet */}
      <div className="p-3 space-y-2">
        <div className="flex items-center space-x-2">
          <UserAvatar
            src={post.authorAvatar}
            alt={post.authorName}
            size="xs"
            className="ring-1 ring-black/5 dark:ring-white/10 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h5 className="text-xs font-bold text-gray-900 dark:text-[#e4e6eb] truncate leading-tight group-hover:text-[#1877f2] dark:group-hover:text-[#4599ff] transition-colors">
              {post.authorName}
            </h5>
            <span className="text-[10px] text-gray-500 dark:text-[#b0b3b8] block leading-none mt-0.5">
              <TimeAgo iso={post.createdAtRaw} fallback={post.createdAt} />
            </span>
          </div>
        </div>

        {/* Content text preview */}
        {post.content && (
          <p className="text-xs text-gray-700 dark:text-[#d0d2d6] line-clamp-2 leading-relaxed">
            {post.content}
          </p>
        )}

        {/* Media Thumbnail */}
        {firstMedia && (
          <div className="relative rounded-xl overflow-hidden max-h-36 bg-gray-100 dark:bg-[#1a1b1c] border border-gray-100 dark:border-white/5 mt-1">
            {isMediaVideo ? (
              <div className="relative w-full h-28 bg-black/40 flex items-center justify-center">
                <video src={firstMedia} className="w-full h-full object-cover pointer-events-none" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={firstMedia}
                alt="Post thumbnail"
                className="w-full h-28 object-cover group-hover:scale-102 transition-transform duration-300"
              />
            )}
            <div className="absolute bottom-1.5 right-1.5 bg-black/65 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded-md font-semibold flex items-center gap-1 shadow-xs">
              {isMediaVideo ? (
                'Video'
              ) : hasMultipleMedia ? (
                `+${post.mediaUrls!.length}`
              ) : isEn ? (
                'Photo'
              ) : (
                'Ảnh'
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSharedPostCard;
