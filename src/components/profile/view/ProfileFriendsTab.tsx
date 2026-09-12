import React from 'react';

interface ProfileFriendsTabProps {
  friends: any[];
  onViewProfile?: (userId: string) => void;
  onSelectChatUser?: (user: any) => void;
}

export const ProfileFriendsTab: React.FC<ProfileFriendsTabProps> = ({
  friends,
  onViewProfile,
  onSelectChatUser,
}) => {
  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-[#393a3b] max-w-5xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#393a3b] mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">
            Bạn bè ({friends.length})
          </h2>
          <p className="text-xs text-gray-400 dark:text-[#8a8d91]">
            Tất cả những người bạn đã kết nối trên KLTN Social
          </p>
        </div>
      </div>

      {friends.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {friends.map((friend, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 dark:border-[#393a3b] hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/50 transition"
            >
              <div
                onClick={() => onViewProfile && onViewProfile(friend.userId || friend.id)}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 dark:bg-[#3a3b3c]">
                  <img
                    src={friend.avatar || friend.avatarUrl || '/default-avatar.png'}
                    alt={friend.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-[#e4e6eb] hover:underline">
                    {friend.name || `${friend.lastName || ''} ${friend.firstName || ''}`.trim() || 'Bạn bè'}
                  </h4>
                  <p className="text-xs text-gray-400 dark:text-[#8a8d91]">Bạn bè trên KLTN Social</p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onSelectChatUser) {
                    onSelectChatUser({
                      id: friend.userId || friend.id,
                      name: friend.name || `${friend.lastName || ''} ${friend.firstName || ''}`.trim(),
                      avatar: friend.avatar || friend.avatarUrl || '/default-avatar.png',
                      online: true,
                    });
                  }
                }}
                className="bg-blue-50 dark:bg-[#1877f2]/20 text-[#1877f2] dark:text-[#4599ff] hover:bg-blue-100 dark:hover:bg-[#1877f2]/30 text-xs font-bold px-3 py-2 rounded-xl transition"
              >
                Nhắn tin
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-sm text-gray-400 dark:text-[#8a8d91]">
          Chưa có người bạn nào trong danh sách.
        </div>
      )}
    </div>
  );
};
