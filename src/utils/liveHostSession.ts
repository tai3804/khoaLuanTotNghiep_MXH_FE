// Phiên phát trực tiếp của chủ phòng được ghi lại để tải lại trang không làm buổi phát kết thúc:
// camera và kết nối WebRTC nằm trong bộ nhớ trang nên mất khi tải lại, nhưng bài viết và phòng gọi ở máy chủ vẫn còn.
// Chủ phòng có HOST_RESUME_GRACE_MS để quay lại và phát tiếp; quá hạn thì buổi phát mới bị kết thúc.
// Dùng sessionStorage (riêng từng tab, sống qua lần tải lại) nên mở thêm một tab khác không bị tranh quyền phát.

const STORAGE_KEY = 'kltn_live_host_session';

/** Thời gian chờ chủ phòng quay lại sau khi tải lại trang / mất kết nối. */
export const HOST_RESUME_GRACE_MS = 120_000;
/** Người xem chờ lâu hơn chủ phòng một chút để chủ phòng kịp nối lại rồi mới coi là đã kết thúc. */
export const VIEWER_RECONNECT_GRACE_MS = HOST_RESUME_GRACE_MS + 15_000;

export interface HostLiveSession {
  postId: string;
  userId: string;
  title: string;
  description: string;
  startedAt: number;
  /** Lần cuối trang của chủ phòng còn sống (cập nhật định kỳ và khi đóng/tải lại trang). */
  heartbeatAt: number;
}

export const readHostLiveSession = (): HostLiveSession | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<HostLiveSession>;
    if (!parsed.postId || !parsed.userId || typeof parsed.heartbeatAt !== 'number' || typeof parsed.startedAt !== 'number') {
      return null;
    }
    return {
      postId: parsed.postId,
      userId: parsed.userId,
      title: parsed.title ?? '',
      description: parsed.description ?? '',
      startedAt: parsed.startedAt,
      heartbeatAt: parsed.heartbeatAt,
    };
  } catch {
    return null;
  }
};

export const writeHostLiveSession = (session: HostLiveSession) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // sessionStorage bị chặn: chỉ mất khả năng nối lại sau khi tải trang, buổi phát vẫn chạy bình thường
  }
};

export const clearHostLiveSession = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // không có gì để xóa
  }
};

/** Còn bao nhiêu mili giây để chủ phòng nối lại (<= 0 là đã quá hạn). */
export const hostResumeRemainingMs = (session: HostLiveSession, now = Date.now()) =>
  HOST_RESUME_GRACE_MS - (now - session.heartbeatAt);

/** Phiên còn trong thời gian chờ, hoặc null (đồng thời dọn phiên đã quá hạn để không bị dùng lại). */
export const readResumableHostLiveSession = (): HostLiveSession | null => {
  const session = readHostLiveSession();
  if (!session) return null;
  if (hostResumeRemainingMs(session) <= 0) {
    return null;
  }
  return session;
};
