import React from 'react';

export const AuthFooter: React.FC = () => {
  return (
    <footer className="w-full py-6 px-4 text-center text-xs text-gray-500 dark:text-[#b0b3b8] relative z-20 select-none border-t border-gray-200/50 dark:border-[#393a3b]/50 bg-white/40 dark:bg-[#18191a]/40 backdrop-blur-xs">
      <div className="max-w-4xl mx-auto space-y-2.5">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[12px] text-gray-500 dark:text-[#b0b3b8]">
          <span className="hover:underline cursor-pointer">Tiếng Việt</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">English (US)</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Français</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">日本語</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">한국어</span>
        </div>

        <div className="border-t border-gray-200/60 dark:border-[#393a3b]/60 pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] text-gray-400 dark:text-gray-500">
          <span className="hover:underline cursor-pointer">Điều khoản dịch vụ</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Chính sách quyền riêng tư</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Tiêu chuẩn cộng đồng</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Trung tâm trợ giúp</span>
          <span>•</span>
          <span>© 2026 Social Network. Bảo lưu mọi quyền.</span>
        </div>
      </div>
    </footer>
  );
};
