import React from 'react';
import { Eye, Maximize, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';

interface LiveStreamHeaderProps {
  formattedTime: string;
  viewerCount: number;
  onToggleFullscreen: () => void;
  onOpenPage?: () => void;
}

export const LiveStreamHeader: React.FC<LiveStreamHeaderProps> = ({
  formattedTime,
  viewerCount,
  onToggleFullscreen,
  onOpenPage,
}) => {
  const { t } = useLanguage();

  return (
    <div className="absolute top-3 inset-x-3 flex items-center justify-between z-30 pointer-events-auto select-none">
      <div className="flex items-center space-x-2">
        {/* Live Indicator Badge */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-red-600 text-white rounded-md text-xs font-black tracking-wider shadow-lg">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>TRỰC TIẾP</span>
        </div>

        {/* Live Duration Clock */}
        <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white rounded-md text-xs font-mono font-semibold shadow-md">
          {formattedTime}
        </div>

        {/* Real Accurate Viewer Count */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white rounded-md text-xs font-semibold shadow-md">
          <Eye className="w-3.5 h-3.5 text-red-400" />
          <span>{viewerCount} {t('live.viewerCount', 'người xem')}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-1">
        {onOpenPage && (
          <button
            type="button"
            onClick={onOpenPage}
            className="p-2 rounded-lg bg-black/50 hover:bg-black/80 text-white transition cursor-pointer backdrop-blur-sm"
            title={t('live.openPage', 'Mở trang xem trực tiếp')}
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onToggleFullscreen}
          className="p-2 rounded-lg bg-black/50 hover:bg-black/80 text-white transition cursor-pointer backdrop-blur-sm"
          title="Toàn màn hình"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
