import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Search, MoreHorizontal, UserX, Gift, Edit, Sparkles, Plus } from 'lucide-react';
import { ChatUser } from '../chat/ChatBox';
import { UserAvatar } from '../common/UserAvatar';
import { userService } from '../../services/api';

interface SidebarRightProps {
  onSelectChatUser?: (user: ChatUser) => void;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({ onSelectChatUser }) => {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState<ChatUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchData = async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const [friends, requests] = await Promise.all([
          userService.getFriends().catch(() => []),
          userService.getPendingRequests().catch(() => []),
        ]);
        setContacts(Array.isArray(friends) ? friends : []);
        setPendingRequests(Array.isArray(requests) ? requests : []);
      } catch (e) {
        if (!silent) setContacts([]);
      } finally {
        if (!silent) setLoading(false);
      }
    };

    fetchData(false);

    const interval = setInterval(() => {
      fetchData(true);
    }, 4000);

    const handleFriendUpdate = () => fetchData(true);
    window.addEventListener('friend_status_updated', handleFriendUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('friend_status_updated', handleFriendUpdate);
    };
  }, []);

  const handleAccept = async (requestId: string) => {
    try {
      await userService.acceptFriendRequest(requestId);
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      window.dispatchEvent(new Event('friend_status_updated'));
    } catch {}
  };

  const handleReject = async (requestId: string) => {
    try {
      await userService.rejectFriendRequest(requestId);
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      window.dispatchEvent(new Event('friend_status_updated'));
    } catch {}
  };

  const filteredContacts = contactSearch.trim()
    ? contacts.filter((c) => c.name?.toLowerCase().includes(contactSearch.toLowerCase()))
    : contacts;

  return (
    <aside className="w-[280px] 2xl:w-[340px] hidden xl:block px-3 py-3 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto space-y-4 bg-transparent select-none shrink-0">
      {/* 1. Lời mời kết bạn */}
      {pendingRequests.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-gray-500 dark:text-[#b0b3b8] font-bold text-sm">
              Lời mời kết bạn ({pendingRequests.length})
            </h3>
          </div>

          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div key={req.id} className="p-2.5 rounded-xl bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] shadow-sm flex items-start space-x-3">
                <UserAvatar src={req.senderAvatar || req.avatar} alt={req.senderName || req.fullName} size="lg" className="w-11 h-11 rounded-full" />
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-[#e4e6eb] truncate">
                    {req.senderName || req.fullName || 'Thành viên KLTN'}
                  </h5>
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="flex-1 bg-[#1877f2] hover:bg-[#166fe5] text-white py-1.5 px-3 rounded-md text-xs font-semibold transition cursor-pointer"
                    >
                      Xác nhận
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="flex-1 bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] py-1.5 px-3 rounded-md text-xs font-semibold transition cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <hr className="border-gray-200 dark:border-[#393a3b] mt-4" />
        </div>
      )}

      {/* 2. Người liên hệ (Dữ liệu thật từ userService.getFriends trong DB) */}
      <div>
        <div className="flex items-center justify-between mb-1.5 px-1">
          <h3 className="text-gray-500 dark:text-[#b0b3b8] font-bold text-sm">
            {t('contacts') || 'Người liên hệ'}
          </h3>
          <div className="flex items-center space-x-1 text-gray-500 dark:text-[#b0b3b8]">
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="hover:bg-gray-200 dark:hover:bg-[#3a3b3c] p-1.5 rounded-full transition cursor-pointer"
              title="Tìm người liên hệ"
            >
              <Search className="w-4 h-4" />
            </button>
            <button className="hover:bg-gray-200 dark:hover:bg-[#3a3b3c] p-1.5 rounded-full transition cursor-pointer" title="Tùy chọn">
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
              onChange={(e) => setContactSearch(e.target.value)}
              placeholder="Tìm bạn bè..."
              className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 dark:placeholder-[#b0b3b8] text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-transparent focus:outline-none focus:ring-1 focus:ring-[#2d88ff]"
            />
          </div>
        )}

        {loading ? (
          <div className="text-center py-6 text-xs text-gray-400">Đang tải danh sách bạn bè...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-4 bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-[#393a3b] text-center space-y-1.5">
            <UserX className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto" />
            <p className="text-xs text-gray-700 dark:text-[#e4e6eb] font-semibold">Chưa có người liên hệ</p>
            <p className="text-[11px] text-gray-400 dark:text-[#b0b3b8]">
              Khi bạn kết bạn với người dùng khác trong hệ thống, họ sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => onSelectChatUser && onSelectChatUser({
                  ...contact,
                  id: contact.userId || contact.id,
                  userId: contact.userId || contact.id,
                })}
                className="flex items-center space-x-3 px-2 py-1.5 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60 cursor-pointer transition group"
              >
                <div className="relative shrink-0">
                  <UserAvatar src={contact.avatar} alt={contact.name} size="sm" className="w-9 h-9 rounded-full" />
                  {contact.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#242526] rounded-full" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-[#e4e6eb] truncate">
                  {contact.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr className="border-gray-200 dark:border-[#393a3b]" />

      {/* 3. Cuộc trò chuyện nhóm (Facebook Group Chats section) */}
      <div className="px-1">
        <h3 className="text-gray-500 dark:text-[#b0b3b8] font-bold text-sm mb-1.5">
          Cuộc trò chuyện nhóm
        </h3>
        <button
          onClick={() => {
            if (contacts.length > 0 && onSelectChatUser) {
              onSelectChatUser(contacts[0]);
            }
          }}
          className="flex items-center space-x-3 w-full p-2 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60 cursor-pointer transition text-left"
        >
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-[#3a3b3c] flex items-center justify-center text-gray-600 dark:text-[#e4e6eb] shrink-0">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-[#e4e6eb]">
            Tạo nhóm mới
          </span>
        </button>
      </div>

      {/* Floating Messenger Quick Button at Bottom Right */}
      {contacts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={() => {
              if (onSelectChatUser) {
                onSelectChatUser(contacts[0]);
              }
            }}
            className="w-12 h-12 rounded-full bg-white dark:bg-[#3a3b3c] hover:bg-gray-100 dark:hover:bg-[#4e4f50] text-gray-700 dark:text-[#e4e6eb] shadow-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center cursor-pointer transition transform hover:scale-105"
            title="Tin nhắn"
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
      )}
    </aside>
  );
};
