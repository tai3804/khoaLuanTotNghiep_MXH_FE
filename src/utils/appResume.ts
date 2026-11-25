/**
 * Gọi `callback` mỗi khi app quay lại màn hình hoặc có mạng lại, tối đa một lần mỗi `minIntervalMs`. Trả về hàm gỡ đăng ký.
 *
 * Lý do: trên điện thoại (và tab trình duyệt ở nền) WebView bị tạm dừng khi tắt màn hình hoặc chuyển sang app khác, kênh
 * WebSocket có thể đứt và các sự kiện thời gian thực lúc đó không được phát lại. Quay lại mà không nạp bù thì chuông thông báo,
 * số tin chưa đọc... vẫn cũ cho tới khi mở lại app.
 *
 * `visibilitychange` bao phủ cả trình duyệt lẫn WebView; `resume` là sự kiện Capacitor bắn lên document khi app Android
 * quay lại nền trước.
 */
export const onAppResume = (callback: () => void, minIntervalMs = 5000): (() => void) => {
  let last = Date.now();

  const trigger = () => {
    if (document.visibilityState !== 'visible') return;
    const now = Date.now();
    if (now - last < minIntervalMs) return;
    last = now;
    callback();
  };

  document.addEventListener('visibilitychange', trigger);
  document.addEventListener('resume', trigger);
  window.addEventListener('online', trigger);
  return () => {
    document.removeEventListener('visibilitychange', trigger);
    document.removeEventListener('resume', trigger);
    window.removeEventListener('online', trigger);
  };
};
