import React from 'react';
import { ZoomIn, ZoomOut, RotateCw, FlipHorizontal, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

interface ImageCropControlsProps {
  zoom: number;
  rotation: number;
  onZoomChange: (newZoom: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
  onFlipHorizontal: () => void;
  onReset: () => void;
}

export const ImageCropControls: React.FC<ImageCropControlsProps> = ({
  zoom,
  rotation,
  onZoomChange,
  onZoomIn,
  onZoomOut,
  onRotate,
  onFlipHorizontal,
  onReset,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1f20] border-t border-gray-200 dark:border-[#393a3b] flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Zoom Slider */}
      <div className="flex items-center space-x-3 w-full sm:w-auto flex-1 max-w-sm">
        <button
          onClick={onZoomOut}
          title={isEn ? 'Zoom Out' : 'Thu nhỏ'}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-200 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-200 dark:bg-[#3a3b3c] rounded-lg appearance-none cursor-pointer accent-[#1877f2]"
          />
        </div>

        <button
          onClick={onZoomIn}
          title={isEn ? 'Zoom In' : 'Phóng to'}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-200 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <span className="text-xs font-semibold text-gray-600 dark:text-[#b0b3b8] min-w-[42px] text-right">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Rotation & Flip & Reset Controls */}
      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
        <button
          onClick={onRotate}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-[#2e2f30] text-gray-700 dark:text-[#e4e6eb] border border-gray-200 dark:border-[#393a3b] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition shadow-2xs cursor-pointer"
          title={isEn ? 'Rotate 90 degrees' : 'Xoay 90°'}
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{rotation}°</span>
        </button>

        <button
          onClick={onFlipHorizontal}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-[#2e2f30] text-gray-700 dark:text-[#e4e6eb] border border-gray-200 dark:border-[#393a3b] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition shadow-2xs cursor-pointer"
          title={isEn ? 'Flip Horizontal' : 'Lật ngang'}
        >
          <FlipHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isEn ? 'Flip' : 'Lật'}</span>
        </button>

        <button
          onClick={onReset}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-[#2e2f30] text-gray-700 dark:text-[#e4e6eb] border border-gray-200 dark:border-[#393a3b] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition shadow-2xs cursor-pointer"
          title={isEn ? 'Reset Transforms' : 'Đặt lại vị trí'}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isEn ? 'Reset' : 'Đặt lại'}</span>
        </button>
      </div>
    </div>
  );
};
