import React from 'react';
import { Radio, Users, Minimize2, Maximize2, X } from 'lucide-react';

interface HostStudioHeaderProps {
  title: string;
  formattedTime: string;
  viewerCount: number;
  onMinimize: () => void;
  onClose: () => void;
}

export const HostStudioHeader: React.FC<HostStudioHeaderProps> = ({
  title,
  formattedTime,
  viewerCount,
  onMinimize,
  onClose,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 select-none">
      {/* Left: Studio Branding & Title */}
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className="flex items-center space-x-2 bg-red-600/20 border border-red-500/40 text-red-400 px-2.5 py-1 rounded-full text-xs font-bold shrink-0 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>LIVE STUDIO</span>
        </div>

        <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
          {title || 'Phát trực tiếp'}
        </h2>
      </div>

      {/* Center/Right: Live Stats & Window Controls */}
      <div className="flex items-center space-x-3 shrink-0">
        {/* Timer Badge */}
        <div className="flex items-center space-x-1.5 bg-black/60 px-2.5 py-1 rounded-lg text-xs font-mono text-gray-300 border border-white/10">
          <span className="text-red-400 font-bold">⏱</span>
          <span>{formattedTime}</span>
        </div>

        {/* Viewer Count Badge */}
        <div className="flex items-center space-x-1.5 bg-blue-600/20 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-400 border border-blue-500/30">
          <Users className="w-3.5 h-3.5" />
          <span>{viewerCount} người xem</span>
        </div>

        {/* Window action buttons */}
        <div className="flex items-center space-x-1 pl-2 border-l border-zinc-700">
          <button
            type="button"
            onClick={onMinimize}
            title="Thu nhỏ thành cửa sổ nổi để vừa live vừa lướt web"
            className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-lg transition cursor-pointer"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Đóng Studio về bảng tin (Live vẫn tiếp tục phát sóng)"
            className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
