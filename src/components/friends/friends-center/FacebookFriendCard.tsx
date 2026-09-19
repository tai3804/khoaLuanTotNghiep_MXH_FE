import React from 'react';
import { UserPlus, MessageCircle, Check } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export interface FacebookFriendCardProps {
  item: any;
  type: 'request' | 'suggestion' | 'friend' | 'follower';
  isSent?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onAdd?: () => void;
  onRemove?: () => void;
  onChat?: () => void;
  onUnfriend?: () => void;
  onViewProfile?: () => void;
}

const DEFAULT_AVATAR = '/default-avatar.png';

const getDisplayAvatar = (avatar: string | undefined) => {
  if (avatar && avatar.trim().length > 5) return avatar;
  return DEFAULT_AVATAR;
};

export const FacebookFriendCard: React.FC<FacebookFriendCardProps> = ({
  item,
  type,
  isSent,
  onAccept,
  onReject,
  onAdd,
  onRemove,
  onChat,
  onUnfriend,
  onViewProfile,
}) => {
  const { language, t } = useLanguage();
  const displayName =
    item.name ||
    item.fullName ||
    (item.lastName || item.firstName ? `${item.lastName || ''} ${item.firstName || ''}`.trim() : 'User');

  const avatarSrc = getDisplayAvatar(item.avatar || item.avatarUrl);

  const cardSubtitle =
    type === 'request'
      ? (language === 'en' ? 'Sent you a friend request' : 'Đã gửi cho bạn lời mời kết bạn')
      : type === 'friend'
      ? (language === 'en' ? 'Friends on KLTN Social' : 'Bạn bè trên KLTN Social')
      : item.mutualFriendsCount && item.mutualFriendsCount > 0
      ? (language === 'en' ? `${item.mutualFriendsCount} mutual friends` : `${item.mutualFriendsCount} bạn chung`)
      : (item.bio && item.bio !== 'Gợi ý kết bạn' ? item.bio : t('friends.suggestions'));

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl overflow-hidden border border-gray-200 dark:border-[#393a3b] shadow-sm hover:shadow-md transition duration-200 flex flex-col group select-none">
      {/* 1. Square Avatar / Cover Photo at Top */}
      <div
        onClick={onViewProfile}
        className="relative w-full aspect-square bg-gray-100 dark:bg-[#3a3b3c] overflow-hidden cursor-pointer"
      >
        <img
          src={avatarSrc}
          alt={displayName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
          }}
        />
        {/* Subtle hover gradient */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* 2. Card Info & Facebook Action Buttons */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
        {/* Name & Subtitle */}
        <div className="min-w-0">
          <h4
            onClick={onViewProfile}
            title={displayName}
            className="font-bold text-sm sm:text-base text-gray-900 dark:text-[#e4e6eb] hover:underline cursor-pointer truncate block"
          >
            {displayName}
          </h4>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] truncate mt-0.5">
            {cardSubtitle}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-1.5 pt-1">
          {/* TYPE: REQUEST (Lời mời kết bạn) */}
          {type === 'request' && (
            <>
              <button
                onClick={onAccept}
                className="w-full py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>{t('friends.confirm')}</span>
              </button>
              <button
                onClick={onReject}
                className="w-full py-2 bg-gray-200 hover:bg-gray-300 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
              >
                <span>{t('friends.delete')}</span>
              </button>
            </>
          )}

          {/* TYPE: SUGGESTION (Gợi ý kết bạn) */}
          {type === 'suggestion' && (
            <>
              {isSent ? (
                <button
                  disabled
                  className="w-full py-2 bg-gray-100 dark:bg-[#3a3b3c]/60 text-gray-500 dark:text-[#b0b3b8] font-bold text-xs sm:text-sm rounded-xl cursor-default flex items-center justify-center space-x-1 border border-gray-200 dark:border-[#393a3b]"
                >
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{t('friends.requestSent')}</span>
                </button>
              ) : (
                <button
                  onClick={onAdd}
                  className="w-full py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t('friends.addFriend')}</span>
                </button>
              )}
              <button
                onClick={onRemove}
                className="w-full py-2 bg-gray-200 hover:bg-gray-300 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
              >
                <span>{t('friends.remove')}</span>
              </button>
            </>
          )}

          {/* TYPE: FRIEND (Tất cả bạn bè) */}
          {type === 'friend' && (
            <>
              <button
                onClick={onChat}
                className="w-full py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t('friends.message')}</span>
              </button>
              <button
                onClick={onUnfriend}
                className="w-full py-1.5 bg-gray-100 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:bg-[#3a3b3c] text-gray-600 dark:text-[#b0b3b8] font-bold text-xs rounded-xl transition cursor-pointer"
              >
                <span>{t('friends.unfriend')}</span>
              </button>
            </>
          )}

          {/* TYPE: FOLLOWER */}
          {type === 'follower' && onViewProfile && (
            <button
              onClick={onViewProfile}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
            >
              <span>{t('userMenu.seeProfile') || 'Xem hồ sơ'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
