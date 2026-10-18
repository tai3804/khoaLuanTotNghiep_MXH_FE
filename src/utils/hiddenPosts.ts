// Bài viết người dùng chọn "Ẩn bài viết này khỏi bảng tin của bạn". Lưu cục bộ trên trình duyệt và áp dụng cho
// mọi bảng tin dạng danh sách (trang chủ, Video/Watch) để bài đã ẩn không hiện lại, kể cả sau khi tải lại trang.
const STORAGE_KEY = 'kltn_hidden_post_ids';

function readIds(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function isPostHidden(postId: string | number): boolean {
  return readIds().includes(String(postId));
}

export function hidePostLocally(postId: string | number): void {
  try {
    const ids = readIds();
    if (!ids.includes(String(postId))) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, String(postId)]));
    }
  } catch {
    // bộ nhớ trình duyệt bị chặn/đầy: bài vẫn được gỡ khỏi danh sách đang xem
  }
}

/** Bỏ các bài đã ẩn khỏi một danh sách bài viết. */
export function withoutHiddenPosts<T extends { id: string }>(posts: T[]): T[] {
  const hidden = new Set(readIds());
  return hidden.size === 0 ? posts : posts.filter((p) => !hidden.has(String(p.id)));
}
