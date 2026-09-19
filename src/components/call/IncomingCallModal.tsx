import React from 'react';
import { Phone, PhoneOff, Video, Mic } from 'lucide-react';
import { useCall } from '../../context/CallContext';
import { UserAvatar } from '../common/UserAvatar';

export const IncomingCallModal: React.FC = () => {
  const { callState, remoteUser, mediaType, acceptCall, rejectCall } = useCall();

  React.useEffect(() => {
    if (callState === 'incoming') {
      try {
        if ('vibrate' in navigator) {
          navigator.vibrate([300, 200, 300, 200, 300]);
        }
      } catch {}
    }
  }, [callState]);

  if (callState !== 'incoming' || !remoteUser) {
    return null;
  }

  const isVideo = mediaType === 'VIDEO';

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in p-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-white/95 dark:bg-[#242526]/95 border border-white/20 dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] p-6 text-center backdrop-blur-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Background ambient lighting */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-green-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Pulsing Avatar */}
        <div className="relative mx-auto my-6 w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
          <div className="absolute -inset-2 rounded-full border-2 border-blue-400/40 animate-pulse" />
          <UserAvatar
            src={remoteUser.avatar}
            alt={remoteUser.name}
            size="xl"
            className="w-24 h-24 rounded-full ring-4 ring-white dark:ring-[#242526] shadow-xl object-cover relative z-10"
          />
        </div>

        {/* Caller Info */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate px-2">
          {remoteUser.name}
        </h3>
        <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
          {isVideo ? (
            <>
              <Video className="w-3.5 h-3.5" />
              <span>Cuộc gọi video đến...</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5" />
              <span>Cuộc gọi thoại đến...</span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-around px-4">
          {/* Reject */}
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={rejectCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-red-500/30 transition duration-200 cursor-pointer"
              title="Từ chối"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Từ chối</span>
          </div>

          {/* Accept */}
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={acceptCall}
              className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-green-500/30 transition duration-200 animate-bounce cursor-pointer"
              title="Trả lời"
            >
              {isVideo ? <Video className="w-7 h-7" /> : <Phone className="w-7 h-7" />}
            </button>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Trả lời</span>
          </div>
        </div>
      </div>
    </div>
  );
};
