import React, { useState } from 'react';
import {
  Crop,
  Sparkles,
  Smile,
  RotateCcw,
  Sun,
  Contrast,
  Droplet,
  Type,
  Check,
} from 'lucide-react';
import {
  PhotoAdjustments,
  PhotoCropSettings,
  PhotoFilter,
  PhotoTransform,
  StorySticker,
  DraggableText,
} from './types';
import { StoryCropControls } from './StoryCropControls';
import { StoryDraggableTextControls } from './StoryDraggableTextControls';

export const PHOTO_FILTERS: PhotoFilter[] = [
  { id: 'normal', name: 'Gốc', css: 'none' },
  { id: 'warm', name: 'Ấm áp', css: 'sepia(0.35) saturate(1.4) brightness(1.05)' },
  { id: 'vintage', name: 'Cổ điển', css: 'sepia(0.55) contrast(1.15) brightness(0.95)' },
  { id: 'bw', name: 'Trắng đen', css: 'grayscale(1) contrast(1.2)' },
  { id: 'vivid', name: 'Rực rỡ', css: 'saturate(1.8) contrast(1.15)' },
  { id: 'cool', name: 'Lạnh', css: 'hue-rotate(170deg) saturate(1.1)' },
  { id: 'film', name: 'Phim ảnh', css: 'contrast(1.25) brightness(0.95) saturate(1.25)' },
];

export const STICKER_PRESETS = [
  '🔥', '❤️', '😍', '🎉', '✨', '🌸', '☕', '🎵', '💯', '🚀',
  '🏖️', '🍕', '👏', '⭐', '😎', '🥳', '🎈', '💎', '🌈', '🥑'
];

interface StoryImageEditorProps {
  filter: PhotoFilter;
  onFilterChange: (filter: PhotoFilter) => void;
  adjustments: PhotoAdjustments;
  onAdjustmentsChange: (adjustments: PhotoAdjustments) => void;
  transform: PhotoTransform;
  onTransformChange: (transform: PhotoTransform) => void;
  crop: PhotoCropSettings;
  onCropChange: (crop: PhotoCropSettings) => void;
  onResetCrop: () => void;
  draggableText: DraggableText | null;
  onDraggableTextChange: (text: DraggableText | null) => void;
  stickers: StorySticker[];
  onAddSticker: (emoji: string) => void;
  onRemoveSticker: (id: string) => void;
  onReset: () => void;
}

