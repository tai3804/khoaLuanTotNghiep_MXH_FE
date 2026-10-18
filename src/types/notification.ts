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
  | 'SYSTEM'
  | 'GROUP_INVITE'
  | 'GROUP_JOIN_REQUEST'
  | 'GROUP_JOIN_ACCEPT'
  | 'GROUP_ROLE_CHANGE'
  | 'GROUP_POST'
  | 'GROUP_POST_PENDING'
  | 'GROUP_POST_APPROVED'
  | 'GROUP_POST_REJECTED'
  | 'GROUP_POST_REMOVED'
  | 'GROUP_POST_REPORTED'
  | 'LIVE_STARTED';

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
