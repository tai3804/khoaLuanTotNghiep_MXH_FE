import React from 'react';
import { Plus } from 'lucide-react';
import { ChatUser } from '../../../components/chat/chat-box';
import { useLanguage } from '../../../context/LanguageContext';

interface GroupChatsSectionProps {
  contacts: ChatUser[];
  onSelectChatUser?: (user: ChatUser) => void;
}

export const GroupChatsSection: React.FC<GroupChatsSectionProps> = ({
  contacts,
  onSelectChatUser,
}) => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  return (
    <>
      <div className="px-1">
        <h3 className="text-gray-500 dark:text-[#b0b3b8] font-bold text-sm mb-1.5">
          {t('chat.groupConversations', isEn ? 'Group conversations' : 'Cuộc trò chuyện nhóm')}
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
            {t('chat.createNewGroup', isEn ? 'Create new group' : 'Tạo nhóm mới')}
          </span>
        </button>
      </div>
    </>
  );
};
