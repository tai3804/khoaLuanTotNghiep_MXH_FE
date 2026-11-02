import { chatService } from '../../services/chatService';
import { fetchAuthorProfile } from '../../services/userService';
import type { ChatUser } from '../chat/chat-box';

interface NotificationTargetActions {
  navigate: (to: string) => void;
  onNavigateProfile?: (userId?: string) => void;
  onSelectChatUser?: (user: ChatUser) => void;
  currentUserId?: string;
}

/**
 * Mở đúng nơi mà thông báo nói tới (backend gửi kèm targetUrl):
 *  /posts/{id}                    trang bài viết (lượt thích, bình luận, chia sẻ, gắn thẻ, bạn bè phát trực tiếp...)
 *  /groups/..., /support-inbox... trang tương ứng, giữ nguyên ?tab=... / ?postId=...
 *  /profile/{id}, /profile        hồ sơ người đó / hồ sơ của mình
 *  /chat?conversationId={id}      mở khung chat của cuộc trò chuyện đó
 */
export const openNotificationTarget = async (url: string, actions: NotificationTargetActions): Promise<void> => {
  const { navigate, onNavigateProfile, onSelectChatUser, currentUserId } = actions;
  if (!url) return;

  try {
    if (
      url.startsWith('/posts/') ||
      url.startsWith('/groups') ||
      url.startsWith('/support-inbox') ||
      url.startsWith('/friends') ||
      url.startsWith('/watch') ||
      url.startsWith('/search') ||
      url.startsWith('/settings')
    ) {
      navigate(url);
      return;
    }

    if (url.startsWith('/profile')) {
      const parts = url.split('/profile/');
      const targetUserId = parts[1]?.split('?')[0];
      if (onNavigateProfile) {
        onNavigateProfile(targetUserId || undefined);
      } else {
        navigate(targetUserId ? `/profile/${targetUserId}` : '/profile');
      }
      return;
    }

    if (url.startsWith('/chat')) {
      const conversationId = new URLSearchParams(url.split('?')[1] || '').get('conversationId');
      if (!conversationId) {
        navigate('/chat');
        return;
      }
      if (!onSelectChatUser) {
        navigate(url);
        return;
      }

      try {
        const detail = await chatService.getConversationDetail(conversationId);
        if (detail) {
          if (detail.type === 'GROUP') {
            onSelectChatUser({
              id: conversationId,
              conversationId,
              isGroup: true,
              name: detail.name || 'Nhóm trò chuyện',
              avatar: detail.avatarUrl || '/default-avatar.png',
              online: true,
            });
            return;
          }

          const partner = Array.isArray(detail.members)
            ? detail.members.find((m: { userId: string }) => String(m.userId) !== String(currentUserId))
            : null;
          if (partner) {
            const profile = await fetchAuthorProfile(String(partner.userId)).catch(() => null);
            onSelectChatUser({
              id: String(partner.userId),
              userId: String(partner.userId),
              conversationId,
              isGroup: false,
              name: profile?.name || partner.nickname || 'Người dùng',
              avatar: profile?.avatar || '/default-avatar.png',
              online: false,
            });
            return;
          }
        }
      } catch (err) {
        console.warn('[openNotificationTarget] chat detail error, navigating fallback:', err);
      }

      navigate('/chat');
      return;
    }

    // Default safe fallback for any other valid URL
    navigate(url);
  } catch (err) {
    console.error('[openNotificationTarget] Error opening notification target:', err);
  }
};
