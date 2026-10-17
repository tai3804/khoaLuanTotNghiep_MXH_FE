import React from 'react';
import { Music } from 'lucide-react';
import { Post } from '../../../types';

interface ReelsVideoInfoProps {
  post: Post;
  onViewProfile?: (userId: string) => void;
}

export const ReelsVideoInfo: React.FC<ReelsVideoInfoProps> = ({ post, onViewProfile }) => {
  return (
    <div className="absolute bottom-0 inset-x-0 p-4 pt-16 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white pointer-events-none z-20 flex flex-col justify-end space-y-2.5">
      {/* Author info */}
      <div className="flex items-center space-x-2.5 pointer-events-auto">
        <img
          src={post.authorAvatar || '/default-avatar.png'}
          alt={post.authorName}
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile?.(post.userId);
          }}
          className="w-10 h-10 rounded-full border-2 border-white object-cover cursor-pointer hover:opacity-90"
        />
        <div className="flex flex-col">
          <span
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile?.(post.userId);
            }}
            className="font-bold text-sm hover:underline cursor-pointer drop-shadow-xs"
          >
            {post.authorName}
          </span>
          <span className="text-[11px] text-white/70">
            {post.createdAt || 'Vừa xong'}
          </span>
        </div>
      </div>

      {/* Post Content / Caption */}
      {post.content && (
        <p className="text-xs sm:text-sm line-clamp-3 leading-relaxed drop-shadow-xs text-white/95">
          {post.content}
        </p>
      )}

      {/* Sound track indicator */}
      <div className="flex items-center space-x-2 text-[11px] text-white/80">
        <Music className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
        <span className="truncate">Âm thanh gốc · {post.authorName}</span>
      </div>
    </div>
  );
};
