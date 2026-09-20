export interface ChatUser {
  id: string; // targetUserId for 1-1, or conversationId for groups
  userId?: string;
  name: string;
  avatar: string;
  online: boolean;
  lastActiveAt?: string;
  isGroup?: boolean;
  conversationId?: string;
  lastMessageContent?: string;
}
