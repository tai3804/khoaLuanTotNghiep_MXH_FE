import React from 'react';
import { Wrench, RefreshCw, ShieldAlert } from 'lucide-react';
import { useSystemConfig } from '../../context/SystemConfigContext';

export const MaintenanceScreen: React.FC = () => {
  const { refreshConfigs } = useSystemConfig();
  const [checking, setChecking] = React.useState(false);

  const handleRetry = async () => {
    setChecking(true);
    try {
      await refreshConfigs();
    } finally {
      setTimeout(() => setChecking(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f0f2f5] dark:bg-[#18191a] p-4 text-gray-900 dark:text-[#e4e6eb]">
      <div className="w-full max-w-md bg-white dark:bg-[#242526] rounded-3xl p-8 border border-gray-200 dark:border-[#393a3b] shadow-2xl text-center space-y-6 animate-fade-in">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
          <Wrench className="h-10 w-10 animate-pulse" />
          <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md">
            <ShieldAlert className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Hệ Thống Đang Bảo Trì
          </h2>
          <p className="text-sm text-gray-500 dark:text-[#b0b3b8] leading-relaxed">
            Hệ thống mạng xã hội đang được tạm dừng để nâng cấp và bảo trì theo lịch trình của Quản trị viên. Chúng tôi sẽ sớm quay trở lại!
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleRetry}
            disabled={checking}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1877f2] hover:bg-[#166fe5] active:scale-[0.98] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all cursor-pointer disabled:opacity-70"
          >
            <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Đang kiểm tra...' : 'Kiểm tra lại'}</span>
          </button>
        </div>

        <p className="text-xs text-gray-400 dark:text-[#65676b]">
          Khóa Luận Tốt Nghiệp MXH &copy; 2026
        </p>
      </div>
    </div>
  );
};
