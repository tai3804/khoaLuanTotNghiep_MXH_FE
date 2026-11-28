import { useCallback, useEffect, useState } from 'react';
import { liveStreamWebSocketService } from './liveStreamWebSocket';

/**
 * Cài đặt phòng live do chủ phòng chọn (chế độ chậm, bật/tắt thả cảm xúc).
 * Chủ phòng phát qua tín hiệu LIVE_SETTINGS (máy chủ chỉ nhận từ chủ phòng); phát lại mỗi khi có người vào xem
 * để người vào sau cũng biết. Người xem tự áp dụng: chế độ chậm báo ngay ở phía người gửi, không phải ở phía chủ phòng.
 */
export interface LiveRoomSettings {
  slowModeSeconds: 0 | 5 | 10;
  reactionsEnabled: boolean;
}

export const DEFAULT_ROOM_SETTINGS: LiveRoomSettings = { slowModeSeconds: 0, reactionsEnabled: true };

const settingsByPost = new Map<string, LiveRoomSettings>();
/** Các phòng mình đang làm chủ: postId -> id chủ phòng */
const hostedRooms = new Map<string, string>();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

const storageKey = (postId: string) => `live_room_settings_${postId}`;

const normalize = (raw: any): LiveRoomSettings => ({
  slowModeSeconds: raw?.slowModeSeconds === 5 || raw?.slowModeSeconds === 10 ? raw.slowModeSeconds : 0,
  reactionsEnabled: raw?.reactionsEnabled !== false,
});

export const getRoomSettings = (postId?: string | null): LiveRoomSettings =>
  (postId && settingsByPost.get(postId)) || DEFAULT_ROOM_SETTINGS;

const broadcast = (postId: string) => {
  const hostId = hostedRooms.get(postId);
  if (!hostId) return;
  liveStreamWebSocketService.sendSignal(postId, hostId, null, 'LIVE_SETTINGS', { payload: getRoomSettings(postId) });
};

/** Chủ phòng nhận quyền phát cài đặt cho phòng của mình (khôi phục cài đặt cũ nếu vừa tải lại trang). */
export const registerHostedRoom = (postId: string, hostId: string) => {
  if (!postId || !hostId || hostedRooms.get(postId) === hostId) return;
  hostedRooms.set(postId, hostId);
  if (!settingsByPost.has(postId)) {
    try {
      const saved = sessionStorage.getItem(storageKey(postId));
      if (saved) settingsByPost.set(postId, normalize(JSON.parse(saved)));
    } catch {
      // bỏ qua
    }
  }
  notify();
  broadcast(postId);
};

export const updateHostRoomSettings = (postId: string, patch: Partial<LiveRoomSettings>) => {
  const next = normalize({ ...getRoomSettings(postId), ...patch });
  settingsByPost.set(postId, next);
  try {
    sessionStorage.setItem(storageKey(postId), JSON.stringify(next));
  } catch {
    // bỏ qua
  }
  notify();
  broadcast(postId);
};

if (typeof window !== 'undefined') {
  window.addEventListener('kltn_live_chat_event', (e: Event) => {
    const sig = (e as CustomEvent<any>).detail;
    const postId: string | undefined = sig?.postId || sig?.callSessionId;
    if (!postId) return;
    const type = sig.signalType || sig.type;
    if (type === 'LIVE_SETTINGS' && !hostedRooms.has(postId) && sig.payload) {
      settingsByPost.set(postId, normalize(sig.payload));
      notify();
    } else if (type === 'ACCEPT' && hostedRooms.has(postId)) {
      // Có người vừa vào xem: gửi lại cài đặt hiện tại cho họ
      broadcast(postId);
    }
  });
}

export const useLiveRoomSettings = (postId?: string | null): LiveRoomSettings => {
  const [settings, setSettings] = useState(() => getRoomSettings(postId));
  useEffect(() => {
    const update = () => setSettings(getRoomSettings(postId));
    update();
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, [postId]);
  return settings;
};

/**
 * Chế độ chậm phía người gửi: `trySend()` trả false nếu chưa hết thời gian chờ và bật thông báo cho chính người gửi.
 * `remaining` là số giây còn phải chờ (0 = gửi được), `notice` là câu báo hiển thị cạnh ô nhập.
 */
const lastSentAt = new Map<string, number>();

export const useSlowMode = (postId: string | null | undefined, enabled: boolean) => {
  const { slowModeSeconds } = useLiveRoomSettings(postId);
  const seconds = enabled ? slowModeSeconds : 0;
  const [now, setNow] = useState(Date.now());
  const [warned, setWarned] = useState(false);

  const last = (postId && lastSentAt.get(postId)) || 0;
  const remaining = seconds > 0 ? Math.max(0, Math.ceil((last + seconds * 1000 - now) / 1000)) : 0;

  useEffect(() => {
    if (remaining <= 0) {
      setWarned(false);
      return;
    }
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [remaining]);

  const trySend = useCallback((): boolean => {
    if (!postId || seconds <= 0) return true;
    const current = Date.now();
    const prev = lastSentAt.get(postId) || 0;
    if (current - prev < seconds * 1000) {
      setNow(current);
      setWarned(true);
      return false;
    }
    lastSentAt.set(postId, current);
    setNow(current);
    setWarned(false);
    return true;
  }, [postId, seconds]);

  const notice =
    seconds <= 0
      ? null
      : remaining > 0
        ? warned
          ? `Chế độ chậm đang bật: bạn gửi quá nhanh, hãy đợi ${remaining} giây nữa.`
          : `Chế độ chậm: bạn có thể gửi tiếp sau ${remaining} giây.`
        : `Chế độ chậm đang bật: mỗi người gửi tối đa 1 bình luận mỗi ${seconds} giây.`;

  return { slowModeSeconds: seconds, remaining, warned: warned && remaining > 0, notice, trySend };
};
