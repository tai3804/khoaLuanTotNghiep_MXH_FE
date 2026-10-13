import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Share2,
  Copy,
  Check,
  Loader2,
  Layout,
  MessageCircle,
  Globe,
  Users,
  Lock,
  ChevronDown,
  Link2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Post } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { postService } from '../../services/api';
import { isVideo } from './post-card/PostCardContent';
import { ShareViaMessageTab } from './ShareViaMessageTab';
import { TimeAgo } from '../common/TimeAgo';
import { GroupAvatar } from '../common/GroupAvatar';
import { UserAvatar } from '../common/UserAvatar';

interface ShareModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onShareSuccess?: (newPost: Post) => void;
}

type ShareTab = 'FEED' | 'MESSAGE' | 'LINK';

export const ShareModal: React.FC<ShareModalProps> = ({
  post,
  isOpen,
  onClose,
  onShareSuccess,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<ShareTab>('FEED');
  const [caption, setCaption] = useState('');
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'FRIENDS' | 'PRIVATE'>('PUBLIC');
  const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const privacyDropdownRef = useRef<HTMLDivElement>(null);
  const postUrl = `${window.location.origin}/posts/${post.id}`;

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setCaption('');
      setActiveTab('FEED');
      setShowPrivacyDropdown(false);
    }
  }, [isOpen]);

  // Close privacy dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (privacyDropdownRef.current && !privacyDropdownRef.current.contains(e.target as Node)) {
        setShowPrivacyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSmoothClose = () => {
    if (sharing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    toast.showSuccess(
      language === 'en' ? 'Link copied to clipboard!' : 'Đã sao chép liên kết vào bộ nhớ tạm!'
    );
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.authorName} trên KLTN Social`,
          text: post.content ? post.content.slice(0, 100) : 'Xem bài viết này',
          url: postUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
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
      handleSmoothClose();
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

  if (!isOpen && !isClosing) return null;

  const firstMedia = post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls[0] : null;
  const isMediaVideo = firstMedia ? isVideo(firstMedia, post.mediaList?.[0]?.mediaType) : false;

  return createPortal(
    <div
      onClick={handleSmoothClose}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-[#242526] rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200/80 dark:border-[#393a3b] overflow-hidden flex flex-col transition-all duration-200 transform ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-[#393a3b]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-[#1877f2]/20 flex items-center justify-center text-[#1877f2]">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-[#e4e6eb]">
              {language === 'en' ? 'Share Post' : 'Chia sẻ bài viết'}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleSmoothClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modern Segmented Navigation Tabs */}
        <div className="p-3 bg-gray-50/70 dark:bg-[#1c1d1e] border-b border-gray-100 dark:border-[#393a3b]">
          <div className="flex items-center bg-gray-200/70 dark:bg-[#2e2f31] p-1 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('FEED')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'FEED'
                  ? 'bg-white dark:bg-[#242526] text-[#1877f2] shadow-sm'
                  : 'text-gray-600 dark:text-[#b0b3b8] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Feed' : 'Bảng tin'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('MESSAGE')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'MESSAGE'
                  ? 'bg-white dark:bg-[#242526] text-[#1877f2] shadow-sm'
                  : 'text-gray-600 dark:text-[#b0b3b8] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Messenger' : 'Tin nhắn'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('LINK')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'LINK'
                  ? 'bg-white dark:bg-[#242526] text-[#1877f2] shadow-sm'
                  : 'text-gray-600 dark:text-[#b0b3b8] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Link' : 'Liên kết'}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto scrollbar-thin">
          {activeTab === 'MESSAGE' ? (
            <ShareViaMessageTab post={post} caption={caption} />
          ) : activeTab === 'LINK' ? (
            /* Link Direct Sharing Tab */
            <div className="space-y-4 py-2">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-[#1877f2] mx-auto flex items-center justify-center shadow-xs">
                  <Link2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-[#e4e6eb]">
                  Liên kết bài viết công khai
                </h4>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
                  Bất kỳ ai có liên kết này đều có thể xem bài viết trực tiếp trên trang chi tiết.
                </p>
              </div>

              {/* URL Box */}
              <div className="flex items-center space-x-2 bg-gray-50 dark:bg-[#18191a] p-2.5 rounded-2xl border border-gray-200 dark:border-[#393a3b]">
                <input
                  type="text"
                  readOnly
                  value={postUrl}
                  className="bg-transparent text-xs font-mono text-gray-800 dark:text-gray-200 flex-1 outline-none truncate select-all px-1"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shrink-0 ${
                    copied
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                      : 'bg-[#1877f2] hover:bg-[#166fe5] text-white shadow-xs'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>

              {/* Native share button if supported */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-[#393a3b] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-xs font-bold text-gray-700 dark:text-[#e4e6eb] transition cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-[#1877f2]" />
                  <span>Mở bảng chia sẻ của hệ thống</span>
                </button>
              )}
            </div>
          ) : (
            /* Feed Sharing Tab */
            <>
              {/* User Info & Privacy selector */}
              <div className="flex items-center space-x-3">
                <UserAvatar
                  src={user?.avatar}
                  alt={user?.fullName || 'User'}
                  size="md"
                  className="ring-2 ring-gray-100 dark:ring-[#393a3b]"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-sm text-gray-900 dark:text-[#e4e6eb] block leading-tight truncate">
                    {user?.fullName || 'Bạn'}
                  </span>

                  {/* Custom Privacy Picker Pill */}
                  <div className="relative inline-block mt-1" ref={privacyDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowPrivacyDropdown((prev) => !prev)}
                      className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#d0d2d6] hover:bg-gray-200 dark:hover:bg-[#4e4f50] transition cursor-pointer border border-gray-200 dark:border-[#4e4f50]"
                    >
                      {privacy === 'PUBLIC' ? (
                        <>
                          <Globe className="w-3 h-3 text-[#1877f2]" />
                          <span>Công khai</span>
                        </>
                      ) : privacy === 'FRIENDS' ? (
                        <>
                          <Users className="w-3 h-3 text-emerald-500" />
                          <span>Bạn bè</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 text-amber-500" />
                          <span>Chỉ mình tôi</span>
                        </>
                      )}
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>

                    {showPrivacyDropdown && (
                      <div className="absolute left-0 mt-1 z-30 w-48 bg-white dark:bg-[#242526] rounded-2xl shadow-xl border border-gray-200 dark:border-[#3e4042] py-1.5 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setPrivacy('PUBLIC');
                            setShowPrivacyDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition ${
                            privacy === 'PUBLIC' ? 'font-bold text-[#1877f2]' : 'text-gray-700 dark:text-[#d0d2d6]'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Globe className="w-3.5 h-3.5" />
                            <span>Công khai</span>
                          </div>
                          {privacy === 'PUBLIC' && <Check className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPrivacy('FRIENDS');
                            setShowPrivacyDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition ${
                            privacy === 'FRIENDS' ? 'font-bold text-emerald-500' : 'text-gray-700 dark:text-[#d0d2d6]'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Users className="w-3.5 h-3.5" />
                            <span>Bạn bè</span>
                          </div>
                          {privacy === 'FRIENDS' && <Check className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPrivacy('PRIVATE');
                            setShowPrivacyDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition ${
                            privacy === 'PRIVATE' ? 'font-bold text-amber-500' : 'text-gray-700 dark:text-[#d0d2d6]'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Chỉ mình tôi</span>
                          </div>
                          {privacy === 'PRIVATE' && <Check className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
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
                      : 'Hãy viết cảm nghĩ của bạn về bài viết này...'
                  }
                  rows={3}
                  className="w-full text-sm bg-gray-50/60 dark:bg-[#18191a]/60 rounded-2xl p-3 border border-gray-200/80 dark:border-[#393a3b] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] resize-none transition"
                />
              </div>

              {/* Original Post Preview Box */}
              <div className="rounded-2xl border border-gray-200 dark:border-[#393a3b] bg-gray-50/60 dark:bg-[#18191a]/60 p-3.5 space-y-2.5 shadow-xs">
                <div className="flex items-center space-x-2.5">
                  {post.groupId ? (
                    <GroupAvatar
                      src={post.groupAvatar || post.groupCover}
                      name={post.groupName || 'Nhóm'}
                      size="sm"
                      shape="squircle"
                    />
                  ) : (
                    <UserAvatar
                      src={post.authorAvatar}
                      alt={post.authorName}
                      size="sm"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs text-gray-900 dark:text-[#e4e6eb] block leading-tight truncate">
                      {post.groupName ? `${post.groupName} · ${post.authorName}` : post.authorName}
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
                      <TimeAgo iso={post.createdAtRaw} fallback={post.createdAt} />
                    </span>
                  </div>
                </div>

                {post.content && (
                  <p className="text-xs text-gray-800 dark:text-[#d0d2d6] line-clamp-3 whitespace-pre-line leading-relaxed">
                    {post.content}
                  </p>
                )}

                {firstMedia && (
                  <div className="rounded-xl overflow-hidden max-h-48 border border-gray-200 dark:border-[#393a3b] bg-black/5">
                    {isMediaVideo ? (
                      <video
                        src={firstMedia}
                        controls
                        className="w-full max-h-48 object-contain bg-black"
                      />
                    ) : (
                      <img
                        src={firstMedia}
                        alt="Post media"
                        className="w-full h-full object-cover max-h-48"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 dark:border-[#393a3b] bg-gray-50 dark:bg-[#1f2021]">
          {/* Quick Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-green-600 dark:text-green-400">
                  {language === 'en' ? 'Copied' : 'Đã chép link'}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gray-500" />
                <span>{language === 'en' ? 'Copy Link' : 'Sao chép link'}</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleSmoothClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200/70 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
            >
              {language === 'en' ? 'Cancel' : 'Hủy'}
            </button>
            {activeTab === 'FEED' && (
              <button
                type="button"
                onClick={handleShareSubmit}
                disabled={sharing}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#1877f2] to-[#1264d0] hover:from-[#166fe5] hover:to-[#0f54b0] shadow-md transition disabled:opacity-50 cursor-pointer"
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
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ShareModal;
