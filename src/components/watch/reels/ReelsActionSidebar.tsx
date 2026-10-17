import React from 'react';
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';

interface ReelsActionSidebarProps {
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;
  isSaved: boolean;
  isCommentsOpen: boolean;
  onToggleLike: () => void;
  onToggleComments: () => void;
  onToggleSave: () => void;
  onShare: () => void;
}

export const ReelsActionSidebar: React.FC<ReelsActionSidebarProps> = ({
  isLiked,
  likesCount,
  commentsCount,
  isSaved,
  isCommentsOpen,
  onToggleLike,
  onToggleComments,
  onToggleSave,
  onShare,
}) => {
  return (
    <div className="absolute right-3 bottom-16 flex flex-col items-center space-y-4 z-30 pointer-events-auto">
      {/* Like button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleLike();
        }}
        className="flex flex-col items-center space-y-1 group/btn cursor-pointer"
        title="Thích video"
      >
        <div
          className={`p-3 rounded-full backdrop-blur-md transition-all ${
            isLiked
              ? 'bg-red-500/20 text-red-500 scale-110'
              : 'bg-black/40 text-white hover:bg-black/60 hover:scale-105'
          }`}
        >
          <Heart
            className={`w-6 h-6 transition-transform active:scale-125 ${
              isLiked ? 'fill-red-500 text-red-500' : ''
            }`}
          />
        </div>
        <span className="text-[11px] font-bold text-white drop-shadow-md">
          {likesCount}
        </span>
      </button>

      {/* Comment button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleComments();
        }}
        className="flex flex-col items-center space-y-1 group/btn cursor-pointer"
        title="Bình luận"
      >
        <div
          className={`p-3 rounded-full backdrop-blur-md transition-all ${
            isCommentsOpen
              ? 'bg-[#1877f2]/30 text-[#1877f2]'
              : 'bg-black/40 text-white hover:bg-black/60 hover:scale-105'
          }`}
        >
          <MessageCircle className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-bold text-white drop-shadow-md">
          {commentsCount}
        </span>
      </button>

      {/* Save button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSave();
        }}
        className="flex flex-col items-center space-y-1 group/btn cursor-pointer"
        title={isSaved ? 'Đã lưu' : 'Lưu video'}
      >
        <div
          className={`p-3 rounded-full backdrop-blur-md transition-all ${
            isSaved
              ? 'bg-amber-500/20 text-amber-400 scale-110'
              : 'bg-black/40 text-white hover:bg-black/60 hover:scale-105'
          }`}
        >
          <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-amber-400' : ''}`} />
        </div>
        <span className="text-[11px] font-bold text-white drop-shadow-md">Lưu</span>
      </button>

      {/* Share button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onShare();
        }}
        className="flex flex-col items-center space-y-1 group/btn cursor-pointer"
        title="Chia sẻ liên kết"
      >
        <div className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60 hover:scale-105 backdrop-blur-md transition-all">
          <Share2 className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-bold text-white drop-shadow-md">Chia sẻ</span>
      </button>
    </div>
  );
};
