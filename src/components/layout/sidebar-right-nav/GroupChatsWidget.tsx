import React from 'react';
import { Plus } from 'lucide-react';
import { ChatUser } from '../../../components/chat/chat-box';
import { GroupAvatar } from '../../common/GroupAvatar';
import { formatMessageSnippet } from '../../../utils/formatMessageSnippet';

interface GroupChatsWidgetProps {
  groups: ChatUser[];
  onOpenCreateGroup: () => void;
  onSelectChatUser?: (user: ChatUser) => void;
  isEn?: boolean;
}

export const GroupChatsWidget: React.FC<GroupChatsWidgetProps> = ({
  groups,
  onOpenCreateGroup,
  onSelectChatUser,
  isEn,
}) => {
  return (
    <div className="px-1 space-y-1">
      <h3 className="text-gray-500 dark:text-[#b0b3b8] font-bold text-sm mb-1.5">
        {isEn ? 'Group conversations' : 'Cuộc trò chuyện nhóm'}
      </h3>

      <button
        type="button"
        onClick={onOpenCreateGroup}
        className="flex items-center space-x-3 w-full p-2 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60 cursor-pointer transition text-left group"
      >
        <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#1877f2] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
          <Plus className="w-5 h-5" />
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-[#e4e6eb]">
          {isEn ? 'Create new group' : 'Tạo nhóm mới'}
        </span>
      </button>

      {groups.length > 0 && (
        <div className="space-y-0.5 pt-1">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => onSelectChatUser && onSelectChatUser(group)}
              className="flex items-center space-x-3 px-2 py-1.5 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60 cursor-pointer transition group"
            >
              <GroupAvatar
                name={group.name}
                size="sm"
                shape="circle"
                className="shadow-xs shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-[#e4e6eb] truncate group-hover:text-[#1877f2] transition-colors">
                  {group.name}
                </div>
                {group.lastMessageContent && (
                  <div className="text-[11px] text-gray-400 dark:text-[#b0b3b8] truncate">
                    {formatMessageSnippet(group.lastMessageContent)}
                  </div>
                )}
              </div>
              {Number((group as any).unreadCount || 0) > 0 && (
                <span className="min-w-5 rounded-full bg-[#1877f2] px-1.5 py-0.5 text-center text-[10px] font-bold text-white shrink-0">
                  {Number((group as any).unreadCount) > 99
                    ? '99+'
                    : (group as any).unreadCount}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
