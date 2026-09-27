import React from 'react';
import { Mic, MicOff, Video, VideoOff, Square, AlertTriangle } from 'lucide-react';

interface HostStudioControlsBarProps {
  isMicOn: boolean;
  isCameraOn: boolean;
  showEndConfirm: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onShowEndConfirm: (show: boolean) => void;
  onEndBroadcast: () => void;
}

export const HostStudioControlsBar: React.FC<HostStudioControlsBarProps> = ({
  isMicOn,
  isCameraOn,
  showEndConfirm,
  onToggleMic,
  onToggleCamera,
  onShowEndConfirm,
  onEndBroadcast,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-t border-zinc-800 rounded-b-xl select-none">
      {/* 1. Device Controls */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onToggleMic}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm ${
            isMicOn
              ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isMicOn ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4" />}
          <span>{isMicOn ? 'Tắt Micro' : 'Bật Micro'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleCamera}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm ${
            isCameraOn
              ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isCameraOn ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4" />}
          <span>{isCameraOn ? 'Tắt Camera' : 'Bật Camera'}</span>
        </button>
      </div>

      {/* 2. End Live Button with Confirmation */}
      <div className="flex items-center space-x-2">
        {!showEndConfirm ? (
          <button
            type="button"
            onClick={() => onShowEndConfirm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-lg shadow-red-950/40"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Kết thúc phát trực tiếp</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2 bg-zinc-950 p-1.5 rounded-xl border border-red-500/40 animate-fadeIn">
            <div className="flex items-center space-x-1.5 px-2 text-xs text-red-400 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Dừng phát sóng?</span>
            </div>
            <button
              type="button"
              onClick={() => onShowEndConfirm(false)}
              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-gray-300 text-xs rounded-lg cursor-pointer transition font-medium"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onEndBroadcast}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg cursor-pointer transition font-bold shadow-md"
            >
              Xác nhận kết thúc
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
