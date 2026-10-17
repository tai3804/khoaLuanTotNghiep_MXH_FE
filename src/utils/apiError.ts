/** Lấy thông báo lỗi do backend trả về (ApiResponse.message); không có thì dùng câu mặc định. */
export const getApiErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as { response?: { data?: { message?: unknown } }; message?: unknown } | null;
  const fromServer = e?.response?.data?.message;
  if (typeof fromServer === 'string' && fromServer.trim()) return fromServer.trim();
  return fallback;
};
