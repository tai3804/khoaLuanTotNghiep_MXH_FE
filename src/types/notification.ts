export type NotificationType =
  | 'LIKE_POST'
  | 'COMMENT_POST'
  | 'REPLY_COMMENT'
  | 'SHARE_POST'
  | 'FRIEND_REQUEST'
  | 'ACCEPT_FRIEND'
  | 'FOLLOW_USER'
  | 'TAG_POST'
  | 'TAG_COMMENT'
  | 'NEW_MESSAGE'
  | 'CALL_INCOMING'
  | 'CALL_REJECTED'
  | 'CALL_MISSED'
  | 'SYSTEM';

export interface NotificationItem {
  id: string;
  recipientId: string;
  actorId?: string;
  type: NotificationType;
  title: string;
  content: string;
  targetId?: string;
  targetUrl?: string;
  avatarUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationSetting {
  id?: string;
  userId?: string;
  likePost: boolean;
  commentPost: boolean;
  sharePost: boolean;
  friendRequest: boolean;
  message: boolean;
  call: boolean;
  system: boolean;
  sound: boolean;
  emailNotification: boolean;
}
