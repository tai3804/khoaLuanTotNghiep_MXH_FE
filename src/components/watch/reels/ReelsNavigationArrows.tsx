import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ReelsNavigationArrowsProps {
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export const ReelsNavigationArrows: React.FC<ReelsNavigationArrowsProps> = ({
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}) => {
  return (
    <>
      {/* Navigation Arrow Up */}
      {hasPrev && (
        <button
          type="button"
          onClick={onPrev}
          className="hidden sm:flex absolute -left-16 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition cursor-pointer shadow-lg hover:scale-110"
          title="Video trước (Mũi tên lên)"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}

      {/* Navigation Arrow Down */}
      {hasNext && (
        <button
          type="button"
          onClick={onNext}
          className="hidden sm:flex absolute -right-16 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition cursor-pointer shadow-lg hover:scale-110"
          title="Video kế tiếp (Mũi tên xuống)"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      )}
    </>
  );
};
