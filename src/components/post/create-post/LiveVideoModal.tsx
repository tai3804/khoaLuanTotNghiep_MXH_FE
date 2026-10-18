import React, { useState, useRef, useEffect } from 'react';
import { X, Video, VideoOff, Mic, MicOff, Radio, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { UserAvatar } from '../../common/UserAvatar';
import { getApiErrorMessage } from '../../../utils/apiError';

interface MediaProblem {
  message: string;
  hint: string;
}

const VIDEO_CONSTRAINTS = { width: { ideal: 1280 }, height: { ideal: 720 } };

/** Giải thích lỗi getUserMedia bằng tiếng Việt, kèm cách khắc phục. device: thiết bị đang xin quyền. */
const describeMediaError = (err: unknown, device: 'camera' | 'micro' | 'camera và micro'): MediaProblem => {
  const name = (err as { name?: string } | null)?.name || '';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return {
      message: `Trình duyệt đang chặn quyền dùng ${device}.`,
      hint: 'Bấm biểu tượng ổ khóa cạnh thanh địa chỉ, chọn Cho phép (Allow) Camera và Micro, rồi bấm "Thử lại".',
    };
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return {
      message: `Không tìm thấy ${device}.`,
      hint: 'Kiểm tra thiết bị đã cắm và bật chưa (Windows: Cài đặt > Quyền riêng tư > Camera/Micrô), rồi bấm "Thử lại".',
    };
  }
  if (name === 'NotReadableError' || name === 'TrackStartError' || name === 'AbortError') {
    return {
      message: `${device.charAt(0).toUpperCase() + device.slice(1)} đang được ứng dụng hoặc tab khác sử dụng.`,
      hint: 'Đóng các ứng dụng đang dùng camera (Zoom, Teams, Zalo, tab phát trực tiếp khác...). Nếu vừa mở hộp thoại này nhiều lần, hãy tải lại trang (F5) để nhả camera, rồi bấm "Thử lại".',
    };
  }
  return {
    message: `Không thể mở ${device}.`,
    hint: `Chi tiết: ${name || 'lỗi không xác định'}${(err as { message?: string } | null)?.message ? ` - ${(err as { message?: string }).message}` : ''}. Bấm "Thử lại" hoặc tải lại trang.`,
  };
};

/**
 * Xin camera + micro. Micro thiếu/bị chặn/đang bận không được làm hỏng cả buổi live: thử lại chỉ với camera,
 * rồi chỉ với camera không ràng buộc độ phân giải. Trả về luồng (nếu có) và lý do cụ thể khi không được.
 */
const acquireMedia = async (): Promise<{ stream: MediaStream | null; micProblem?: MediaProblem; error?: MediaProblem }> => {
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    return {
      stream: null,
      error: {
        message: 'Trình duyệt chỉ cho phép dùng camera trên https hoặc localhost.',
        hint: 'Hãy mở trang bằng http://localhost:5173 (hoặc dùng https) rồi thử lại.',
      },
    };
  }
  let first: unknown;
  try {
    return { stream: await navigator.mediaDevices.getUserMedia({ video: VIDEO_CONSTRAINTS, audio: true }) };
  } catch (err) {
    first = err;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: VIDEO_CONSTRAINTS, audio: false });
    return { stream, micProblem: describeMediaError(first, 'micro') };
  } catch (second) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      return { stream, micProblem: describeMediaError(first, 'micro') };
    } catch {
      return { stream: null, error: describeMediaError(second, 'camera') };
    }
  }
};

interface LiveVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onStartLiveStream: (title: string, description: string, stream?: MediaStream | null) => Promise<void>;
}

