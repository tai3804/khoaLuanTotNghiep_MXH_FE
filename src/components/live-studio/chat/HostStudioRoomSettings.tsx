import React from 'react';
import { Activity, ShieldAlert, Heart, Clock, Wifi, Video, Zap } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

interface HostStudioRoomSettingsProps {
  slowModeSeconds: 0 | 5 | 10;
  isReactionsEnabled: boolean;
  onSlowModeChange: (sec: 0 | 5 | 10) => void;
  onToggleReactions: () => void;
}

export const HostStudioRoomSettings: React.FC<HostStudioRoomSettingsProps> = ({
  slowModeSeconds,
  isReactionsEnabled,
  onSlowModeChange,
  onToggleReactions,
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex-1 overflow-y-auto p-3.5 space-y-4 bg-white dark:bg-zinc-900 select-none text-xs">
      {/* 1. Stream Health Section */}
      <div className="space-y-2">
        <div className="flex items-center space-x-1.5 text-gray-900 dark:text-white font-bold">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span>{t('live.settings.streamHealth', 'Tình trạng đường truyền')}</span>
        </div>

        <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-950/60 border border-gray-200 dark:border-zinc-800 space-y-2.5">
          {/* Health indicator */}
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-zinc-400">Trạng thái phát sóng:</span>
            <span className="flex items-center space-x-1.5 font-bold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t('live.settings.excellent', 'Tuyệt vời')}</span>
            </span>
          </div>

          {/* Resolution */}
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-zinc-400 flex items-center space-x-1">
              <Video className="w-3 h-3 text-blue-500" />
              <span>{t('live.settings.resolution', 'Độ phân giải')}:</span>
            </span>
            <span className="font-semibold text-gray-800 dark:text-zinc-200">720p HD @ 30fps</span>
          </div>

          {/* Protocol */}
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-zinc-400 flex items-center space-x-1">
              <Wifi className="w-3 h-3 text-indigo-500" />
              <span>{t('live.settings.protocol', 'Giao thức phòng')}:</span>
            </span>
            <span className="font-semibold text-gray-800 dark:text-zinc-200">WebRTC One-Way</span>
          </div>

          {/* Latency */}
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-zinc-400 flex items-center space-x-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>{t('live.settings.latency', 'Độ trễ truyền tải')}:</span>
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {t('live.settings.ultraLow', 'Cực thấp (< 500ms)')}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Chat Moderation & Controls */}
      <div className="space-y-2.5 pt-2 border-t border-gray-200 dark:border-zinc-800">
        <span className="font-bold text-gray-900 dark:text-white block">
          Kiểm duyệt phòng trò chuyện
        </span>

        {/* Slow Mode selector */}
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-950/60 border border-gray-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-gray-800 dark:text-zinc-200 font-semibold">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>{t('live.settings.slowMode', 'Chế độ chậm')}</span>
            </div>
            <span className="text-[10px] text-gray-500 dark:text-zinc-400 font-medium">
              Giãn cách gửi bình luận
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {([0, 5, 10] as const).map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => onSlowModeChange(sec)}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition cursor-pointer text-center ${
                  slowModeSeconds === sec
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-750'
                }`}
              >
                {sec === 0
                  ? t('live.settings.slowModeOff', 'Tắt')
                  : sec === 5
                  ? t('live.settings.slowMode5s', '5 giây')
                  : t('live.settings.slowMode10s', '10 giây')}
              </button>
            ))}
          </div>
        </div>

        {/* Floating Reactions Toggle */}
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-950/60 border border-gray-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-red-500 fill-red-500/20" />
            <div>
              <span className="font-semibold text-gray-800 dark:text-zinc-200 block">
                {t('live.settings.floatingReactions', 'Hiệu ứng cảm xúc nổi')}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-zinc-400">
                {t('live.settings.floatingReactionsDesc', 'Hiển thị tim bay trên màn hình')}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleReactions}
            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
              isReactionsEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-zinc-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                isReactionsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
