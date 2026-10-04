import React from 'react';
import { Megaphone, X } from 'lucide-react';
import { useSystemConfig } from '../../context/SystemConfigContext';

export const SystemAnnouncementBanner: React.FC = () => {
  const { systemAnnouncement, isAnnouncementDismissed, dismissAnnouncement } = useSystemConfig();

  if (!systemAnnouncement || isAnnouncementDismissed) {
    return null;
  }

  return (
    <aside
      aria-label="Thông báo hệ thống"
      className="relative z-30 mb-4 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/10 dark:shadow-blue-900/20"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Megaphone className="h-5 w-5 text-yellow-300 animate-bounce" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-100">
              Thông Báo Hệ Thống
            </p>
            <p className="text-sm font-medium text-white break-words line-clamp-2">
              {systemAnnouncement}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={dismissAnnouncement}
          className="shrink-0 rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
          title="Đóng thông báo"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};