export const StoryImageEditor: React.FC<StoryImageEditorProps> = ({
  filter,
  onFilterChange,
  adjustments,
  onAdjustmentsChange,
  transform,
  onTransformChange,
  crop,
  onCropChange,
  onResetCrop,
  draggableText,
  onDraggableTextChange,
  stickers,
  onAddSticker,
  onRemoveSticker,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'filter' | 'crop' | 'stickers'>('text');

  const handleResetAdjustments = () => {
    onAdjustmentsChange({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
    });
  };

  const hasFilterOrAdjustments =
    filter.id !== 'normal' ||
    adjustments.brightness !== 100 ||
    adjustments.contrast !== 100 ||
    adjustments.saturation !== 100;

  const hasCropOrFlip =
    crop.fitMode !== 'cover' || transform.flipH || transform.flipV;

  return (
    <div className="space-y-3.5 p-3.5 bg-gray-50 dark:bg-[#18191a] rounded-2xl border border-gray-200 dark:border-[#393a3b]">
      {/* 4-Tab Balanced Segmented Control */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 grid grid-cols-4 gap-1 p-1 bg-gray-200/70 dark:bg-[#242526] rounded-xl border border-gray-200 dark:border-[#393a3b]">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`py-2 px-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white dark:bg-[#3a3b3c] text-[#1877f2] dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Chữ</span>
            {draggableText && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('filter')}
            className={`py-2 px-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'filter'
                ? 'bg-white dark:bg-[#3a3b3c] text-[#1877f2] dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bộ lọc</span>
            {hasFilterOrAdjustments && <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('crop')}
            className={`py-2 px-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'crop'
                ? 'bg-white dark:bg-[#3a3b3c] text-[#1877f2] dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Crop className="w-3.5 h-3.5" />
            <span>Khung hình</span>
            {hasCropOrFlip && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stickers')}
            className={`py-2 px-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'stickers'
                ? 'bg-white dark:bg-[#3a3b3c] text-[#1877f2] dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Nhãn dán</span>
            {stickers.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />}
          </button>
        </div>

        <button
          type="button"
          onClick={onReset}
          title="Đặt lại toàn bộ chỉnh sửa ảnh"
          className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-[#3a3b3c] transition shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Tab 1: Draggable Text Controls */}
      {activeTab === 'text' && (
        <StoryDraggableTextControls
          draggableText={draggableText}
          onChange={onDraggableTextChange}
        />
      )}

      {/* Tab 2: Filters & Color Adjustments */}
      {activeTab === 'filter' && (
        <div className="space-y-4 p-3.5 bg-white dark:bg-[#242526] rounded-xl border border-gray-200 dark:border-[#393a3b]">
          {/* Filter Swatches Carousel */}
          <div>
            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-2">
              Bộ lọc nghệ thuật
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {PHOTO_FILTERS.map((f) => {
                const isSelected = filter.id === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onFilterChange(f)}
                    className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl border transition shrink-0 cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold ring-1 ring-blue-500'
                        : 'border-gray-200 dark:border-[#393a3b] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div
                      style={{ filter: f.css }}
                      className="w-12 h-12 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 shadow-sm relative overflow-hidden"
                    >
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] whitespace-nowrap">{f.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Adjustments */}
          <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-[#393a3b]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                Tinh chỉnh màu sắc
              </span>
              <button
                type="button"
                onClick={handleResetAdjustments}
                className="text-[11px] text-blue-500 hover:underline font-semibold cursor-pointer"
              >
                Đặt lại màu
              </button>
            </div>

            {/* Brightness */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" /> Độ sáng
                </span>
                <span>{adjustments.brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={adjustments.brightness}
                onChange={(e) =>
                  onAdjustmentsChange({ ...adjustments, brightness: Number(e.target.value) })
                }
                style={{
                  background: `linear-gradient(to right, #1877f2 0%, #1877f2 ${
                    ((adjustments.brightness - 50) / 100) * 100
                  }%, #4e4f50 ${((adjustments.brightness - 50) / 100) * 100}%, #4e4f50 100%)`,
                }}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#1877f2]"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-1.5">
                  <Contrast className="w-3.5 h-3.5 text-indigo-500" /> Độ tương phản
                </span>
                <span>{adjustments.contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={adjustments.contrast}
                onChange={(e) =>
                  onAdjustmentsChange({ ...adjustments, contrast: Number(e.target.value) })
                }
                style={{
                  background: `linear-gradient(to right, #1877f2 0%, #1877f2 ${
                    ((adjustments.contrast - 50) / 100) * 100
                  }%, #4e4f50 ${((adjustments.contrast - 50) / 100) * 100}%, #4e4f50 100%)`,
                }}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#1877f2]"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-rose-500" /> Độ bão hòa
                </span>
                <span>{adjustments.saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={adjustments.saturation}
                onChange={(e) =>
                  onAdjustmentsChange({ ...adjustments, saturation: Number(e.target.value) })
                }
                style={{
                  background: `linear-gradient(to right, #1877f2 0%, #1877f2 ${
                    (adjustments.saturation / 200) * 100
                  }%, #4e4f50 ${(adjustments.saturation / 200) * 100}%, #4e4f50 100%)`,
                }}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#1877f2]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Crop & Framing Controls */}
      {activeTab === 'crop' && (
        <StoryCropControls
          crop={crop}
          onChange={onCropChange}
          onReset={onResetCrop}
          transform={transform}
          onTransformChange={onTransformChange}
        />
      )}

      {/* Tab 4: Stickers Controls */}
      {activeTab === 'stickers' && (
        <div className="space-y-3.5 p-3.5 bg-white dark:bg-[#242526] rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs">
          <div>
            <p className="font-bold text-gray-800 dark:text-gray-200 mb-0.5">
              Nhãn dán cảm xúc
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Nhấn vào biểu tượng để đính lên ảnh. Có thể kéo di chuyển hoặc bấm đúp vào nhãn dán trên ảnh để xóa.
            </p>
          </div>

          <div className="grid grid-cols-5 gap-2 max-h-44 overflow-y-auto p-1 bg-gray-50 dark:bg-[#1e1f20] rounded-xl">
            {STICKER_PRESETS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onAddSticker(emoji)}
                className="h-10 rounded-xl hover:bg-gray-200 dark:hover:bg-[#3a3b3c] text-xl flex items-center justify-center transition hover:scale-125 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>

          {stickers.length > 0 && (
            <div className="pt-2 border-t border-gray-100 dark:border-[#393a3b]">
              <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block mb-1.5">
                Đã thêm ({stickers.length}/8):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {stickers.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onRemoveSticker(s.id)}
                    title="Nhấn để gỡ bỏ"
                    className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#3a3b3c] text-xs hover:bg-red-100 dark:hover:bg-red-900/40 text-gray-800 dark:text-gray-200 transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>{s.emoji}</span>
                    <span className="text-gray-400 hover:text-red-500">×</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

