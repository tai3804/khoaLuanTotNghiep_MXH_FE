import { ChatUser } from '../../../components/chat/chat-box';

export interface SidebarRightProps {
  onSelectChatUser?: (user: ChatUser) => void;
  className?: string;
  isFixed?: boolean;
}

export interface PendingFriendRequestItem {
  id: string;
  senderAvatar?: string;
  avatar?: string;
  senderName?: string;
  fullName?: string;
}
