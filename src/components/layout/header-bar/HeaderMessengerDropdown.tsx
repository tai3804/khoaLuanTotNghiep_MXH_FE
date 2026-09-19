import React, { RefObject } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { ChatUser } from '../../chat/ChatBox';
import { UserAvatar } from '../../common/UserAvatar';

interface HeaderMessengerDropdownProps {
  msgMenuRef: RefObject<HTMLDivElement | null>;
  showMsgMenu: boolean;
  setShowMsgMenu: (show: boolean | ((prev: boolean) => boolean)) => void;
  setShowNotifMenu: (show: boolean) => void;
  setShowUserMenu: (show: boolean) => void;
  msgSearch: string;
  setMsgSearch: (query: string) => void;
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
  chatContacts,
  loadingChatContacts,
  t,
  onSelectChatUser,
}) => {
  const filteredContacts = chatContacts.filter(
    (c) => !msgSearch || c.name.toLowerCase().includes(msgSearch.toLowerCase())
  );

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
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline">
              {t('messenger.markRead')}
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={msgSearch}
              onChange={(e) => setMsgSearch(e.target.value)}
              placeholder={t('messenger.search')}
              className="w-full bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-slate-100 pl-8 pr-3 py-1.5 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="max-h-80 overflow-y-auto space-y-1">
            {loadingChatContacts ? (
              <div className="py-8 text-center text-xs text-gray-400">{t('messenger.loading')}</div>
            ) : filteredContacts.length === 0 ? (
              <div className="py-8 px-4 text-center space-y-2">
                <MessageCircle className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">{t('messenger.noFriends')}</p>
                <p className="text-[11px] text-gray-400 dark:text-slate-500">{t('messenger.noFriendsSub')}</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
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
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-700/60 rounded-xl cursor-pointer transition group"
                >
                  <div className="relative shrink-0">
                    <UserAvatar src={contact.avatar} alt={contact.name} size="md" />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-gray-900 dark:text-slate-100 truncate group-hover:text-blue-600 transition">
                      {contact.name}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate">{t('messenger.clickToChat')}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
