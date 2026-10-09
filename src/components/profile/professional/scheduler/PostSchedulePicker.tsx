import React, { useState } from 'react';
import { Calendar, Clock, X, Check } from 'lucide-react';

interface PostSchedulePickerProps {
  scheduledAt?: string;
  onChange: (isoString?: string) => void;
  onClose?: () => void;
}

export const PostSchedulePicker: React.FC<PostSchedulePickerProps> = ({
  scheduledAt,
  onChange,
  onClose,
}) => {
  // Convert ISO string to format YYYY-MM-DDTHH:mm
  const formatForInput = (iso?: string) => {
    if (!iso) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(20, 0, 0, 0);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
    }
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [dateValue, setDateValue] = useState(formatForInput(scheduledAt));

  const handleApplyPreset = (hoursOffset: number, specificHour?: number) => {
    const d = new Date();
    d.setDate(d.getDate() + hoursOffset);
    if (specificHour !== undefined) {
      d.setHours(specificHour, 0, 0, 0);
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setDateValue(formatted);
    onChange(d.toISOString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDateValue(val);
    if (val) {
      const d = new Date(val);
      onChange(d.toISOString());
    } else {
      onChange(undefined);
    }
  };

  const handleClear = () => {
    onChange(undefined);
    if (onClose) onClose();
  };

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl space-y-3.5 w-full max-w-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Calendar className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-gray-900 dark:text-white">
            Lên lịch xuất bản bài viết
          </h4>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Presets */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <button
          type="button"
          onClick={() => handleApplyPreset(0, 20)}
          className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition-colors text-left font-medium"
        >
          🌙 Tối nay (20:00)
        </button>
        <button
          type="button"
          onClick={() => handleApplyPreset(1, 9)}
          className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition-colors text-left font-medium"
        >
          ☀️ Sáng mai (09:00)
        </button>
        <button
          type="button"
          onClick={() => handleApplyPreset(1, 12)}
          className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition-colors text-left font-medium"
        >
          🍜 Trưa mai (12:00)
        </button>
        <button
          type="button"
          onClick={() => handleApplyPreset(1, 20)}
          className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition-colors text-left font-medium"
        >
          🔥 Tối mai (20:00)
        </button>
      </div>

      {/* Datetime Input */}
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
          Chọn ngày & giờ tùy chỉnh:
        </label>
        <input
          type="datetime-local"
          value={dateValue}
          onChange={handleCustomChange}
          className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-gray-500 hover:text-red-500 transition-colors"
        >
          Hủy lên lịch
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Xác nhận</span>
          </button>
        )}
      </div>
    </div>
  );
};
