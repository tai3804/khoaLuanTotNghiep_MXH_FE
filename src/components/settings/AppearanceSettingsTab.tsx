import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sun, Moon, Globe } from 'lucide-react';

export const AppearanceSettingsTab: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-[#393a3b]">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">Giao diện & Ngôn ngữ</h2>
        <p className="text-[13px] text-gray-500 dark:text-[#b0b3b8] mt-1">
          Tùy chỉnh cách Facebook hiển thị trên thiết bị của bạn.
        </p>
      </div>

      <div className="space-y-4">
        {/* Dark Mode Card */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-[#242526] hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/50 rounded-xl transition cursor-default">
          <div className="flex items-start space-x-4">
            <div className="p-2.5 bg-gray-100 dark:bg-[#3a3b3c] rounded-full shrink-0">
              {theme === 'dark' ? <Moon className="w-6 h-6 text-gray-700 dark:text-[#e4e6eb]" /> : <Sun className="w-6 h-6 text-gray-700 dark:text-[#e4e6eb]" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">Chế độ tối</h4>
              <p className="text-[13px] text-gray-500 dark:text-[#b0b3b8] mt-0.5">
                Điều chỉnh giao diện sáng tối để giảm độ chói màn hình và bảo vệ mắt.
              </p>
              <div className="mt-3 flex items-center space-x-3">
                <button
                  onClick={() => theme !== 'dark' && toggleTheme()}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                    theme === 'dark'
                      ? 'bg-[#1877f2]/10 text-[#1877f2] dark:bg-[#2d88ff]/20 dark:text-[#2d88ff]'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-[#3a3b3c] dark:text-[#e4e6eb] dark:hover:bg-[#4e4f50]'
                  }`}
                >
                  Bật
                </button>
                <button
                  onClick={() => theme === 'dark' && toggleTheme()}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                    theme === 'light'
                      ? 'bg-[#1877f2]/10 text-[#1877f2] dark:bg-[#2d88ff]/20 dark:text-[#2d88ff]'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-[#3a3b3c] dark:text-[#e4e6eb] dark:hover:bg-[#4e4f50]'
                  }`}
                >
                  Tắt
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Language Card */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-[#242526] hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/50 rounded-xl transition cursor-default">
          <div className="flex items-start space-x-4">
            <div className="p-2.5 bg-gray-100 dark:bg-[#3a3b3c] rounded-full shrink-0">
              <Globe className="w-6 h-6 text-gray-700 dark:text-[#e4e6eb]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">Ngôn ngữ</h4>
              <p className="text-[13px] text-gray-500 dark:text-[#b0b3b8] mt-0.5">
                Chọn ngôn ngữ hiển thị cho các nút, tiêu đề và văn bản.
              </p>
              <div className="mt-3 flex items-center space-x-3">
                <button
                  onClick={() => language !== 'vi' && setLanguage('vi')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                    language === 'vi'
                      ? 'bg-[#1877f2]/10 text-[#1877f2] dark:bg-[#2d88ff]/20 dark:text-[#2d88ff]'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-[#3a3b3c] dark:text-[#e4e6eb] dark:hover:bg-[#4e4f50]'
                  }`}
                >
                  Tiếng Việt
                </button>
                <button
                  onClick={() => language !== 'en' && setLanguage('en')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                    language === 'en'
                      ? 'bg-[#1877f2]/10 text-[#1877f2] dark:bg-[#2d88ff]/20 dark:text-[#2d88ff]'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-[#3a3b3c] dark:text-[#e4e6eb] dark:hover:bg-[#4e4f50]'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
