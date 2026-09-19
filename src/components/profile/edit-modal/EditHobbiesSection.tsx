import React from 'react';

interface EditHobbiesSectionProps {
  availableHobbies: string[];
  selectedHobbies: string[];
  onToggleHobby: (hobby: string) => void;
}

export const EditHobbiesSection: React.FC<EditHobbiesSectionProps> = ({
  availableHobbies,
  selectedHobbies,
  onToggleHobby,
}) => {
  return (
    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-[#393a3b]">
      <h4 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb]">
        Sở thích
      </h4>
      <div className="flex flex-wrap gap-2">
        {availableHobbies.map((hobby) => {
          const isSelected = selectedHobbies.includes(hobby);
          return (
            <button
              key={hobby}
              type="button"
              onClick={() => onToggleHobby(hobby)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
                isSelected
                  ? 'bg-[#1877f2] text-white border-[#1877f2] shadow-sm'
                  : 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb] border-gray-200 dark:border-[#4e4f50] hover:bg-gray-200 dark:hover:bg-[#4e4f50]'
              }`}
            >
              {hobby}
            </button>
          );
        })}
      </div>
    </div>
  );
};
