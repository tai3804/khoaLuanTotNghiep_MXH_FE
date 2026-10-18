import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService, type MyReputation } from '../../services/userService';

const CHECK_INTERVAL_MS = 60_000;

// Giờ máy chủ gửi dạng LocalDateTime không kèm múi giờ (cùng quy ước với giờ đăng bài)
const toDate = (iso?: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatWhen = (d: Date) =>
  d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

const remainingText = (until: Date, now: number) => {
  const ms = until.getTime() - now;
  if (ms <= 0) return 'sắp được mở khóa';
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  if (days > 0) return `còn ${days} ngày ${hours} giờ`;
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return hours > 0 ? `còn ${hours} giờ ${minutes} phút` : `còn ${Math.max(1, minutes)} phút`;
};

/**
 * Khi tài khoản bị khóa vì điểm uy tín quá thấp, người dùng VẪN đăng nhập được nhưng chỉ thấy màn hình này cho tới
 * khi hết thời gian khóa (không dùng được các chức năng khác). Trạng thái lấy từ /users/reputation/me và được kiểm tra lại
 * khi đăng nhập, mỗi phút, khi quay lại tab và khi máy chủ từ chối thao tác vì tài khoản bị khóa.
 */
export const AccountLockedScreen: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [reputation, setReputation] = useState<MyReputation | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isAuthenticated) {
      setReputation(null);
      return;
    }
    let cancelled = false;
    // Cờ riêng cho từng lần chạy effect: trạng thái đăng nhập đổi liên tục lúc khởi động, một cờ dùng chung sẽ làm lần
    // kiểm tra của lượt effect mới bị bỏ qua trong khi kết quả của lượt cũ (đã bị huỷ) không được áp dụng.
    let checking = false;
    const check = async () => {
      if (checking) return;
      checking = true;
      try {
        const result = await userService.getMyReputation();
        if (!cancelled) setReputation(result);
      } finally {
        checking = false;
      }
    };
    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    const onFocus = () => document.visibilityState !== 'hidden' && check();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('account_locked', check);
    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('account_locked', check);
    };
  }, [isAuthenticated]);

  const until = toDate(reputation?.lockedUntil);
  const locked = isAuthenticated && until !== null && until.getTime() > now;

  // Đếm ngược thời gian khóa còn lại; hết hạn thì tự kiểm tra lại để mở màn hình
  useEffect(() => {
    if (!until) return;
    const tick = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= until.getTime()) {
        userService.getMyReputation().then(setReputation);
      }
    }, 30_000);
    setNow(Date.now());
    return () => clearInterval(tick);
  }, [until?.getTime()]);

  if (!locked || !until) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="account-locked-title"
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#f0f2f5] p-4 dark:bg-[#18191a]"
    >
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-xl dark:border-[#393a3b] dark:bg-[#242526]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
          <Lock className="h-7 w-7" />
        </div>
        <h1 id="account-locked-title" className="text-xl font-bold text-gray-900 dark:text-[#e4e6eb]">
          Tài khoản của bạn đã bị khóa
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-[#b0b3b8]">
          Điểm uy tín của bạn đã xuống quá thấp do vi phạm tiêu chuẩn cộng đồng nên tài khoản bị khóa đến{' '}
          <span className="font-semibold text-gray-900 dark:text-[#e4e6eb]">{formatWhen(until)}</span> (
          {remainingText(until, now)}).
        </p>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-[#b0b3b8]">
          Trong thời gian này bạn không thể sử dụng các chức năng của mạng xã hội. Sau khi hết thời gian khóa, tài khoản sẽ được
          mở lại và điểm uy tín tự hồi phục dần mỗi ngày không vi phạm.
        </p>
        <button
          type="button"
          onClick={logout}
          className="mt-6 w-full cursor-pointer rounded-lg bg-[#1877f2] py-2.5 text-sm font-bold text-white transition hover:bg-[#166fe5]"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
};
