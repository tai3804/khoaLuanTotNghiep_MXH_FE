import React from 'react';
import { Maximize2, Minimize2, FlipHorizontal, FlipVertical, RotateCcw, Move } from 'lucide-react';
import { PhotoCropSettings, PhotoTransform } from './types';

interface StoryCropControlsProps {
  crop: PhotoCropSettings;
  onChange: (crop: PhotoCropSettings) => void;
  onReset: () => void;
  transform: PhotoTransform;
  onTransformChange: (transform: PhotoTransform) => void;
}

export const StoryCropControls: React.FC<StoryCropControlsProps> = ({
  crop,
  onChange,
  onReset,
  transform,
  onTransformChange,
}) => {
  const handleFlipH = () => {
    onTransformChange({
      ...transform,
      flipH: !transform.flipH,
    });
  };

  const handleFlipV = () => {
    onTransformChange({
      ...transform,
      flipV: !transform.flipV,
    });
  };

  return (
    <div className="space-y-3.5 p-3.5 bg-white dark:bg-[#242526] rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs">
      {/* Fit Mode Switcher */}
      <div className="space-y-1.5">
        <label className="block font-bold text-gray-800 dark:text-gray-200">
          Chế độ hiển thị ảnh (9:16)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...crop, fitMode: 'cover' })}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              crop.fitMode === 'cover'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'border-gray-200 dark:border-[#393a3b] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-700 dark:text-gray-300'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Tràn khung (Cắt đầy)</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ ...crop, fitMode: 'contain' })}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              crop.fitMode === 'contain'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'border-gray-200 dark:border-[#393a3b] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-700 dark:text-gray-300'
            }`}
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Vừa khung (Trọn vẹn)</span>
          </button>
        </div>
      </div>

      {/* Flips & Orientation */}
      <div className="space-y-1.5">
        <label className="block font-bold text-gray-800 dark:text-gray-200">
          Lật ảnh đối xứng
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleFlipH}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              transform.flipH
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'border-gray-200 dark:border-[#393a3b] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-700 dark:text-gray-300'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            <span>Lật ngang</span>
          </button>

          <button
            type="button"
            onClick={handleFlipV}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              transform.flipV
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'border-gray-200 dark:border-[#393a3b] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-700 dark:text-gray-300'
            }`}
          >
            <FlipVertical className="w-3.5 h-3.5" />
            <span>Lật dọc</span>
          </button>
        </div>
      </div>

      {/* Quick Helper Box */}
      <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl flex items-start gap-2 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/30">
        <Move className="w-4 h-4 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <strong>Mẹo:</strong> Nhấn giữ và kéo ảnh trực tiếp trên bản xem trước bên phải để chọn khúc ảnh muốn hiển thị. Dùng thanh trượt thu phóng và nút Xoay bên dưới bản xem trước.
        </div>
      </div>

      {/* Reset & Center Button */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-gray-500 dark:text-gray-400">
          Khôi phục vị trí mặc định
        </span>
        <button
          type="button"
          onClick={onReset}
          className="px-2.5 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Căn giữa lại</span>
        </button>
      </div>
    </div>
  );
};