export const LiveVideoModal: React.FC<LiveVideoModalProps> = ({
  isOpen,
  onClose,
  user,
  onStartLiveStream,
}) => {
  const toast = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const isBroadcastingRef = useRef(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [permissionError, setPermissionError] = useState<MediaProblem | null>(null);
  const [micWarning, setMicWarning] = useState<MediaProblem | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    isBroadcastingRef.current = false;
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      return;
    }

    let activeStream: MediaStream | null = null;
    let cancelled = false;

    const startCamera = async () => {
      setPermissionError(null);
      setMicWarning(null);
      const result = await acquireMedia();
      if (cancelled) {
        // Hộp thoại đã đóng (hoặc effect chạy lại) trong lúc chờ: phải tắt luồng vừa mở, nếu không camera bị giữ mãi
        result.stream?.getTracks().forEach((t) => t.stop());
        return;
      }
      if (!result.stream) {
        const problem = result.error ?? describeMediaError(null, 'camera và micro');
        console.error('Camera/Mic error:', problem);
        setPermissionError(problem);
        toast.showError(problem.message);
        return;
      }
      activeStream = result.stream;
      setStream(result.stream);
      if (result.micProblem) {
        setMicWarning(result.micProblem);
        setIsMicOn(false);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = result.stream;
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      if (activeStream && !isBroadcastingRef.current) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, retryKey]);

  const toggleCamera = () => {
    if (!stream) return;
    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length > 0) {
      const nextState = !isCameraOn;
      videoTracks.forEach((track) => {
        track.enabled = nextState;
      });
      setIsCameraOn(nextState);
    }
  };

  const toggleMic = () => {
    if (!stream) return;
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      toast.showWarning(micWarning?.message || 'Không có micro để bật.');
      return;
    }
    if (audioTracks.length > 0) {
      const nextState = !isMicOn;
      audioTracks.forEach((track) => {
        track.enabled = nextState;
      });
      setIsMicOn(nextState);
    }
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.showWarning('Vui lòng nhập tiêu đề cho buổi phát trực tiếp!');
      return;
    }

    setIsStarting(true);
    let broadcastStream = stream;
    try {
      if (!broadcastStream) {
        const result = await acquireMedia();
        if (!result.stream) {
          toast.showError(result.error?.message || 'Không thể mở camera.');
          setPermissionError(result.error ?? null);
          return;
        }
        broadcastStream = result.stream;
      }

      // Mark broadcasting active so cleanup leaves tracks running for the player
      isBroadcastingRef.current = true;
      setStream(null);
      await onStartLiveStream(title.trim(), description.trim(), broadcastStream);
      onClose();
    } catch (err) {
      console.error('Failed to start live stream:', err);
      toast.showError(getApiErrorMessage(err, 'Không thể bắt đầu phát trực tiếp. Vui lòng thử lại!'));
      // Không phát được thì nhả camera/micro (luồng đã được tách khỏi bản xem trước) rồi đóng hộp thoại
      broadcastStream?.getTracks().forEach((track) => track.stop());
      isBroadcastingRef.current = false;
      onClose();
    } finally {
      setIsStarting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transition-all cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#393a3b]">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-500">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb]">
                Phát video trực tiếp
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
                Kết nối và phát sóng trực tiếp tới bạn bè
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] flex items-center justify-center text-gray-600 dark:text-[#b0b3b8] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Live Camera Preview */}
          <div className="relative w-full h-72 sm:h-80 bg-black rounded-xl overflow-hidden flex items-center justify-center border border-gray-800">
            {permissionError ? (
              <div className="text-center p-6 text-gray-400 text-xs space-y-2">
                <VideoOff className="w-10 h-10 text-red-500 mx-auto" />
                <p className="font-semibold text-gray-300">{permissionError.message}</p>
                <p className="text-[11px] text-gray-500 max-w-md mx-auto leading-relaxed">{permissionError.hint}</p>
                <button
                  type="button"
                  onClick={() => setRetryKey((k) => k + 1)}
                  className="mt-1 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold transition cursor-pointer"
                >
                  Thử lại
                </button>
              </div>
            ) : !isCameraOn ? (
              <div className="text-center p-6 text-gray-400 text-xs space-y-2">
                <UserAvatar src={user?.avatar} alt={user?.fullName || user?.username} size="lg" className="w-16 h-16 mx-auto mb-2" />
                <p className="font-semibold text-gray-300">Camera đang tắt</p>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
                style={{ transform: 'scaleX(-1)' }}
              />
            )}

            {/* Live Indicator Badge */}
            <div className="absolute top-3 left-3 flex items-center space-x-1.5 px-2.5 py-1 bg-red-600 text-white rounded-md text-[11px] font-bold shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>SẴN SÀNG PHÁT SÓNG</span>
            </div>

            {/* Floating Camera / Mic controls */}
            <div className="absolute bottom-3 right-3 flex items-center space-x-2 bg-black/60 backdrop-blur-md p-1.5 rounded-xl">
              <button
                type="button"
                onClick={toggleMic}
                className={`p-2.5 rounded-lg transition cursor-pointer ${
                  isMicOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-500 text-white'
                }`}
                title={isMicOn ? 'Tắt Micro' : 'Bật Micro'}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={toggleCamera}
                className={`p-2.5 rounded-lg transition cursor-pointer ${
                  isCameraOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-500 text-white'
                }`}
                title={isCameraOn ? 'Tắt Camera' : 'Bật Camera'}
              >
                {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {micWarning && (
            <p className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 px-3 py-2 text-[11px] leading-relaxed text-amber-800 dark:text-amber-200">
              <span className="font-semibold">{micWarning.message}</span> Bạn vẫn có thể phát hình không có tiếng. {micWarning.hint}
            </p>
          )}

          {/* Form input */}
          <form onSubmit={handleStart} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] mb-1">
                Tiêu đề buổi phát sóng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề phát trực tiếp (ví dụ: Trò chuyện cuối tuần cùng bạn bè)..."
                className="w-full bg-gray-50 dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] text-sm p-3 rounded-xl border border-gray-200 dark:border-[#393a3b] focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] mb-1">
                Mô tả chi tiết (không bắt buộc)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Chia sẻ thêm về chủ đề buổi live hôm nay..."
                rows={2}
                className="w-full bg-gray-50 dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] text-sm p-3 rounded-xl border border-gray-200 dark:border-[#393a3b] focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-[#4e4f50] text-gray-700 dark:text-[#e4e6eb] text-sm font-semibold hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isStarting || !title.trim()}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold flex items-center space-x-2 disabled:opacity-50 transition cursor-pointer shadow-md"
              >
                {isStarting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Radio className="w-4 h-4" />
                    <span>Bắt đầu phát trực tiếp</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
