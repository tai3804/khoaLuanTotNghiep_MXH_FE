import React from 'react';
import { Search, MoreHorizontal, UserX } from 'lucide-react';
import { ChatUser } from '../../../components/chat/chat-box';
import { UserAvatar } from '../../common/UserAvatar';

interface ActiveContactsWidgetProps {
  contacts: ChatUser[];
  loading: boolean;
  contactSearch: string;
  onSearchChange: (search: string) => void;
  showSearchInput: boolean;
  onToggleSearch: () => void;
  onSelectChatUser?: (user: ChatUser) => void;
  title?: string;
}

const formatActiveTooltip = (online: boolean, lastActiveAt?: string | null): string => {
  if (online) return 'Đang hoạt động';
  if (!lastActiveAt) return 'Ngoại tuyến';

  try {
    const time = new Date(lastActiveAt).getTime();
    if (isNaN(time)) return 'Ngoại tuyến';
    const diffMins = Math.floor((Date.now() - time) / (1000 * 60));
    if (diffMins < 1) return 'Vừa mới hoạt động';
    if (diffMins < 60) return `Hoạt động ${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hoạt động ${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    return `Hoạt động ${diffDays} ngày trước`;
  } catch {
    return 'Ngoại tuyến';
  }
};

export const ActiveContactsWidget: React.FC<ActiveContactsWidgetProps> = ({
  contacts,
  loading,
  contactSearch,
  onSearchChange,
  showSearchInput,
  onToggleSearch,
  onSelectChatUser,
  title = 'Người liên hệ',
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 px-1">
        <h3 className="text-gray-500 dark:text-[#b0b3b8] font-bold text-sm">
          {title} ({contacts.length})
        </h3>
        <div className="flex items-center space-x-1 text-gray-500 dark:text-[#b0b3b8]">
          <button
            type="button"
            onClick={onToggleSearch}
            className="hover:bg-gray-200 dark:hover:bg-[#3a3b3c] p-1.5 rounded-full transition cursor-pointer"
            title="Tìm người liên hệ"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="hover:bg-gray-200 dark:hover:bg-[#3a3b3c] p-1.5 rounded-full transition cursor-pointer"
            title="Tùy chọn"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contact search input */}
      {showSearchInput && (
        <div className="mb-2">
          <input
            type="text"
            value={contactSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm bạn bè..."
            className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 dark:placeholder-[#b0b3b8] text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-transparent focus:outline-none focus:ring-1 focus:ring-[#2d88ff]"
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-6 text-xs text-gray-400">
          Đang tải danh sách bạn bè...
        </div>
      ) : contacts.length === 0 ? (
        <div className="p-4 bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-[#393a3b] text-center space-y-1.5">
          <UserX className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto" />
          <p className="text-xs text-gray-700 dark:text-[#e4e6eb] font-semibold">
            Chưa có người liên hệ
          </p>
          <p className="text-[11px] text-gray-400 dark:text-[#b0b3b8]">
            Khi bạn kết bạn với người dùng khác trong hệ thống, họ sẽ xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {contacts.map((contact) => {
            const isOnline = Boolean(contact.online);
            const tooltipText = formatActiveTooltip(isOnline, contact.lastActiveAt);

            return (
              <div
                key={contact.id}
                onClick={() =>
                  onSelectChatUser &&
                  onSelectChatUser({
                    ...contact,
                    id: contact.userId || contact.id,
                    userId: contact.userId || contact.id,
                  })
                }
                title={`${contact.name} · ${tooltipText}`}
                className="flex items-center space-x-3 px-2 py-1.5 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60 cursor-pointer transition group"
              >
                <div className="relative shrink-0">
                  <UserAvatar
                    src={contact.avatar}
                    alt={contact.name}
                    size="sm"
                    className="w-9 h-9 rounded-full"
                  />
                  {/* Online Indicator: only display green dot when online; no dot when offline */}
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#242526] rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900 dark:text-[#e4e6eb] truncate block group-hover:text-[#1877f2] transition-colors">
                    {contact.name}
                  </span>
                  <span className="text-[10.5px] text-gray-400 dark:text-[#8a8d91] truncate block">
                    {tooltipText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
