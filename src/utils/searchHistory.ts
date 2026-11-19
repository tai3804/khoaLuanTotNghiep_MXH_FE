/**
 * Lịch sử tìm kiếm trong trình duyệt, dùng chung cho ô tìm kiếm ở header và trang kết quả.
 * Mọi thao tác đều bọc try/catch vì localStorage có thể bị chặn (chế độ riêng tư) hoặc chứa dữ liệu hỏng.
 */
const KEY = 'search_history';
const MAX_ITEMS = 10;

export function readSearchHistory(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function write(items: string[]): string[] {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* không lưu được thì bỏ qua, lịch sử chỉ là tiện ích */
  }
  return items;
}

/** Đưa từ khoá lên đầu danh sách (bỏ bản trùng không phân biệt hoa thường) và trả về danh sách mới. */
export function pushSearchHistory(keyword: string): string[] {
  const trimmed = keyword.trim();
  if (!trimmed) return readSearchHistory();
  const rest = readSearchHistory().filter((item) => item.toLocaleLowerCase() !== trimmed.toLocaleLowerCase());
  return write([trimmed, ...rest].slice(0, MAX_ITEMS));
}

export function removeSearchHistoryItem(keyword: string): string[] {
  return write(readSearchHistory().filter((item) => item !== keyword));
}
