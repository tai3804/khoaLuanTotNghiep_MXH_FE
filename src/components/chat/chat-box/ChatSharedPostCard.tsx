import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, ExternalLink, Image as ImageIcon, Loader2 } from 'lucide-react';
import { postService } from '../../../services/api';
import { Post } from '../../../types';
import { UserAvatar } from '../../common/UserAvatar';
import { TimeAgo } from '../../common/TimeAgo';
import { isVideo } from '../../post/post-card/PostCardContent';

interface ChatSharedPostCardProps {
  postId: string;
  isMe: boolean;
}

export const ChatSharedPostCard: React.FC<ChatSharedPostCardProps> = ({ postId, isMe }) => {
  const navigate = useNavigate();
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
      <div
        className={`mt-1.5 p-3 rounded-2xl border text-xs max-w-xs space-y-2 select-none animate-pulse ${
          isMe
            ? 'bg-blue-700/50 border-blue-400/40 text-white'
            : 'bg-gray-100 dark:bg-[#2b2d2f] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'
        }`}
      >
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-white/20 dark:bg-white/10" />
          <div className="h-3 w-20 rounded bg-white/20 dark:bg-white/10" />
        </div>
        <div className="h-2.5 w-full rounded bg-white/20 dark:bg-white/10" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div
        onClick={handleClick}
        className={`mt-1.5 p-3 rounded-2xl border text-xs max-w-xs cursor-pointer transition hover:opacity-95 select-none ${
          isMe
            ? 'bg-white/10 border-white/20 text-white hover:bg-white/15'
            : 'bg-gray-100 dark:bg-[#2b2d2f] border-gray-200 dark:border-gray-700 text-gray-800 dark:text-[#e4e6eb] hover:bg-gray-200/80 dark:hover:bg-[#343739]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 font-bold">
            <Share2 className="w-3.5 h-3.5 text-[#1877f2]" />
            <span>Liên kết bài viết</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </div>
        <p className="text-[11px] opacity-75 mt-1 truncate">Mở xem bài viết trên mạng xã hội</p>
      </div>
    );
  }

  const firstMedia = post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls[0] : null;
  const isMediaVideo = firstMedia ? isVideo(firstMedia, post.mediaList?.[0]?.mediaType) : false;

  return (
    <div
      onClick={handleClick}
      className={`mt-1.5 overflow-hidden rounded-2xl border text-left transition transform hover:-translate-y-0.5 cursor-pointer max-w-xs shadow-md select-none group ${
        isMe
          ? 'bg-gradient-to-b from-[#1877f2] to-[#1466d3] border-blue-400/40 text-white'
          : 'bg-white dark:bg-[#242526] border-gray-200 dark:border-[#393a3b] text-gray-900 dark:text-[#e4e6eb]'
      }`}
    >
      {/* Top Header Label */}
      <div
        className={`px-3 py-1.5 border-b text-[10px] font-bold flex items-center justify-between ${
          isMe
            ? 'border-white/15 bg-white/10 text-white'
            : 'border-gray-100 dark:border-[#343739] bg-gray-50 dark:bg-[#1f2021] text-gray-500 dark:text-[#b0b3b8]'
        }`}
      >
        <div className="flex items-center space-x-1">
          <Share2 className="w-3 h-3 text-blue-400" />
          <span>Bài viết được chia sẻ</span>
        </div>
        <span className="flex items-center space-x-0.5 text-blue-400 group-hover:underline">
          <span>Xem</span>
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
            className="ring-1 ring-white/20"
          />
          <div className="min-w-0 flex-1">
            <h5 className="text-xs font-bold truncate leading-tight">{post.authorName}</h5>
            <span
              className={`text-[10px] block ${
                isMe ? 'text-blue-100' : 'text-gray-400 dark:text-[#8a8d91]'
              }`}
            >
              <TimeAgo iso={post.createdAtRaw} fallback={post.createdAt} />
            </span>
          </div>
        </div>

        {/* Content text preview */}
        {post.content && (
          <p
            className={`text-xs line-clamp-2 leading-relaxed ${
              isMe ? 'text-white/95' : 'text-gray-700 dark:text-[#d0d2d6]'
            }`}
          >
            {post.content}
          </p>
        )}

        {/* Media Thumbnail */}
        {firstMedia && (
          <div className="relative rounded-xl overflow-hidden max-h-36 bg-black/10 border border-black/10 dark:border-white/10 mt-1">
            {isMediaVideo ? (
              <video src={firstMedia} className="w-full h-28 object-cover pointer-events-none" />
            ) : (
              <img
                src={firstMedia}
                alt="Post thumbnail"
                className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}
            <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
              {isMediaVideo ? 'Video' : 'Ảnh'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSharedPostCard;
