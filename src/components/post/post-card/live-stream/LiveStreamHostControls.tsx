import React from 'react';
import { Mic, MicOff, Video, VideoOff, Square, Radio } from 'lucide-react';

interface LiveStreamHostControlsProps {
  isMicOn: boolean;
  isCameraOn: boolean;
  showEndConfirm: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onShowEndConfirm: (show: boolean) => void;
  onStopBroadcast: () => void;
  onOpenStudio?: () => void;
}

export const LiveStreamHostControls: React.FC<LiveStreamHostControlsProps> = ({
  isMicOn,
  isCameraOn,
  showEndConfirm,
  onToggleMic,
  onToggleCamera,
  onShowEndConfirm,
  onStopBroadcast,
  onOpenStudio,
}) => {
  return (
    <div className="absolute bottom-3 inset-x-3 flex items-center justify-between bg-black/75 backdrop-blur-md p-2.5 rounded-xl z-30 border border-white/10 pointer-events-auto shadow-2xl">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={onToggleMic}
          className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
            isMicOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-600 text-white'
          }`}
        >
          {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          <span className="hidden sm:inline">{isMicOn ? 'Micro: Bật' : 'Micro: Tắt'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleCamera}
          className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
            isCameraOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-600 text-white'
          }`}
        >
          {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          <span className="hidden sm:inline">{isCameraOn ? 'Camera: Bật' : 'Camera: Tắt'}</span>
        </button>

        {onOpenStudio && (
          <button
            type="button"
            onClick={onOpenStudio}
            className="p-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 bg-blue-600/30 text-blue-400 hover:bg-blue-600/50 border border-blue-500/30 transition cursor-pointer"
          >
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="hidden sm:inline">Mở Live Studio</span>
          </button>
        )}
      </div>

      <div>
        {!showEndConfirm ? (
          <button
            type="button"
            onClick={() => onShowEndConfirm(true)}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition cursor-pointer shadow-md"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Kết thúc Live</span>
          </button>
        ) : (
          <div className="flex items-center space-x-1.5 animate-fadeIn">
            <button
              type="button"
              onClick={() => onShowEndConfirm(false)}
              className="px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onStopBroadcast}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              Dừng phát sóng ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
