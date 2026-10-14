import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sun, Moon, Globe, Check, Palette } from 'lucide-react';

export const AppearanceSettingsTab: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200 dark:border-[#393a3b] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-[#e4e6eb]">
                Giao diện &amp; Ngôn ngữ
              </h2>
              <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
                Tùy chỉnh chủ đề màu sắc hiển thị và ngôn ngữ giao diện hệ thống.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Dark Mode / Light Mode */}
        <div className="rounded-2xl border border-gray-200/90 dark:border-[#393a3b] bg-white/70 dark:bg-[#242526]/70 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb] flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Chế độ hiển thị</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
              Điều chỉnh màu sắc giao diện sáng tối để giảm độ chói mắt hoặc tiết kiệm pin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Light Option */}
            <button
              type="button"
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                theme === 'light'
                  ? 'border-[#1877f2] bg-blue-50/40 dark:bg-blue-950/20 ring-2 ring-[#1877f2]/20 shadow-xs'
                  : 'border-gray-200 dark:border-[#393a3b] bg-white dark:bg-[#1e1f21] hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                  <Sun className="w-5 h-5" />
                </div>
                {theme === 'light' && (
                  <div className="w-5 h-5 rounded-full bg-[#1877f2] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">Chế độ Sáng</h4>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
                  Tông màu trắng sáng tiêu chuẩn, văn bản đậm nét.
                </p>
              </div>
            </button>

            {/* Dark Option */}
            <button
              type="button"
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                theme === 'dark'
                  ? 'border-[#1877f2] bg-blue-50/40 dark:bg-blue-950/20 ring-2 ring-[#1877f2]/20 shadow-xs'
                  : 'border-gray-200 dark:border-[#393a3b] bg-white dark:bg-[#1e1f21] hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                  <Moon className="w-5 h-5" />
                </div>
                {theme === 'dark' && (
                  <div className="w-5 h-5 rounded-full bg-[#1877f2] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">Chế độ Tối</h4>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
                  Tông nền đen dịu mắt, dễ chịu khi sử dụng vào ban đêm.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Section 2: Language */}
        <div className="rounded-2xl border border-gray-200/90 dark:border-[#393a3b] bg-white/70 dark:bg-[#242526]/70 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb] flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-500" />
              <span>Ngôn ngữ hiển thị</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
              Chọn ngôn ngữ mặc định cho các nút, menu và văn bản trong hệ thống.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Vietnamese */}
            <button
              type="button"
              onClick={() => language !== 'vi' && setLanguage('vi')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                language === 'vi'
                  ? 'border-[#1877f2] bg-blue-50/40 dark:bg-blue-950/20 ring-2 ring-[#1877f2]/20 shadow-xs'
                  : 'border-gray-200 dark:border-[#393a3b] bg-white dark:bg-[#1e1f21] hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🇻🇳</span>
                {language === 'vi' && (
                  <div className="w-5 h-5 rounded-full bg-[#1877f2] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">Tiếng Việt</h4>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
                  Giao diện chuẩn tiếng Việt đầy đủ.
                </p>
              </div>
            </button>

            {/* English */}
            <button
              type="button"
              onClick={() => language !== 'en' && setLanguage('en')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                language === 'en'
                  ? 'border-[#1877f2] bg-blue-50/40 dark:bg-blue-950/20 ring-2 ring-[#1877f2]/20 shadow-xs'
                  : 'border-gray-200 dark:border-[#393a3b] bg-white dark:bg-[#1e1f21] hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🇺🇸</span>
                {language === 'en' && (
                  <div className="w-5 h-5 rounded-full bg-[#1877f2] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">English (US)</h4>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
                  Standard International English language.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
