import React from 'react';
import { Plus, Edit } from 'lucide-react';
import { ChatUser } from '../../chat/ChatBox';

interface GroupChatsSectionProps {
  contacts: ChatUser[];
  onSelectChatUser?: (user: ChatUser) => void;
}

export const GroupChatsSection: React.FC<GroupChatsSectionProps> = ({
  contacts,
  onSelectChatUser,
}) => {
  return (
    <>
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
    </>
  );
};
