import { useCallback, useEffect, useState } from 'react';

/**
 * Tùy chỉnh riêng từng cuộc trò chuyện (emoji nhanh, màu chủ đề, tắt chuông), lưu trên trình duyệt của người dùng.
 * Mọi nơi đang mở cùng cuộc trò chuyện (khung chat, hộp thông tin) cập nhật ngay qua sự kiện 'chat_pref_changed'.
 */
export type ChatPrefKind = 'emoji' | 'theme' | 'muted';

export interface ChatThemeOption {
  id: string;
  name: string;
  color: string;
}

export const CHAT_THEMES: ChatThemeOption[] = [
  { id: 'blue', name: 'Xanh dương', color: '#1877f2' },
  { id: 'purple', name: 'Tím', color: '#8b5cf6' },
  { id: 'pink', name: 'Hồng', color: '#e11d74' },
  { id: 'orange', name: 'Cam', color: '#ea580c' },
  { id: 'green', name: 'Xanh lá', color: '#16a34a' },
  { id: 'teal', name: 'Xanh ngọc', color: '#0891b2' },
  { id: 'gray', name: 'Than chì', color: '#475569' },
];

export const DEFAULT_THEME = CHAT_THEMES[0];
export const DEFAULT_EMOJI = '👍';

// Tiền tố riêng: utils/storageSanitizer xoá các khoá cũ dạng "chat_emoji_*" mỗi lần khởi động
const storageKey = (kind: ChatPrefKind, chatId: string) => `chatpref_${kind}_${chatId}`;

export function readChatPref(kind: ChatPrefKind, chatId?: string | null): string | null {
  if (!chatId) return null;
  try {
    return localStorage.getItem(storageKey(kind, chatId));
  } catch {
    return null;
  }
}

function writeChatPref(kind: ChatPrefKind, chatId: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(storageKey(kind, chatId));
    else localStorage.setItem(storageKey(kind, chatId), value);
  } catch {
    // trình duyệt chặn lưu trữ: vẫn áp dụng trong phiên hiện tại
  }
  window.dispatchEvent(new CustomEvent('chat_pref_changed', { detail: { kind, chatId, value } }));
}

/**
 * Khoá ổn định của một cuộc trò chuyện, biết ngay khi mở khung chat (không phải chờ tải id cuộc trò chuyện):
 * chat 1-1 theo id người kia, nhóm theo id nhóm.
 */
export const chatPrefId = (friend: { id: string; userId?: string; isGroup?: boolean; conversationId?: string }) =>
  friend.isGroup ? `c:${friend.conversationId || friend.id}` : `u:${friend.userId || friend.id}`;

const partnerKey = (conversationId: string) => `chat_partner_${conversationId}`;

/** Ghi nhớ cuộc trò chuyện 1-1 này là với ai, để thông báo (chỉ có id cuộc trò chuyện) tìm được đúng tùy chỉnh. */
export function rememberDirectConversation(conversationId: string, partnerId: string) {
  try {
    localStorage.setItem(partnerKey(conversationId), partnerId);
  } catch {
    // bỏ qua
  }
}

/** Cuộc trò chuyện (theo id trong thông báo tin nhắn mới) có đang tắt chuông không. */
export function isConversationMuted(conversationId?: string | null): boolean {
  if (!conversationId) return false;
  let partner: string | null = null;
  try {
    partner = localStorage.getItem(partnerKey(conversationId));
  } catch {
    partner = null;
  }
  return readChatPref('muted', partner ? `u:${partner}` : `c:${conversationId}`) === '1';
}

/** Các cuộc trò chuyện đang mở trong khung chat: tin nhắn mới của chúng không cần thông báo nổi hay chuông. */
const openChats = new Set<string>();
export const setChatOpen = (conversationId: string, open: boolean) => {
  if (open) openChats.add(conversationId);
  else openChats.delete(conversationId);
};
export const isChatOpen = (conversationId?: string | null) => !!conversationId && openChats.has(conversationId);

export function useChatPref(kind: ChatPrefKind, chatId: string | null | undefined, fallback: string) {
  const [value, setValue] = useState<string>(() => readChatPref(kind, chatId) ?? fallback);

  useEffect(() => {
    setValue(readChatPref(kind, chatId) ?? fallback);
    const onChange = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d?.kind === kind && d?.chatId === chatId) setValue(d.value ?? fallback);
    };
    window.addEventListener('chat_pref_changed', onChange);
    return () => window.removeEventListener('chat_pref_changed', onChange);
  }, [kind, chatId, fallback]);

  const update = useCallback(
    (next: string) => {
      setValue(next);
      if (chatId) writeChatPref(kind, chatId, next === fallback ? null : next);
    },
    [kind, chatId, fallback],
  );

  return [value, update] as const;
}

export const themeColor = (themeId: string) => (CHAT_THEMES.find((t) => t.id === themeId) || DEFAULT_THEME).color;
