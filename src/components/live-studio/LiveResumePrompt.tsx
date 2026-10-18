import React, { useEffect, useState } from 'react';
import { Loader2, Radio } from 'lucide-react';
import { useLiveStream } from '../../context/LiveStreamContext';
import { hostResumeRemainingMs } from '../../utils/liveHostSession';

const formatCountdown = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

/**
 * Chủ phòng vừa tải lại trang giữa buổi phát: buổi phát vẫn được giữ trong một khoảng thời gian chờ.
 * FE tự thử mở lại camera; nếu trình duyệt chưa cho phép thì hộp thoại này cho bấm tay để phát tiếp (hoặc kết thúc hẳn).
 */
export const LiveResumePrompt: React.FC = () => {
  const { resumableLive, isResumingLive, activeBroadcast, resumeBroadcast, discardResumableLive } = useLiveStream();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!resumableLive) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [resumableLive]);

  if (!resumableLive || activeBroadcast.isBroadcasting) return null;

  const remainingSeconds = Math.max(0, Math.ceil(hostResumeRemainingMs(resumableLive, now) / 1000));
  const title = resumableLive.title.trim() || 'Phát trực tiếp';

  return (
    <div
      role="alertdialog"
      aria-label="Tiếp tục buổi phát trực tiếp"
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-50 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-2xl shadow-2xl p-4 space-y-3"
    >
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
          <Radio className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-sm text-gray-900 dark:text-[#e4e6eb]">Buổi phát trực tiếp đang chờ bạn quay lại</h4>
          <p className="text-xs text-gray-600 dark:text-[#b0b3b8] mt-0.5 leading-relaxed">
            <span className="font-semibold text-gray-800 dark:text-[#e4e6eb]">"{title}"</span> vẫn đang được giữ cho người xem. Còn{' '}
            <span className="font-bold text-red-600 dark:text-red-400">{formatCountdown(remainingSeconds)}</span> để mở lại camera,
            quá thời gian này buổi phát sẽ tự kết thúc.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <button
          type="button"
          onClick={discardResumableLive}
          disabled={isResumingLive}
          className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-[#4e4f50] text-gray-700 dark:text-[#e4e6eb] text-xs font-semibold hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer disabled:opacity-50"
        >
          Kết thúc
        </button>
        <button
          type="button"
          onClick={() => void resumeBroadcast()}
          disabled={isResumingLive}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center space-x-1.5 disabled:opacity-60 transition cursor-pointer shadow-md"
        >
          {isResumingLive ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Đang mở camera...</span>
            </>
          ) : (
            <span>Tiếp tục phát</span>
          )}
        </button>
      </div>
    </div>
  );
};
