import React, { useState, useRef, useEffect } from 'react';
import { X, Video, VideoOff, Mic, MicOff, Radio, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { UserAvatar } from '../../common/UserAvatar';

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
  const [permissionError, setPermissionError] = useState<string | null>(null);

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

    const startCamera = async () => {
      setPermissionError(null);
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error('Camera/Mic permission error:', err);
        setPermissionError('Không thể truy cập Camera hoặc Microphone. Vui lòng cấp quyền trên trình duyệt.');
        toast.showError('Không thể mở camera. Vui lòng kiểm tra quyền truy cập thiết bị!');
      }
    };

    startCamera();

    return () => {
      if (activeStream && !isBroadcastingRef.current) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen]);

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
    try {
      let broadcastStream = stream;
      if (!broadcastStream) {
        broadcastStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
      }

      // Mark broadcasting active so cleanup leaves tracks running for the player
      isBroadcastingRef.current = true;
      setStream(null);
      await onStartLiveStream(title.trim(), description.trim(), broadcastStream);
      onClose();
    } catch (err) {
      console.error('Failed to start live stream:', err);
      toast.showError('Không thể bắt đầu phát trực tiếp. Vui lòng thử lại!');
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
                <p className="font-semibold text-gray-300">{permissionError}</p>
                <p className="text-[11px] text-gray-500">
                  Hãy nhấn Cho phép (Allow) quyền Camera / Micro trên thanh địa chỉ trình duyệt.
                </p>
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
