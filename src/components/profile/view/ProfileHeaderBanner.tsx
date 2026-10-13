import React, { useState } from 'react';
import {
  Camera,
  Edit3,
  HardDrive,
  UserCheck,
  MessageCircle,
  Check,
  X,
  UserX,
  UserPlus,
  MoreHorizontal,
  BarChart3,
  Sparkles,
  Archive,
  Shield,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { ChatUser } from '../../../components/chat/chat-box';
import { ProfessionalBadge } from '../professional/ProfessionalBadge';

interface ProfileHeaderBannerProps {
  coverUrl: string;
  coverError: boolean;
  setCoverError: (val: boolean) => void;
  isOwnProfile: boolean;
  avatarUrl: string;
  fullName: string;
  friendCount: number;
  postCount: number;
  bio?: string;
  isProfessionalMode?: boolean;
  creatorCategory?: string;
  profileViewCount?: number;
  followerCount?: number;
  isFriend: boolean;
  hasPendingReceived: boolean;
  hasPendingSent: boolean;
  activeTab: 'posts' | 'about' | 'friends' | 'photos';
  setActiveTab: (tab: 'posts' | 'about' | 'friends' | 'photos') => void;
  onCoverFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAvatarFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onShowEditModal: () => void;
  onShowManagement?: () => void;
  onShowArchive?: () => void;
  onOpenProfessionalDashboard?: () => void;
  onOpenProfessionalModeModal?: () => void;
  onUnfriend: () => void;
  onAcceptRequest: () => void;
  onRejectRequest: () => void;
  onCancelRequest: () => void;
  onAddFriend: () => void;
  onSelectChatUser?: (user: ChatUser) => void;
  targetUserId?: string | null;
  profileId?: string;
}

export const ProfileHeaderBanner: React.FC<ProfileHeaderBannerProps> = ({
  coverUrl,
  coverError,
  setCoverError,
  isOwnProfile,
  avatarUrl,
  fullName,
  friendCount,
  postCount,
  bio,
  isProfessionalMode,
  creatorCategory,
  profileViewCount,
  followerCount,
  isFriend,
  hasPendingReceived,
  hasPendingSent,
  activeTab,
  setActiveTab,
  onCoverFileSelect,
  onAvatarFileSelect,
  onShowEditModal,
  onShowManagement,
  onShowArchive,
  onOpenProfessionalDashboard,
  onOpenProfessionalModeModal,
  onUnfriend,
  onAcceptRequest,
  onRejectRequest,
  onCancelRequest,
  onAddFriend,
  onSelectChatUser,
  targetUserId,
  profileId,
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [showMenu, setShowMenu] = useState(false);

  const handleOpenDashboard = () => {
    navigate('/profile/creator-dashboard');
  };

  return (
    <div className="bg-white dark:bg-[#242526] shadow-sm rounded-2xl border border-gray-200 dark:border-[#393a3b] transition-colors overflow-hidden mb-4">
      <div className="w-full">
        {/* Cover Image Container */}
        <div className="relative h-44 sm:h-64 md:h-72 lg:h-80 w-full overflow-hidden bg-gray-200 dark:bg-[#3a3b3c]">
          {coverUrl && coverUrl.trim() !== '' && !coverError ? (
            <img
              key={coverUrl}
              src={coverUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={() => {
                console.error('Failed to load cover image:', coverUrl);
                setCoverError(true);
              }}
            />
          ) : (
            <div className="w-full h-full bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-[#242526] dark:via-[#2e2f30] dark:to-[#3a3b3c]" />
          )}

          {isOwnProfile && (
            <>
              <input
                id="profile-header-cover-input"
                type="file"
                onChange={onCoverFileSelect}
                accept="image/*"
                className="hidden"
              />
              <label
                htmlFor="profile-header-cover-input"
                className="absolute right-4 bottom-4 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] p-2 flex items-center justify-center shadow-md text-gray-700 dark:text-[#e4e6eb] transition cursor-pointer"
                title={isEn ? 'Edit cover photo' : 'Chỉnh sửa ảnh bìa'}
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
              </label>
            </>
          )}
        </div>

        {/* User Profile Info Section (Avatar + Name + Action Buttons) */}
        <div className="px-4 sm:px-8 pb-2 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3">
            {/* Left: Avatar overlapping cover + Name and details clearly on solid surface */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 text-center sm:text-left">
              {/* Avatar (Negative margin applies ONLY to avatar) */}
              <div className="relative group -mt-16 sm:-mt-24 md:-mt-28 shrink-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full ring-4 ring-white dark:ring-[#242526] overflow-hidden shadow-xl bg-gray-200 dark:bg-[#3a3b3c] flex items-center justify-center">
                  <img
                    src={avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : '/default-avatar.png'}
                    alt={fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/default-avatar.png';
                    }}
                  />
                </div>
                {isOwnProfile && (
                  <>
                    <input
                      id="profile-header-avatar-input"
                      type="file"
                      onChange={onAvatarFileSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <label
                      htmlFor="profile-header-avatar-input"
                      className="absolute right-1 bottom-1 z-20 w-8 h-8 sm:w-9 sm:h-9 bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] flex items-center justify-center rounded-full shadow-md text-gray-700 dark:text-[#e4e6eb] transition cursor-pointer"
                      title={isEn ? 'Change profile picture' : 'Thay đổi ảnh đại diện'}
                    >
                      <Camera className="w-4 h-4" />
                    </label>
                  </>
                )}
              </div>

              {/* Name & Basic Counts - Positioned below the cover for 100% readability */}
              <div className="pt-2 sm:pt-0 pb-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-[#e4e6eb] flex items-center space-x-2 tracking-tight">
                    <span>{fullName}</span>
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" title={isEn ? 'Active now' : 'Đang hoạt động'} />
                  </h1>
                  {isProfessionalMode && (
                    <ProfessionalBadge category={creatorCategory} />
                  )}
                </div>

                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-[#b0b3b8] mt-1">
                  {followerCount !== undefined && followerCount > 0
                    ? `${followerCount.toLocaleString(isEn ? 'en-US' : 'vi-VN')} ${isEn ? 'followers' : 'người theo dõi'} • `
                    : ''}
                  {friendCount} {isEn ? 'friends' : 'bạn bè'} • {postCount} {isEn ? 'posts' : 'bài viết'}
                  {profileViewCount !== undefined && profileViewCount > 0 && isOwnProfile ? (
                    <span className="text-[#1877f2] dark:text-[#4599ff] font-semibold ml-1">
                      • {profileViewCount.toLocaleString(isEn ? 'en-US' : 'vi-VN')} {isEn ? 'profile views' : 'lượt xem hồ sơ'}
                    </span>
                  ) : null}
                </p>

                {bio && (
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-[#b0b3b8] mt-1 max-w-md italic">
                    "{bio}"
                  </p>
                )}
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 pt-3 sm:pt-6 md:pt-10 pb-1">
              {isOwnProfile ? (
                <>
                  {/* Option 1: Dedicated Dashboard Button (ONLY if professional mode is enabled) */}
                  {isProfessionalMode && (
                    <button
                      onClick={handleOpenDashboard}
                      className="flex items-center space-x-2 bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                      title={isEn ? 'View Creator Dashboard' : 'Xem Bảng điều khiển chuyên nghiệp'}
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>{isEn ? 'Dashboard' : 'Bảng điều khiển'}</span>
                    </button>
                  )}

                  {/* Option 2: 3-dots More Actions Button (Dropdown beneath the button) */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu((prev) => !prev)}
                      className={`p-2.5 rounded-xl transition cursor-pointer ${
                        showMenu
                          ? 'bg-gray-200 dark:bg-[#4e4f50] text-[#1877f2] dark:text-[#4599ff]'
                          : 'bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb]'
                      }`}
                      title={isEn ? 'Profile options & settings' : 'Tùy chọn & quản lý trang cá nhân'}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {showMenu && (
                      <>
                        {/* Invisible backdrop to dismiss dropdown on outside click */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowMenu(false)}
                        />

                        {/* Dropdown Menu anchored right beneath the 3-dots button */}
                        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white dark:bg-[#242526] shadow-2xl border border-gray-200 dark:border-[#393a3b] p-1.5 z-50">
                          {/* 1. Edit Profile */}
                          <button
                            onClick={() => {
                              setShowMenu(false);
                              onShowEditModal();
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4 text-gray-600 dark:text-[#b0b3b8] shrink-0" />
                            <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-[#e4e6eb] truncate">
                              {isEn ? 'Edit Profile' : 'Chỉnh sửa trang cá nhân'}
                            </span>
                          </button>

                          {/* 3. Professional Mode */}
                          {onOpenProfessionalModeModal && (
                            <button
                              onClick={() => {
                                setShowMenu(false);
                                onOpenProfessionalModeModal();
                              }}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
                            >
                              <Sparkles className="w-4 h-4 text-gray-600 dark:text-[#b0b3b8] shrink-0" />
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-[#e4e6eb] truncate">
                                {isProfessionalMode
                                  ? isEn ? 'Professional Mode Settings' : 'Cài đặt Chế độ chuyên nghiệp'
                                  : isEn ? 'Turn on Professional Mode' : 'Bật Chế độ chuyên nghiệp'}
                              </span>
                            </button>
                          )}

                          {/* 4. Archive */}
                          {(onShowArchive || onShowManagement) && (
                            <button
                              onClick={() => {
                                setShowMenu(false);
                                if (onShowArchive) onShowArchive();
                                else if (onShowManagement) onShowManagement();
                              }}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
                            >
                              <Archive className="w-4 h-4 text-gray-600 dark:text-[#b0b3b8] shrink-0" />
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-[#e4e6eb] truncate">
                                {isEn ? 'Archive' : 'Kho lưu trữ'}
                              </span>
                            </button>
                          )}

                          {/* 5. Privacy Settings */}
                          <button
                            onClick={() => {
                              setShowMenu(false);
                              navigate('/settings/privacy');
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
                          >
                            <Shield className="w-4 h-4 text-gray-600 dark:text-[#b0b3b8] shrink-0" />
                            <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-[#e4e6eb] truncate">
                              {isEn ? 'Privacy Settings' : 'Cài đặt quyền riêng tư'}
                            </span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {isFriend ? (
                    <>
                      <button
                        onClick={onUnfriend}
                        className="flex items-center space-x-2 bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition cursor-pointer"
                        title={isEn ? 'Click to unfriend' : 'Nhấn để hủy kết bạn'}
                      >
                        <UserCheck className="w-4 h-4 text-[#1877f2]" />
                        <span>{isEn ? 'Friends' : 'Bạn bè'}</span>
                      </button>
                      <button
                        onClick={() => {
                          if (onSelectChatUser) {
                            const targetId = profileId || targetUserId || 'chat';
                            onSelectChatUser({
                              id: targetId,
                              userId: targetId,
                              name: fullName,
                              avatar: avatarUrl,
                              online: true,
                            });
                          }
                        }}
                        className="flex items-center space-x-2 bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{isEn ? 'Message' : 'Nhắn tin'}</span>
                      </button>
                    </>
                  ) : hasPendingReceived ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={onAcceptRequest}
                        className="flex items-center space-x-1.5 bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isEn ? 'Confirm' : 'Xác nhận'}</span>
                      </button>
                      <button
                        onClick={onRejectRequest}
                        className="flex items-center space-x-1.5 bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>{isEn ? 'Delete request' : 'Xóa lời mời'}</span>
                      </button>
                    </div>
                  ) : hasPendingSent ? (
                    <button
                      onClick={onCancelRequest}
                      className="flex items-center space-x-2 bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition cursor-pointer"
                      title={isEn ? 'Cancel friend request' : 'Nhấn để thu hồi lời mời kết bạn'}
                    >
                      <UserX className="w-4 h-4 text-red-500" />
                      <span>{isEn ? 'Cancel request' : 'Hủy lời mời'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={onAddFriend}
                      className="flex items-center space-x-2 bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{isEn ? 'Add friend' : 'Thêm bạn bè'}</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-t border-gray-200 dark:border-[#393a3b] pt-1 mt-2">
            <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'posts', label: isEn ? 'Posts' : 'Bài viết' },
                { id: 'about', label: isEn ? 'About' : 'Giới thiệu' },
                { id: 'friends', label: isEn ? 'Friends' : 'Bạn bè' },
                { id: 'photos', label: isEn ? 'Photos' : 'Ảnh' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-4 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                    activeTab === tab.id
                      ? 'text-[#1877f2] dark:text-[#4599ff] border-b-2 border-[#1877f2] dark:border-[#4599ff] rounded-b-none'
                      : 'text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
