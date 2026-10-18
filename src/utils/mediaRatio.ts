// Nhớ tỉ lệ khung hình (rộng / cao) của ảnh và video theo URL để lần hiển thị sau dành đúng chỗ ngay từ đầu,
// không bị bài viết bên dưới xô lệch khi ảnh tải xong. Lưu trong bộ nhớ và localStorage (giới hạn số mục).
const STORAGE_KEY = 'kltn_media_ratio_v1';
const MAX_ENTRIES = 400;

/** Khung ảnh đơn không hẹp hơn 4:5 (dọc) và không rộng hơn ~16:9, giống bảng tin Facebook. */
export const MIN_RATIO = 0.8;
export const MAX_RATIO = 1.91;
/** Tỉ lệ dùng khi chưa biết kích thước thật. */
export const DEFAULT_IMAGE_RATIO = 4 / 3;
export const DEFAULT_VIDEO_RATIO = 16 / 9;

const memory = new Map<string, number>();
let loaded = false;
let saveTimer: ReturnType<typeof setTimeout> | undefined;

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const entries = JSON.parse(raw) as [string, number][];
    for (const [url, ratio] of entries) {
      if (typeof url === 'string' && typeof ratio === 'number' && ratio > 0) memory.set(url, ratio);
    }
  } catch {
    // bộ nhớ trình duyệt bị chặn hoặc hỏng: bỏ qua, dùng tỉ lệ mặc định
  }
}

function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = undefined;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...memory.entries()].slice(-MAX_ENTRIES)));
    } catch {
      // đầy bộ nhớ hoặc bị chặn: bỏ qua
    }
  }, 800);
}

export const clampRatio = (ratio: number) => Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio));

export function getKnownRatio(url: string): number | undefined {
  load();
  return memory.get(url);
}

export function rememberRatio(url: string, width: number, height: number) {
  if (!url || !(width > 0) || !(height > 0)) return;
  load();
  const ratio = Math.round((width / height) * 1000) / 1000;
  if (memory.get(url) === ratio) return;
  memory.delete(url); // đẩy lên cuối để mục cũ nhất bị cắt trước
  memory.set(url, ratio);
  scheduleSave();
}
