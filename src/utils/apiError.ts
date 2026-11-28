/** Lấy thông báo lỗi do backend trả về (ApiResponse.message); không có thì dùng câu mặc định. */
export const getApiErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as { response?: { data?: { message?: unknown } }; message?: unknown } | null;
  const fromServer = e?.response?.data?.message;
  if (typeof fromServer === 'string' && fromServer.trim()) return fromServer.trim();
  return fallback;
};

/**
 * Thông báo lỗi của các tính năng AI, kèm mã HTTP nếu có (ví dụ "Lỗi 400: Không kết nối được tới mô hình AI...").
 * Dùng thay cho kết quả mặc định: tính năng AI lỗi thì báo lỗi, không hiển thị nội dung soạn sẵn.
 */
export const formatAiError = (err: unknown): string => {
  const status = (err as { response?: { status?: number } } | null)?.response?.status;
  const detail = getApiErrorMessage(
    err,
    err instanceof Error && err.message ? err.message : 'Không gửi được yêu cầu tới máy chủ.'
  );
  return status ? `Lỗi ${status}: ${detail}` : `Lỗi: ${detail}`;
};
