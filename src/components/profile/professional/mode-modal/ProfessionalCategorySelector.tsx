import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Laptop,
  Gamepad2,
  Camera,
  PenTool,
  TrendingUp,
  Shirt,
  GraduationCap,
  Dumbbell,
  Music,
  Utensils,
  Smile,
  LucideIcon,
} from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { CREATOR_CATEGORY_DETAILS } from '../types';

interface ProfessionalCategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Laptop,
  Gamepad2,
  Camera,
  PenTool,
  TrendingUp,
  Shirt,
  GraduationCap,
  Dumbbell,
  Music,
  Utensils,
  Smile,
};

export const ProfessionalCategorySelector: React.FC<ProfessionalCategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = CREATOR_CATEGORY_DETAILS.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#b0b3b8]">
            {isEn ? 'Select creator category' : 'Chọn hạng mục chuyên môn'}
          </h4>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
            {isEn
              ? 'Choose a category that best describes what you create.'
              : 'Chọn danh mục đại diện cho lĩnh vực sáng tạo của bạn trên trang cá nhân.'}
          </p>
        </div>

        {/* Search input with fixed width and smooth search icon */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? 'Search categories...' : 'Tìm kiếm hạng mục...'}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-100 dark:bg-[#3a3b3c] border border-transparent focus:border-gray-400 dark:focus:border-gray-500 focus:bg-white dark:focus:bg-[#242526] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 dark:placeholder-[#b0b3b8] outline-hidden transition"
          />
        </div>
      </div>

      {/* Grid of Distinct Boxed Cards with Fixed Height to Prevent Jitter */}
      <div className="h-[284px] overflow-y-auto [scrollbar-gutter:stable] pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredCategories.map((item) => {
            const isSelected = selectedCategory === item.name;
            const IconComponent = CATEGORY_ICON_MAP[item.iconName] || Sparkles;

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => onSelectCategory(item.name)}
                className={`min-h-[84px] p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'border-gray-900 dark:border-white bg-gray-100/90 dark:bg-[#3a3b3c] shadow-xs'
                    : 'border-gray-200 dark:border-[#393a3b] bg-white dark:bg-[#242526] hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/40'
                }`}
              >
                {/* Monochrome Neutral Icon */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isSelected
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb]'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-900 dark:text-[#e4e6eb] truncate">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-[#b0b3b8] px-1.5 py-0.2 rounded bg-gray-200/70 dark:bg-[#3a3b3c] shrink-0">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-[#b0b3b8] mt-1 leading-snug line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Radio Indicator */}
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1 transition-colors ${
                    isSelected
                      ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white'
                      : 'border-gray-300 dark:border-gray-600 bg-transparent'
                  }`}
                >
                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#242526]" />
                  )}
                </div>
              </button>
            );
          })}

          {filteredCategories.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 dark:text-[#b0b3b8] text-xs">
              {isEn
                ? `No categories match "${searchQuery}"`
                : `Không tìm thấy hạng mục nào phù hợp với từ khóa "${searchQuery}"`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
