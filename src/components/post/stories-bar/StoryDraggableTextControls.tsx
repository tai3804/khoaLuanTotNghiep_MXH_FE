import React from 'react';
import { Type, Move, Trash2, Plus, Sparkles } from 'lucide-react';
import { DraggableText } from './types';

interface StoryDraggableTextControlsProps {
  draggableText: DraggableText | null;
  onChange: (text: DraggableText | null) => void;
}

const TEXT_STYLE_PRESETS = [
  { id: 'dark-pill', label: 'Tối mờ', color: '#ffffff', bgColor: 'rgba(0, 0, 0, 0.70)' },
  { id: 'light-pill', label: 'Sáng', color: '#000000', bgColor: 'rgba(255, 255, 255, 0.95)' },
  { id: 'yellow-pill', label: 'Vàng rực', color: '#facc15', bgColor: 'rgba(0, 0, 0, 0.80)' },
  { id: 'neon-pill', label: 'Xanh Neon', color: '#38bdf8', bgColor: 'rgba(15, 23, 42, 0.90)' },
  { id: 'transparent', label: 'Không nền', color: '#ffffff', bgColor: 'transparent' },
];

const FONT_SIZE_PRESETS = [
  { label: 'Nhỏ', size: 14 },
  { label: 'Vừa', size: 18 },
  { label: 'Lớn', size: 24 },
  { label: 'Rất lớn', size: 32 },
];

export const StoryDraggableTextControls: React.FC<StoryDraggableTextControlsProps> = ({
  draggableText,
  onChange,
}) => {
  const handleCreateDefaultText = () => {
    onChange({
      id: 'text-' + Date.now(),
      text: 'Ghi chú của bạn...',
      x: 50,
      y: 75,
      color: '#ffffff',
      bgColor: 'rgba(0, 0, 0, 0.70)',
      fontSize: 18,
    });
  };

  if (!draggableText) {
    return (
      <div className="p-5 bg-white dark:bg-[#242526] rounded-xl border border-dashed border-gray-300 dark:border-[#4e4f50] text-center space-y-2.5">
        <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-500 mx-auto flex items-center justify-center">
          <Type className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
            Thêm ghi chú văn bản
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-[260px] mx-auto mt-0.5">
            Nhập chữ, chọn màu sắc và tự do kéo thả đến vị trí bất kỳ trên bức ảnh
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateDefaultText}
          className="px-4 py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 mx-auto cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm chữ vào tin</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 p-3.5 bg-white dark:bg-[#242526] rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#393a3b] pb-2">
        <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span>Ghi chú chữ trên ảnh</span>
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-gray-400 hover:text-red-500 transition p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3a3b3c] cursor-pointer"
          title="Xóa ghi chú này"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Text Input */}
      <div>
        <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
          Nội dung văn bản
        </label>
        <input
          type="text"
          value={draggableText.text}
          onChange={(e) => onChange({ ...draggableText, text: e.target.value })}
          placeholder="Nhập nội dung ghi chú..."
          className="w-full px-3 py-2 text-xs bg-gray-100 dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#4e4f50] rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Style Presets */}
      <div>
        <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
          Màu nền & kiểu chữ
        </label>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {TEXT_STYLE_PRESETS.map((preset) => {
            const isSelected =
              draggableText.color === preset.color && draggableText.bgColor === preset.bgColor;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() =>
                  onChange({
                    ...draggableText,
                    color: preset.color,
                    bgColor: preset.bgColor,
                  })
                }
                style={{
                  background: preset.bgColor === 'transparent' ? '#333' : preset.bgColor,
                  color: preset.color,
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition shrink-0 cursor-pointer ${
                  isSelected ? 'ring-2 ring-blue-500 border-white' : 'border-gray-300 dark:border-gray-600 opacity-80 hover:opacity-100'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
          Kích cỡ chữ
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {FONT_SIZE_PRESETS.map((f) => {
            const isSelected = draggableText.fontSize === f.size;
            return (
              <button
                key={f.size}
                type="button"
                onClick={() => onChange({ ...draggableText, fontSize: f.size })}
                className={`py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                    : 'border-gray-200 dark:border-[#393a3b] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dragging instruction */}
      <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl flex items-center gap-2 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/30">
        <Move className="w-4 h-4 shrink-0" />
        <span className="text-[11px] leading-tight">
          Kéo thả trực tiếp khung chữ trên bản xem trước bên phải để đặt vào vị trí bất kỳ!
        </span>
      </div>
    </div>
  );
};

