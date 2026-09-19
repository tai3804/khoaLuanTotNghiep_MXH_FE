import React from 'react';
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
} from 'lucide-react';
import { ChatUser } from '../../chat/ChatBox';

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
  isFriend: boolean;
  hasPendingReceived: boolean;
  hasPendingSent: boolean;
  activeTab: 'posts' | 'about' | 'friends' | 'photos';
  setActiveTab: (tab: 'posts' | 'about' | 'friends' | 'photos') => void;
  onCoverFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAvatarFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onShowMediaGallery: () => void;
  onShowEditModal: () => void;
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
  isFriend,
  hasPendingReceived,
  hasPendingSent,
  activeTab,
  setActiveTab,
  onCoverFileSelect,
  onAvatarFileSelect,
  onShowMediaGallery,
  onShowEditModal,
  onUnfriend,
  onAcceptRequest,
  onRejectRequest,
  onCancelRequest,
  onAddFriend,
  onSelectChatUser,
  targetUserId,
  profileId,
}) => {
  return (
    <div className="bg-white dark:bg-[#242526] shadow-sm border-b border-gray-200 dark:border-[#393a3b] transition-colors">
      <div className="max-w-6xl mx-auto px-0 sm:px-4">
        {/* Cover Container */}
        <div className="relative h-48 sm:h-72 md:h-80 lg:h-96 w-full rounded-b-none sm:rounded-b-2xl overflow-hidden bg-gray-200 dark:bg-[#3a3b3c]">
          {coverUrl && !coverError ? (
            <img
              src={coverUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setCoverError(true)}
            />
          ) : null}

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
                className="absolute right-4 bottom-4 z-20 bg-white/90 dark:bg-[#242526]/90 hover:bg-white dark:hover:bg-[#3a3b3c] text-gray-800 dark:text-[#e4e6eb] text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl shadow-md backdrop-blur-sm flex items-center space-x-1.5 transition cursor-pointer"
                title="Chỉnh sửa ảnh bìa"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Chỉnh sửa ảnh bìa</span>
              </label>
            </>
          )}
        </div>

        {/* User Profile Bar (Avatar + Info + Buttons) */}
        <div className="px-4 sm:px-8 pb-3 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-3">
            {/* Left: Avatar + Names */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-3 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
              {/* Large Avatar */}
              <div className="relative group">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full ring-4 ring-white dark:ring-[#242526] overflow-hidden shadow-xl bg-gray-200 dark:bg-[#3a3b3c] flex items-center justify-center shrink-0">
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
                      className="absolute right-1 bottom-1 z-20 bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] p-2 rounded-full shadow-md text-gray-700 dark:text-[#e4e6eb] transition cursor-pointer"
                      title="Thay đổi ảnh đại diện"
                    >
                      <Camera className="w-4 h-4" />
                    </label>
                  </>
                )}
              </div>

              {/* Name & Basic Counts */}
              <div className="pb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-[#e4e6eb] flex items-center justify-center sm:justify-start space-x-2">
                  <span>{fullName}</span>
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" title="Đang hoạt động" />
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-[#b0b3b8] mt-1">
                  {friendCount} bạn bè • {postCount} bài viết
                </p>
                {bio && (
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-[#b0b3b8] mt-1 max-w-md italic">
                    "{bio}"
                  </p>
                )}
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center justify-center sm:justify-end space-x-2 pb-1">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={onShowMediaGallery}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                    title="Thư viện Media"
                  >
                    <HardDrive className="w-4 h-4" />
                    <span>Thư viện Media</span>
                  </button>

                  <button
                    onClick={onShowEditModal}
                    className="flex items-center space-x-2 bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Chỉnh sửa trang cá nhân</span>
                  </button>
                </>
              ) : (
                <>
                  {isFriend ? (
                    <>
                      <button
                        onClick={onUnfriend}
                        className="flex items-center space-x-2 bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                        title="Nhấn để hủy kết bạn"
                      >
                        <UserCheck className="w-4 h-4 text-[#1877f2]" />
                        <span>Bạn bè</span>
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
                        className="flex items-center space-x-2 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Nhắn tin</span>
                      </button>
                    </>
                  ) : hasPendingReceived ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={onAcceptRequest}
                        className="flex items-center space-x-1.5 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Xác nhận</span>
                      </button>
                      <button
                        onClick={onRejectRequest}
                        className="flex items-center space-x-1.5 bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Xóa lời mời</span>
                      </button>
                    </div>
                  ) : hasPendingSent ? (
                    <button
                      onClick={onCancelRequest}
                      className="flex items-center space-x-2 bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                      title="Nhấn để thu hồi lời mời kết bạn"
                    >
                      <UserX className="w-4 h-4 text-red-500" />
                      <span>Hủy lời mời</span>
                    </button>
                  ) : (
                    <button
                      onClick={onAddFriend}
                      className="flex items-center space-x-2 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Thêm bạn bè</span>
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
                { id: 'posts', label: 'Bài viết' },
                { id: 'about', label: 'Giới thiệu' },
                { id: 'friends', label: 'Bạn bè' },
                { id: 'photos', label: 'Ảnh' },
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
