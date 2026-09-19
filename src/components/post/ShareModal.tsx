import React, { useState } from 'react';
import { X, Globe, Users, Lock, Share2, Copy, Check, Loader2 } from 'lucide-react';
import { Post } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { postService } from '../../services/api';

interface ShareModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onShareSuccess?: (newPost: Post) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  post,
  isOpen,
  onClose,
  onShareSuccess,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const toast = useToast();

  const [caption, setCaption] = useState('');
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'FRIENDS' | 'PRIVATE'>('PUBLIC');
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/posts/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    toast.showSuccess(
      language === 'en' ? 'Link copied to clipboard!' : 'Đã sao chép liên kết vào bộ nhớ tạm!'
    );
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareSubmit = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const createdPost = await postService.sharePost(post.id, caption.trim(), privacy);
      toast.showSuccess(
        language === 'en'
          ? 'Post shared successfully to your timeline!'
          : 'Đã chia sẻ bài viết lên trang cá nhân của bạn!'
      );
      if (onShareSuccess) {
        onShareSuccess({
          ...createdPost,
          originalPostId: post.id,
          sharedPost: post,
        });
      }
      onClose();
    } catch (err: any) {
      toast.showError(
        language === 'en'
          ? 'Failed to share post: ' + (err.response?.data?.message || err.message)
          : 'Không thể chia sẻ bài viết: ' + (err.response?.data?.message || err.message)
      );
    } finally {
      setSharing(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#242526] rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 dark:border-[#393a3b] overflow-hidden flex flex-col transition-all transform animate-scale-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#393a3b]">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-[#1877f2]" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-[#e4e6eb]">
              {language === 'en' ? 'Share Post' : 'Chia sẻ bài viết'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* User Info & Privacy selector */}
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar || '/default-avatar.png'}
              alt={user?.fullName || 'User'}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100 dark:ring-[#393a3b]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-avatar.png';
              }}
            />
            <div className="flex-1">
              <span className="font-bold text-sm text-gray-900 dark:text-[#e4e6eb] block">
                {user?.fullName || 'Bạn'}
              </span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as any)}
                  className="text-xs font-semibold bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#4e4f50] rounded-lg px-2.5 py-1 outline-none cursor-pointer hover:bg-gray-200 dark:hover:bg-[#4e4f50] transition"
                >
                  <option value="PUBLIC">🌍 {language === 'en' ? 'Public' : 'Công khai'}</option>
                  <option value="FRIENDS">👥 {language === 'en' ? 'Friends' : 'Bạn bè'}</option>
                  <option value="PRIVATE">🔒 {language === 'en' ? 'Only Me' : 'Chỉ mình tôi'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* User thoughts / caption input */}
          <div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={
                language === 'en'
                  ? 'Say something about this post...'
                  : 'Hãy viết gì đó về bài viết này...'
              }
              rows={3}
              className="w-full text-sm bg-transparent border-0 text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0 resize-none"
            />
          </div>

          {/* Original Post Preview Box */}
          <div className="rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50/50 dark:bg-[#18191a]/50 p-3.5 space-y-2.5">
            <div className="flex items-center space-x-2.5">
              <img
                src={post.authorAvatar || '/default-avatar.png'}
                alt={post.authorName}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar.png';
                }}
              />
              <div>
                <span className="font-bold text-xs text-gray-900 dark:text-[#e4e6eb] block leading-tight">
                  {post.authorName}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  {post.createdAt}
                </span>
              </div>
            </div>

            {post.content && (
              <p className="text-xs text-gray-800 dark:text-[#d0d2d6] line-clamp-3 whitespace-pre-line">
                {post.content}
              </p>
            )}

            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <div className="rounded-lg overflow-hidden max-h-48 border border-gray-200 dark:border-[#393a3b] bg-black/5">
                <img
                  src={post.mediaUrls[0]}
                  alt="Post media"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 dark:border-[#393a3b] bg-gray-50 dark:bg-[#1f2021]">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-green-600 dark:text-green-400 font-bold">
                  {language === 'en' ? 'Copied' : 'Đã sao chép'}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>{language === 'en' ? 'Copy Link' : 'Sao chép liên kết'}</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#3a3b3c] transition"
            >
              {language === 'en' ? 'Cancel' : 'Hủy'}
            </button>
            <button
              type="button"
              onClick={handleShareSubmit}
              disabled={sharing}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1877f2] hover:bg-[#166fe5] shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {sharing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{language === 'en' ? 'Sharing...' : 'Đang chia sẻ...'}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Share Now' : 'Chia sẻ ngay'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
