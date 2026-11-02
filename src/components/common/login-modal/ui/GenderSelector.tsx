import React from 'react';

export interface GenderSelectorProps {
  gender: string;
  setGender: (gender: string) => void;
  tabIndex?: number;
  label?: string;
  required?: boolean;
}

const GENDER_OPTIONS = [
  { id: 'MALE', label: 'Nam' },
  { id: 'FEMALE', label: 'Nữ' },
  { id: 'OTHER', label: 'Khác' },
];

export const GenderSelector: React.FC<GenderSelectorProps> = ({
  gender,
  setGender,
  tabIndex,
  label = 'Giới tính',
  required = true,
}) => {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="grid grid-cols-3 gap-1.5">
        {GENDER_OPTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            tabIndex={tabIndex}
            onClick={() => setGender(item.id)}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              gender === item.id
                ? 'bg-blue-50 dark:bg-blue-950/60 border-[#1877f2] text-[#1877f2] dark:text-[#4599ff] shadow-xs'
                : 'bg-white dark:bg-[#18191a] border-gray-300 dark:border-[#3e4042] text-gray-600 dark:text-[#b0b3b8] hover:border-gray-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

