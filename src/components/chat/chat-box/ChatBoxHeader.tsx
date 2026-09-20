import React from 'react';
import { Phone, Video, Minus, X, Users, Info } from 'lucide-react';
import { ChatUser } from './types';
import { UserAvatar } from '../../common/UserAvatar';
import { useCall } from '../../../context/CallContext';

interface ChatBoxHeaderProps {
  friend: ChatUser;
  memberCount?: number;
  groupMemberIds?: string[];
  conversationId?: string | null;
  onMinimize: () => void;
  onClose: () => void;
  onOpenGroupInfo?: () => void;
}

export const ChatBoxHeader: React.FC<ChatBoxHeaderProps> = ({
  friend,
  memberCount,
  groupMemberIds = [],
  conversationId,
  onMinimize,
  onClose,
  onOpenGroupInfo,
}) => {
  const { startCall, startGroupCall } = useCall();
  const targetUserId = friend.userId || (!friend.isGroup ? friend.id : undefined);

  const handleAudioCall = () => {
    if (targetUserId) {
      startCall({ id: targetUserId, name: friend.name, avatar: friend.avatar || '' }, 'AUDIO');
    }
  };

  const handleVideoCall = () => {
    if (targetUserId) {
      startCall({ id: targetUserId, name: friend.name, avatar: friend.avatar || '' }, 'VIDEO');
    }
  };

  const handleGroupCall = (type: 'AUDIO' | 'VIDEO') => {
    if (!conversationId) return;
    startGroupCall(friend.name, groupMemberIds, type, conversationId);
  };

  return (
    <div className="flex items-center justify-between px-3 py-2.5 bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-[#393a3b] shadow-sm">
      <div className="flex items-center space-x-2.5 cursor-pointer min-w-0" onClick={onMinimize}>
        <div className="relative shrink-0">
          {friend.isGroup ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <Users className="w-4 h-4" />
            </div>
          ) : (
            <>
              <UserAvatar src={friend.avatar} alt={friend.name} size="sm" />
              {friend.online && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#242526] rounded-full" />
              )}
            </>
          )}
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-gray-900 dark:text-[#e4e6eb] leading-tight truncate max-w-[130px]">
            {friend.name}
          </h4>
          <span className="text-[10px] text-gray-500 dark:text-[#b0b3b8] block">
            {friend.isGroup
              ? `${memberCount ? memberCount + ' thành viên' : 'Nhóm chat'}`
              : friend.online
              ? 'Đang hoạt động'
              : 'Ngoại tuyến'}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-0.5 text-[#1877f2] dark:text-[#4599ff] shrink-0">
        {friend.isGroup ? (
          <>
            <button
              onClick={() => handleGroupCall('AUDIO')}
              disabled={!conversationId || groupMemberIds.length < 2}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Bắt đầu cuộc gọi thoại nhóm"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleGroupCall('VIDEO')}
              disabled={!conversationId || groupMemberIds.length < 2}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Bắt đầu cuộc gọi video nhóm"
            >
              <Video className="w-4 h-4" />
            </button>
            {onOpenGroupInfo && (
              <button
                onClick={onOpenGroupInfo}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full transition cursor-pointer"
                title="Thông tin nhóm"
              >
                <Info className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={handleAudioCall}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full transition cursor-pointer"
              title="Cuộc gọi thoại"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={handleVideoCall}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full transition cursor-pointer"
              title="Cuộc gọi video"
            >
              <Video className="w-4 h-4" />
            </button>
          </>
        )}

        <button
          onClick={onMinimize}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-[#e4e6eb] transition cursor-pointer"
          title="Thu nhỏ"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-[#e4e6eb] transition cursor-pointer"
          title="Đóng chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
