import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Search, MoreHorizontal, UserX } from 'lucide-react';
import { ChatUser } from './ChatBox';
import { UserAvatar } from './UserAvatar';
import { userService } from '../services/api';

interface SidebarRightProps {
  onSelectChatUser?: (user: ChatUser) => void;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({ onSelectChatUser }) => {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      try {
        const friends = await userService.getFriends();
        setContacts(friends);
      } catch (e) {
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, []);

  const filteredContacts = contactSearch.trim()
    ? contacts.filter((c) => c.name?.toLowerCase().includes(contactSearch.toLowerCase()))
    : contacts;

  return (
    <aside className="w-80 hidden lg:block p-4 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto space-y-5 bg-transparent">
      {/* Online Contacts Section */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-gray-400 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
            {t('contacts') || 'Người liên hệ'}
          </h3>
          <div className="flex items-center space-x-1 text-gray-500 dark:text-slate-400">
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="hover:bg-gray-200 dark:hover:bg-slate-700 p-1.5 rounded-full transition"
              title="Tìm người liên hệ"
            >
              <Search className="w-4 h-4" />
            </button>
            <button className="hover:bg-gray-200 dark:hover:bg-slate-700 p-1.5 rounded-full transition" title="Tùy chọn">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contact search bar input */}
        {showSearchInput && (
          <div className="mb-2">
            <input
              type="text"
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              placeholder="Tìm bạn bè..."
              className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        {loading ? (
          <div className="text-center py-4 text-xs text-gray-400">Đang tải danh sách bạn bè...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 text-center space-y-1">
            <UserX className="w-6 h-6 text-gray-300 mx-auto" />
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Chưa có người liên hệ trực tuyến</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => onSelectChatUser && onSelectChatUser(contact)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition border border-transparent hover:border-gray-100 dark:hover:border-slate-700 hover:shadow-sm group"
              >
                <div className="relative flex-shrink-0">
                  <UserAvatar src={contact.avatar} alt={contact.name} size="sm" />
                  {contact.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" />
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                  {contact.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};