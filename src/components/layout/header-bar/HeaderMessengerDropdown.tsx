import React, { RefObject } from 'react';
import { MessageCircle, Search, Plus } from 'lucide-react';
import { ChatUser } from '../../../components/chat/chat-box';
import { UserAvatar } from '../../common/UserAvatar';
import { CreateGroupModal } from '../../chat/CreateGroupModal';

interface HeaderMessengerDropdownProps {
  msgMenuRef: RefObject<HTMLDivElement | null>;
  showMsgMenu: boolean;
  setShowMsgMenu: (show: boolean | ((prev: boolean) => boolean)) => void;
  setShowNotifMenu: (show: boolean) => void;
  setShowUserMenu: (show: boolean) => void;
  msgSearch: string;
  setMsgSearch: (query: string) => void;
  msgSearchResults?: ChatUser[];
  msgSearching?: boolean;
  chatContacts: ChatUser[];
  loadingChatContacts: boolean;
  t: (key: string) => string;
  onSelectChatUser?: (user: ChatUser) => void;
}

export const HeaderMessengerDropdown: React.FC<HeaderMessengerDropdownProps> = ({
  msgMenuRef,
  showMsgMenu,
  setShowMsgMenu,
  setShowNotifMenu,
  setShowUserMenu,
  msgSearch,
  setMsgSearch,
  msgSearchResults = [],
  msgSearching = false,
  chatContacts,
  loadingChatContacts,
  t,
  onSelectChatUser,
}) => {
  // If searching globally, show search results. Otherwise show local contacts.
  const isSearching = msgSearch.trim().length > 0;
  const displayContacts = isSearching ? msgSearchResults : chatContacts;
  const showLoading = isSearching ? msgSearching : loadingChatContacts;

  const [showCreateGroup, setShowCreateGroup] = React.useState(false);

  const handleGroupCreated = (conversation: any) => {
    if (onSelectChatUser) {
      onSelectChatUser({
        id: conversation.id || conversation.conversationId,
        conversationId: conversation.conversationId,
        isGroup: true,
        name: conversation.name || 'Nhóm mới',
        avatar: conversation.avatarUrl || '/default-avatar.png',
        online: true,
      } as any);
    }
    setShowMsgMenu(false);
  };

  return (
    <div ref={msgMenuRef} className="relative">
      <button
        onClick={() => {
          setShowMsgMenu((prev) => !prev);
          setShowNotifMenu(false);
          setShowUserMenu(false);
        }}
        className={`w-10 h-10 flex items-center justify-center rounded-full transition cursor-pointer ${
          showMsgMenu
            ? 'bg-[#2d88ff]/20 text-[#2d88ff]'
            : 'bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-700 dark:text-[#e4e6eb]'
        }`}
        title="Messenger"
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      {showMsgMenu && (
        <div className="absolute right-0 top-12 w-[calc(100vw-1.5rem)] max-w-sm sm:w-96 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-2xl shadow-2xl p-3 z-50 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h4 className="font-extrabold text-base text-gray-900 dark:text-[#e4e6eb]">{t('messenger.chats')}</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateGroup(true)}
                className="text-[11px] flex items-center gap-1 text-[#1877f2] font-bold cursor-pointer hover:underline px-2 py-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Tạo nhóm
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 dark:text-[#b0b3b8] absolute left-3 top-2.5" />
            <input
              type="text"
              value={msgSearch}
              onChange={(e) => setMsgSearch(e.target.value)}
              placeholder={t('messenger.search')}
              className="w-full bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-500 dark:placeholder-[#b0b3b8] pl-8 pr-3 py-1.5 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="max-h-80 overflow-y-auto space-y-1">
            {showLoading ? (
              <div className="py-8 text-center text-xs text-gray-400">{t('search.searching') || t('messenger.loading')}</div>
            ) : displayContacts.length === 0 ? (
              <div className="py-8 px-4 text-center space-y-2">
                <MessageCircle className="w-8 h-8 text-gray-300 dark:text-[#4e4f50] mx-auto" />
                <p className="text-xs font-semibold text-gray-700 dark:text-[#e4e6eb]">
                  {isSearching ? t('search.noResults') || 'Không tìm thấy kết quả' : t('messenger.noFriends')}
                </p>
                {!isSearching && (
                  <p className="text-[11px] text-gray-400 dark:text-[#b0b3b8]">{t('messenger.noFriendsSub')}</p>
                )}
              </div>
            ) : (
              displayContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => {
                    if (onSelectChatUser) {
                      onSelectChatUser({
                        ...contact,
                        id: contact.userId || contact.id,
                        userId: contact.userId || contact.id,
                      });
                    }
                    setShowMsgMenu(false);
                  }}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-[#3a3b3c] rounded-xl cursor-pointer transition group"
                >
                  <div className="relative shrink-0">
                    <UserAvatar src={contact.avatar} alt={contact.name} size="md" />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#242526] rounded-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-gray-900 dark:text-[#e4e6eb] truncate group-hover:text-blue-600 transition">
                      {contact.name} {contact.isGroup && <span className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-md ml-1 font-medium">Nhóm</span>}
                    </div>
                    <div className="text-[11px] text-gray-400 dark:text-[#b0b3b8] truncate">
                      {contact.lastMessageContent || t('messenger.clickToChat')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
};
