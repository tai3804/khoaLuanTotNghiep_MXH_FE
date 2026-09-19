import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sun, Moon, Globe } from 'lucide-react';

export const AppearanceSettingsTab: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb] border-b border-gray-100 dark:border-[#393a3b] pb-3 flex items-center space-x-2">
        <Sun className="w-4 h-4 text-amber-500" />
        <span>Tùy Chỉnh Giao Diện & Ngôn Ngữ</span>
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl border border-gray-200/60 dark:border-[#393a3b]">
          <div className="flex items-center space-x-3">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <h4 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">Giao diện Sáng / Tối</h4>
              <p className="text-[10px] text-gray-400 dark:text-[#8a8d91]">
                Hiện tại: {theme === 'dark' ? 'Chế độ Tối (Dark)' : 'Chế độ Sáng (Light)'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-1.5 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
          >
            Chuyển đổi
          </button>
        </div>

        <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl border border-gray-200/60 dark:border-[#393a3b]">
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-blue-500" />
            <div>
              <h4 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">Ngôn ngữ hiển thị</h4>
              <p className="text-[10px] text-gray-400 dark:text-[#8a8d91]">
                Đang chọn: {language === 'vi' ? 'Tiếng Việt' : 'English'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
            className="px-4 py-1.5 bg-gray-200 dark:bg-[#3a3b3c] text-gray-800 dark:text-[#e4e6eb] rounded-xl text-xs font-bold hover:bg-gray-300 dark:hover:bg-[#4e4f50] transition cursor-pointer"
          >
            Đổi sang {language === 'vi' ? 'English' : 'Tiếng Việt'}
          </button>
        </div>
      </div>
    </div>
  );
};
