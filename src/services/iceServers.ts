import { api } from './axiosClient';

/**
 * Cấu hình ICE (STUN + TURN) dùng chung cho cuộc gọi và phát trực tiếp.
 *
 * call-service cấp tài khoản TURN tạm thời cho người dùng đã đăng nhập (GET /calls/ice-servers). Cấu hình được tải trước khi
 * đăng nhập xong và làm mới trước khi tài khoản TURN hết hạn, vì RTCPeerConnection được tạo đồng bộ ở nhiều nơi.
 * Khi chưa tải được (mới mở trang, call-service lỗi) thì dùng STUN công khai: vẫn kết nối thẳng được, chỉ thiếu trung chuyển.
 */
const STUN_ONLY: RTCConfiguration = {
  iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }],
};

/** Làm mới khi tài khoản TURN còn ít hơn chừng này thời gian hiệu lực. */
const REFRESH_MARGIN_MS = 10 * 60 * 1000;

interface IceConfigResponse {
  iceServers?: RTCIceServer[];
  ttlSeconds?: number;
}

let cached: { config: RTCConfiguration; expiresAt: number } | null = null;
let inflight: Promise<RTCConfiguration> | null = null;

/** Tải (hoặc làm mới) cấu hình ICE từ call-service. */
export function loadIceConfig(force = false): Promise<RTCConfiguration> {
  if (!force && cached && Date.now() < cached.expiresAt - REFRESH_MARGIN_MS) {
    return Promise.resolve(cached.config);
  }
  if (inflight) return inflight;
  inflight = api
    .get('/calls/ice-servers')
    .then((response) => {
      const data: IceConfigResponse = response.data?.data || response.data || {};
      const servers = Array.isArray(data.iceServers) ? data.iceServers.filter((s) => s && s.urls) : [];
      if (servers.length === 0) return cached?.config ?? STUN_ONLY;
      const ttlMs = Math.max(60, Number(data.ttlSeconds) || 3600) * 1000;
      cached = { config: { iceServers: servers }, expiresAt: Date.now() + ttlMs };
      const hasTurn = servers.some((s) => [s.urls].flat().some((u) => String(u).startsWith('turn')));
      console.info(`[ICE] Đã tải cấu hình ICE: ${servers.length} máy chủ${hasTurn ? ', có TURN' : ', chỉ STUN'}`);
      return cached.config;
    })
    .catch((error) => {
      console.warn('[ICE] Không tải được cấu hình ICE từ call-service, tạm dùng STUN công khai:', error);
      return cached?.config ?? STUN_ONLY;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Cấu hình ICE hiện có, dùng khi tạo RTCPeerConnection; tự làm mới ở nền nếu sắp hết hạn. */
export function getIceConfig(): RTCConfiguration {
  if (!cached || Date.now() >= cached.expiresAt - REFRESH_MARGIN_MS) {
    void loadIceConfig();
  }
  return cached && Date.now() < cached.expiresAt ? cached.config : STUN_ONLY;
}

/** Xoá cấu hình khi đăng xuất (tài khoản TURN gắn với người dùng). */
export function clearIceConfig() {
  cached = null;
}
