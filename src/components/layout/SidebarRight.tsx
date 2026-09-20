import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Search, MoreHorizontal, UserX, Gift, Edit, Sparkles, Plus, Users } from 'lucide-react';
import { ChatUser } from '../../components/chat/chat-box';
import { UserAvatar } from '../common/UserAvatar';
import { userService } from '../../services/api';
import { chatService } from '../../services/chatService';
import { websocketService } from '../../services/websocket';
import { CreateGroupModal } from '../chat/CreateGroupModal';

interface SidebarRightProps {
  onSelectChatUser?: (user: ChatUser) => void;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({ onSelectChatUser }) => {
  const { t } = useLanguage();
  const { isAuthenticated, tokens } = useAuth();
  const [contacts, setContacts] = useState<ChatUser[]>([]);
  const [groupChats, setGroupChats] = useState<ChatUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated && tokens?.accessToken) {
      websocketService.connect();
    }
  }, [isAuthenticated, tokens?.accessToken]);

  useEffect(() => {
    if (!isAuthenticated) {
      setContacts([]);
      setPendingRequests([]);
      return;
    }

    const fetchData = async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const [friends, requests] = await Promise.all([
          userService.getFriends().catch(() => []),
          userService.getPendingRequests().catch(() => []),
        ]);

        const friendsList = Array.isArray(friends) ? friends : [];
        const friendIds = friendsList.map((f: any) => f.userId || f.id).filter(Boolean);

        let presenceMap: Record<string, any> = {};
        if (friendIds.length > 0) {
          try {
            presenceMap = await chatService.getBatchPresence(friendIds);
          } catch {}
        }

        const mappedContacts: ChatUser[] = friendsList.map((f: any) => {
          const fId = f.userId || f.id;
          const presence = fId ? presenceMap[fId] : null;
          return {
            ...f,
            id: fId,
            userId: fId,
            online: presence ? Boolean(presence.online) : false,
            lastActiveAt: presence?.lastActiveAt || null,
          };
        });

        setContacts(mappedContacts);
        setPendingRequests(Array.isArray(requests) ? requests : []);
      } catch (e) {
        if (!silent) setContacts([]);
      } finally {
        if (!silent) setLoading(false);
      }
    };

    const fetchGroupChats = async () => {
      try {
        const convs = await chatService.getConversations();
        if (Array.isArray(convs)) {
          const groups: ChatUser[] = convs
            .filter((c: any) => c.type === 'GROUP')
            .map((c: any) => ({
              id: c.conversationId,
              conversationId: c.conversationId,
              isGroup: true,
              name: c.name || 'Nhóm chat',
              avatar: c.avatarUrl || '/default-avatar.png',
              online: true,
              lastMessageContent: c.lastMessageContent,
            }));
          setGroupChats(groups);
        }
      } catch (err) {
        console.error('[SidebarRight] Error loading group chats', err);
      }
    };

    fetchData(false);
    fetchGroupChats();

    const interval = setInterval(() => {
      fetchData(true);
      fetchGroupChats();
    }, 15000);

    const handleFriendUpdate = () => fetchData(true);
    const handleGroupUpdate = () => fetchGroupChats();
    window.addEventListener('friend_status_updated', handleFriendUpdate);
    window.addEventListener('group_chat_created', handleGroupUpdate);
    window.addEventListener('group_chat_updated', handleGroupUpdate);

    const handlePresence = (e: any) => {
      const detail = e.detail;
      if (!detail || !detail.userId) return;
      setContacts((prev) =>
        prev.map((c) => {
          const cId = c.userId || c.id;
          if (cId && String(cId).toLowerCase() === String(detail.userId).toLowerCase()) {
            return {
              ...c,
              online: Boolean(detail.online),
              lastActiveAt: detail.lastActiveAt || c.lastActiveAt,
            };
          }
          return c;
        })
      );
    };
    window.addEventListener('user_presence_updated', handlePresence);

    return () => {
      clearInterval(interval);
      window.removeEventListener('friend_status_updated', handleFriendUpdate);
      window.removeEventListener('group_chat_created', handleGroupUpdate);
      window.removeEventListener('group_chat_updated', handleGroupUpdate);
      window.removeEventListener('user_presence_updated', handlePresence);
    };
  // On a hard reload AuthContext restores `isAuthenticated` before the token
  // state has finished hydrating.  Re-run when the token arrives; otherwise
  // fetchData returns early once and contacts stay empty until navigation.
  }, [isAuthenticated, tokens?.accessToken]);

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
      <div className="px-1 space-y-1">
        <h3 className="text-gray-500 dark:text-[#b0b3b8] font-bold text-sm mb-1.5">
          Cuộc trò chuyện nhóm
        </h3>

        <button
          onClick={() => setShowCreateGroupModal(true)}
          className="flex items-center space-x-3 w-full p-2 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60 cursor-pointer transition text-left group"
        >
          <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#1877f2] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-[#e4e6eb]">
            Tạo nhóm mới
          </span>
        </button>

        {groupChats.length > 0 && (
          <div className="space-y-0.5 pt-1">
            {groupChats.map((group) => (
              <div
                key={group.id}
                onClick={() => onSelectChatUser && onSelectChatUser(group)}
                className="flex items-center space-x-3 px-2 py-1.5 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60 cursor-pointer transition group"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-[#e4e6eb] truncate">
                    {group.name}
                  </div>
                  {group.lastMessageContent && (
                    <div className="text-[11px] text-gray-400 dark:text-[#b0b3b8] truncate">
                      {group.lastMessageContent}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onGroupCreated={(conversation) => {
          if (onSelectChatUser) {
            onSelectChatUser({
              id: conversation.id || conversation.conversationId,
              conversationId: conversation.conversationId || conversation.id,
              isGroup: true,
              name: conversation.name || 'Nhóm mới',
              avatar: conversation.avatarUrl || '/default-avatar.png',
              online: true,
            });
          }
        }}
      />
    </aside>
  );
};
